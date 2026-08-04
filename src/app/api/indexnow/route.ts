import { NextResponse } from "next/server";

import { submitIndexNow } from "@/lib/seo/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function readBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.headers.get("x-cron-secret")?.trim() || null;
}

/**
 * Lightweight IndexNow ping for new/updated public URLs.
 *
 * POST /api/indexnow
 * Authorization: Bearer <CRON_SECRET>
 * Body: { "urls": ["https://nevermind.co.il/watch/...", "/articles/..."] }
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const token = readBearer(req);
  if (!secret || !token || token !== secret) {
    return unauthorized();
  }

  let urls: string[] = [];
  try {
    const body = (await req.json()) as { urls?: unknown };
    if (Array.isArray(body.urls)) {
      urls = body.urls.filter((u): u is string => typeof u === "string");
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await submitIndexNow(urls);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
