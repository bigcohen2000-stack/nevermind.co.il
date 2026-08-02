import { NextResponse } from "next/server";

import { buildPodcastRssXml } from "@/lib/podcast/build-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Dynamic podcast RSS 2.0 feed (iTunes tags via `podcast` package).
 * GET /api/podcast.xml
 */
export async function GET() {
  try {
    const xml = await buildPodcastRssXml();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to build podcast feed", details: message },
      { status: 500 },
    );
  }
}
