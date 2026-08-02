import { NextResponse } from "next/server";

import { getServerEnv } from "@/env";
import { broadcastDailyReset } from "@/lib/push/web-push";

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
  return req.headers.get("x-cron-secret");
}

/**
 * GET /api/push/daily-reset
 * Vercel Cron (Authorization: Bearer <CRON_SECRET>) broadcasts one short quote
 * from transcripts to all Web Push subscribers.
 */
export async function GET(req: Request) {
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

  try {
    const result = await broadcastDailyReset();
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

/** Same handler for manual POST triggers. */
export async function POST(req: Request) {
  return GET(req);
}
