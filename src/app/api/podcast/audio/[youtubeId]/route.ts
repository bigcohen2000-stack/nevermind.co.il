import { NextResponse } from "next/server";

import {
  podcastAudioUserAgent,
  resolvePodcastAudioSource,
} from "@/lib/podcast/youtube-audio";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

type RouteParams = {
  params: Promise<{ youtubeId: string }>;
};

/**
 * Podcast enclosure endpoint for public catalog videos.
 *
 * Resolution order:
 * 1. PODCAST_AUDIO_CDN_TEMPLATE → stable hosted MP3 (recommended)
 * 2. YouTube InnerTube ANDROID player audio URL → proxy/redirect
 */
export async function GET(req: Request, { params }: RouteParams) {
  const { youtubeId: rawId } = await params;
  const youtubeId = rawId?.replace(/\.mp3$/i, "").trim() ?? "";

  if (!YOUTUBE_ID_RE.test(youtubeId)) {
    return NextResponse.json({ error: "Invalid youtube id" }, { status: 400 });
  }

  const allowed = await isPublicCatalogVideo(youtubeId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Video not found or not public" },
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
    headers.set("Cache-Control", "public, max-age=300");

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

async function isPublicCatalogVideo(youtubeId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("videos")
      .select("youtube_id")
      .eq("youtube_id", youtubeId)
      .eq("is_gated", false)
      .maybeSingle();
    return Boolean(data?.youtube_id);
  } catch {
    return false;
  }
}
