import { NextResponse } from "next/server";

import {
  authenticateClubFeedToken,
  extractFeedTokenFromRequest,
} from "@/lib/club/feed-tokens";
import { buildClubPodcastRssXml } from "@/lib/podcast/build-club-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Private club vault podcast RSS.
 * GET /api/club/podcast.xml?token=RAW
 */
export async function GET(req: Request) {
  const rawToken = extractFeedTokenFromRequest(req);
  const auth = await authenticateClubFeedToken(rawToken);
  if (!auth || !rawToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const xml = await buildClubPodcastRssXml(rawToken);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to build club podcast feed", details: message },
      { status: 500 },
    );
  }
}
