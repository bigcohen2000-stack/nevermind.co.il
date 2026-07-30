import { NextResponse } from "next/server";

import { getServerEnv } from "@/env";
import { syncYoutubeLibrary, type SyncInput } from "@/lib/youtube/sync";

export const runtime = "nodejs";
export const maxDuration = 60;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function extractSecret(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header) {
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token;
  }
  // Fallback for cron UIs that prefer a custom header
  return req.headers.get("x-cron-secret");
}

/**
 * POST /api/admin/sync
 *
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 *   — or —
 *   x-cron-secret: <CRON_SECRET>
 *
 * Body (all optional; falls back to env):
 * {
 *   "channelIds": ["UCxxxx"],
 *   "playlistIds": ["PLxxxx"],
 *   "unlistedVideoIds": ["dQw4w9WgXcQ"],
 *   "gatedVideoIds": ["abc123"]
 * }
 */
export async function POST(req: Request) {
  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    return NextResponse.json(
      {
        error: "Server environment invalid",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }

  const token = extractSecret(req);
  if (!token || token !== env.CRON_SECRET) {
    return unauthorized();
  }

  let body: SyncInput = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = (await req.json()) as SyncInput;
    }
  } catch {
    body = {};
  }

  try {
    const result = await syncYoutubeLibrary(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
