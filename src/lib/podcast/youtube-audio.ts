import "server-only";

type StreamFormat = {
  url?: string;
  mimeType?: string;
  bitrate?: number;
  audioQuality?: string;
};

export type ResolvedYoutubeAudio = {
  url: string;
  contentType?: string;
};

function defaultUserAgent() {
  return (
    process.env.PODCAST_YT_USER_AGENT?.trim() ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
}

/**
 * Resolve a streamable audio URL for a YouTube id (CDN template preferred).
 */
export async function resolvePodcastAudioSource(
  youtubeId: string,
): Promise<
  | { kind: "cdn"; url: string }
  | { kind: "youtube"; url: string; contentType?: string }
  | null
> {
  const cdnTemplate = process.env.PODCAST_AUDIO_CDN_TEMPLATE?.trim();
  if (cdnTemplate) {
    return {
      kind: "cdn",
      url: cdnTemplate.replaceAll("{id}", youtubeId),
    };
  }

  const resolved = await resolveYoutubeAudioUrl(youtubeId);
  if (!resolved) return null;
  return {
    kind: "youtube",
    url: resolved.url,
    contentType: resolved.contentType,
  };
}

export { defaultUserAgent as podcastAudioUserAgent };

async function resolveYoutubeAudioUrl(
  youtubeId: string,
): Promise<ResolvedYoutubeAudio | null> {
  const fromInnertube = await resolveViaInnertube(youtubeId);
  if (fromInnertube) return fromInnertube;
  return resolveViaWatchPage(youtubeId);
}

async function resolveViaInnertube(
  youtubeId: string,
): Promise<ResolvedYoutubeAudio | null> {
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
): Promise<ResolvedYoutubeAudio | null> {
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
): ResolvedYoutubeAudio | null {
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
