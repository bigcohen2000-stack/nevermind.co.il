import { NextResponse } from "next/server";

import { getServerEnv } from "@/env";
import { broadcastTopicAlerts } from "@/lib/notifications/topic-alerts";

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
 * GET /api/cron/topic-alerts
 * Match new videos to user topic prefs and email interested users.
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
    const result = await broadcastTopicAlerts();
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

export async function POST(req: Request) {
  return GET(req);
}
