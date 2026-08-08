import { NextResponse } from "next/server";

import { getServerEnv } from "@/env";
import { submitIndexNow } from "@/lib/seo/indexnow";
import { syncYoutubeLibrary, type SyncInput } from "@/lib/youtube/sync";

export const runtime = "nodejs";
/** Full library sync (hundreds of upserts) needs more than the default 60s. */
export const maxDuration = 300;

type SyncErrorCode =
  | "AUTH"
  | "ENV"
  | "EXTERNAL"
  | "INTERNAL"
  | "BAD_REQUEST";

function logSync(
  level: "info" | "warn" | "error",
  payload: Record<string, unknown>,
) {
  const line = JSON.stringify({
    scope: "api.admin.sync",
    ts: new Date().toISOString(),
    ...payload,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function jsonError(
  status: number,
  code: SyncErrorCode,
  error: string,
  details?: string,
) {
  logSync(status >= 500 ? "error" : "warn", {
    event: "sync_failed",
    code,
    status,
    error,
    details: details ?? null,
  });
  return NextResponse.json(
    { ok: false, code, error, details: details ?? null },
    { status },
  );
}

function extractSecret(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header) {
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token;
  }
  return req.headers.get("x-cron-secret");
}

function classifySyncError(err: unknown): {
  status: number;
  code: SyncErrorCode;
  message: string;
} {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (
    lower.includes("youtube") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("googleapis") ||
    lower.includes("fetch failed")
  ) {
    return { status: 502, code: "EXTERNAL", message };
  }

  return { status: 500, code: "INTERNAL", message };
}

async function runAuthorizedSync(req: Request, body: SyncInput = {}) {
  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    return jsonError(
      500,
      "ENV",
      "Server environment invalid",
      err instanceof Error ? err.message : String(err),
    );
  }

  const token = extractSecret(req);
  if (!token || token !== env.CRON_SECRET) {
    return jsonError(401, "AUTH", "Unauthorized");
  }

  logSync("info", {
    event: "sync_start",
    channelIds: body.channelIds?.length ?? null,
    playlistIds: body.playlistIds?.length ?? null,
  });

  try {
    const result = await syncYoutubeLibrary(body);
    const hasSoftErrors = result.errors.length > 0;
    logSync(hasSoftErrors ? "warn" : "info", {
      event: "sync_complete",
      upserted: result.upserted,
      transcriptsUpserted: result.transcriptsUpserted,
      softErrors: result.errors,
    });
    void submitIndexNow([
      "https://nevermind.co.il/videos",
      "https://nevermind.co.il/search",
    ]).catch(() => {
      /* IndexNow is best-effort after sync */
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const classified = classifySyncError(err);
    return jsonError(
      classified.status,
      classified.code,
      classified.message,
    );
  }
}

/**
 * GET /api/admin/sync
 * Used by Vercel Cron (Authorization: Bearer <CRON_SECRET>).
 */
export async function GET(req: Request) {
  return runAuthorizedSync(req);
}

/**
 * POST /api/admin/sync
 *
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 *   — or —
 *   x-cron-secret: <CRON_SECRET>
 */
export async function POST(req: Request) {
  let body: SyncInput = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = (await req.json()) as SyncInput;
    }
  } catch {
    body = {};
  }

  return runAuthorizedSync(req, body);
}
