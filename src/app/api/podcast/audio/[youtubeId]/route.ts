import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

type RouteParams = {
  params: Promise<{ youtubeId: string }>;
};

type StreamFormat = {
  url?: string;
  mimeType?: string;
  bitrate?: number;
  audioQuality?: string;
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

  const cdnTemplate = process.env.PODCAST_AUDIO_CDN_TEMPLATE?.trim();
  if (cdnTemplate) {
    const url = cdnTemplate.replaceAll("{id}", youtubeId);
    return NextResponse.redirect(url, 302);
  }

  try {
    const resolved = await resolveYoutubeAudioUrl(youtubeId);
    if (!resolved) {
      return audioUnavailable();
    }

    const range = req.headers.get("range") ?? undefined;
    const upstream = await fetch(resolved.url, {
      headers: {
        "User-Agent": defaultUserAgent(),
        ...(range ? { Range: range } : {}),
      },
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.redirect(resolved.url, 302);
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      resolved.contentType ||
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

function defaultUserAgent() {
  return (
    process.env.PODCAST_YT_USER_AGENT?.trim() ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
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

type ResolvedAudio = {
  url: string;
  contentType?: string;
};

async function resolveYoutubeAudioUrl(
  youtubeId: string,
): Promise<ResolvedAudio | null> {
  const fromInnertube = await resolveViaInnertube(youtubeId);
  if (fromInnertube) return fromInnertube;
  return resolveViaWatchPage(youtubeId);
}

async function resolveViaInnertube(
  youtubeId: string,
): Promise<ResolvedAudio | null> {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": defaultUserAgent(),
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
            androidSdkVersion: 30,
            hl: "en",
            gl: "US",
          },
        },
        videoId: youtubeId,
        contentCheckOk: true,
        racyCheckOk: true,
      }),
    },
  );

  if (!res.ok) return null;
  const player = (await res.json()) as {
    streamingData?: {
      adaptiveFormats?: StreamFormat[];
      formats?: StreamFormat[];
    };
  };

  return pickBestAudio(player.streamingData);
}

async function resolveViaWatchPage(
  youtubeId: string,
): Promise<ResolvedAudio | null> {
  const page = await fetch(
    `https://www.youtube.com/watch?v=${youtubeId}&hl=en`,
    {
      headers: {
        "User-Agent": defaultUserAgent(),
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    },
  );
  if (!page.ok) return null;

  const html = await page.text();
  const marker = "ytInitialPlayerResponse";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;

  const eqIndex = html.indexOf("=", markerIndex);
  const start = html.indexOf("{", eqIndex);
  if (start < 0) return null;

  const jsonText = extractBalancedObject(html, start);
  if (!jsonText) return null;

  try {
    const player = JSON.parse(jsonText) as {
      streamingData?: {
        adaptiveFormats?: StreamFormat[];
        formats?: StreamFormat[];
      };
    };
    return pickBestAudio(player.streamingData);
  } catch {
    return null;
  }
}

function pickBestAudio(
  streamingData:
    | {
        adaptiveFormats?: StreamFormat[];
        formats?: StreamFormat[];
      }
    | undefined,
): ResolvedAudio | null {
  if (!streamingData) return null;
  const formats = [
    ...(streamingData.adaptiveFormats ?? []),
    ...(streamingData.formats ?? []),
  ];

  const audioFormats = formats
    .filter(
      (f) =>
        Boolean(f.url) &&
        typeof f.mimeType === "string" &&
        f.mimeType.startsWith("audio/"),
    )
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  const best = audioFormats[0];
  if (!best?.url) return null;

  return {
    url: best.url,
    contentType: best.mimeType?.split(";")[0] || "audio/mp4",
  };
}

function extractBalancedObject(source: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}
