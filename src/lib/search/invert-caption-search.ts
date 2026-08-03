import "server-only";

import type { InvertCaptionHit } from "@/lib/search/types";
import { createClient } from "@/lib/supabase/server";
import {
  bestSegmentMatch,
  expandConceptTerms,
  parseStoredSegments,
} from "@/lib/search/transcript-snippet";
import { segmentsFromFlatTranscript } from "@/lib/videos/heatmap";
import { getWatchHref } from "@/lib/videos/watch-path";

type ScoredHit = InvertCaptionHit & { score: number };

/**
 * Search public transcript captions for opposite-concept terms.
 * Returns timestamped YouTube embeds for the best segment matches.
 */
export async function searchInvertedCaptions(
  opposite: string,
  limit = 1,
): Promise<InvertCaptionHit[]> {
  const capped = Math.max(1, Math.min(5, Math.floor(limit) || 1));
  const terms = expandConceptTerms(opposite);
  if (terms.length === 0) return [];

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const videoIds = await collectTranscriptVideoIds(supabase, terms, capped * 4);
  if (videoIds.length === 0) return [];

  const { data: transcripts } = await supabase
    .from("video_transcripts")
    .select("video_id, content, segments")
    .in("video_id", videoIds);

  const { data: videos } = await supabase
    .from("videos")
    .select("id, youtube_id, title, is_gated, is_unlisted")
    .in("id", videoIds)
    .eq("is_gated", false)
    .eq("is_unlisted", false);

  const videoById = new Map((videos ?? []).map((v) => [v.id, v]));
  const scored: ScoredHit[] = [];

  for (const row of transcripts ?? []) {
    const video = videoById.get(row.video_id);
    if (!video?.youtube_id) continue;

    let segments = parseStoredSegments(row.segments);
    if (segments.length === 0 && typeof row.content === "string") {
      const content = row.content.trim();
      if (content) {
        segments = segmentsFromFlatTranscript(content, 0);
      }
    }

    const best = bestSegmentMatch(terms, segments);
    if (!best) continue;

    const startSeconds = best.startSeconds;
    const embedUrl =
      startSeconds > 0
        ? `https://www.youtube.com/embed/${video.youtube_id}?start=${startSeconds}`
        : `https://www.youtube.com/embed/${video.youtube_id}`;
    const watchUrl = getWatchHref(
      {
        id: video.id,
        youtube_id: video.youtube_id,
        is_gated: video.is_gated,
        is_unlisted: video.is_unlisted,
      },
      { startSeconds },
    );

    scored.push({
      videoId: video.id,
      youtubeId: video.youtube_id,
      title: video.title,
      startSeconds,
      snippet: best.snippet,
      watchUrl,
      embedUrl,
      embedHtml: buildEmbedHtml(embedUrl, video.title),
      score: best.score,
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.startSeconds - b.startSeconds;
  });

  return scored.slice(0, capped).map(({ score: _score, ...hit }) => hit);
}

export { expandConceptTerms } from "@/lib/search/transcript-snippet";

type TranscriptClient = Awaited<ReturnType<typeof createClient>>;

async function collectTranscriptVideoIds(
  supabase: TranscriptClient,
  terms: string[],
  limit: number,
): Promise<string[]> {
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    if (ordered.length >= limit) break;
    const q = sanitizeSearchQuery(term);
    if (q.length < 2) continue;

    const { data } = await supabase
      .from("video_transcripts")
      .select("video_id")
      .textSearch("search_vector", q, { config: "simple", type: "plain" })
      .limit(limit);

    for (const row of data ?? []) {
      if (seen.has(row.video_id)) continue;
      seen.add(row.video_id);
      ordered.push(row.video_id);
      if (ordered.length >= limit) break;
    }
  }

  return ordered;
}

function sanitizeSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(/[^\p{L}\p{N}\s\-']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildEmbedHtml(embedUrl: string, title: string): string {
  const safeTitle = escapeAttr(title || "NeverMind");
  const safeSrc = escapeAttr(embedUrl);
  return `<iframe src="${safeSrc}" title="${safeTitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
