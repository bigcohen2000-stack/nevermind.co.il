import { NextResponse } from "next/server";

import {
  authenticateClubFeedToken,
  extractFeedTokenFromRequest,
} from "@/lib/club/feed-tokens";
import {
  podcastAudioUserAgent,
  resolvePodcastAudioSource,
} from "@/lib/podcast/youtube-audio";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

type RouteParams = {
  params: Promise<{ youtubeId: string }>;
};

/**
 * Token-gated audio enclosure for club vault episodes.
 * GET /api/club/podcast/audio/[youtubeId]?token=RAW
 */
export async function GET(req: Request, { params }: RouteParams) {
  const rawToken = extractFeedTokenFromRequest(req);
  const auth = await authenticateClubFeedToken(rawToken);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { youtubeId: rawId } = await params;
  const youtubeId = rawId?.replace(/\.mp3$/i, "").trim() ?? "";

  if (!YOUTUBE_ID_RE.test(youtubeId)) {
    return NextResponse.json({ error: "Invalid youtube id" }, { status: 400 });
  }

  const allowed = await isClubVaultVideo(youtubeId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Video not found in club vault" },
      { status: 404 },
    );
  }

  try {
    const source = await resolvePodcastAudioSource(youtubeId);
    if (!source) return audioUnavailable();

    if (source.kind === "cdn") {
      return NextResponse.redirect(source.url, 302);
    }

    const range = req.headers.get("range") ?? undefined;
    const upstream = await fetch(source.url, {
      headers: {
        "User-Agent": podcastAudioUserAgent(),
        ...(range ? { Range: range } : {}),
      },
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.redirect(source.url, 302);
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      source.contentType ||
        upstream.headers.get("content-type") ||
        "audio/mp4",
    );
    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("X-Robots-Tag", "noindex, nofollow");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return audioUnavailable();
  }
}

function audioUnavailable() {
  return NextResponse.json(
    {
      error: "Audio stream unavailable",
      hint: "Host MP3 files and set PODCAST_AUDIO_CDN_TEMPLATE=https://cdn.example.com/{id}.mp3 for reliable podcast clients.",
    },
    { status: 503 },
  );
}

async function isClubVaultVideo(youtubeId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("youtube_id, is_gated, is_unlisted")
      .eq("youtube_id", youtubeId)
      .maybeSingle();
    if (!data?.youtube_id) return false;
    return Boolean(data.is_gated || data.is_unlisted);
  } catch {
    return false;
  }
}
