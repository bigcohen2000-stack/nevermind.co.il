import "server-only";

import type { InvertCaptionHit } from "@/lib/search/types";
import { createClient } from "@/lib/supabase/server";
import {
  firstConceptOffsetSeconds,
  segmentsFromFlatTranscript,
  type TranscriptSegment,
} from "@/lib/videos/heatmap";
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

/** Full phrase first, then meaningful tokens (skip short connectors). */
export function expandConceptTerms(conceptName: string): string[] {
  const full = conceptName.trim().replace(/\s+/g, " ");
  if (!full) return [];
  const tokens = full
    .split(/\s+/)
    .map((t) => t.replace(/^ו/, ""))
    .filter((t) => t.length >= 2 && t !== full);
  return [full, ...tokens];
}

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

function parseStoredSegments(raw: unknown): TranscriptSegment[] {
  if (!Array.isArray(raw)) return [];
  const out: TranscriptSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!text) continue;
    out.push({
      offsetMs: Math.max(0, Math.round(Number(row.offsetMs) || 0)),
      durationMs: Math.max(0, Math.round(Number(row.durationMs) || 0)),
      text,
    });
  }
  return out;
}

type SegmentMatch = {
  startSeconds: number;
  snippet: string;
  score: number;
};

function bestSegmentMatch(
  terms: string[],
  segments: TranscriptSegment[],
): SegmentMatch | null {
  if (segments.length === 0 || terms.length === 0) return null;

  const primary = terms[0]!;
  let best: SegmentMatch | null = null;

  for (const seg of segments) {
    const lower = seg.text.toLowerCase();
    let score = 0;
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i]!.toLowerCase();
      if (term.length < 2) continue;
      if (!lower.includes(term)) continue;
      // Full phrase weighs more than token fragments.
      score += i === 0 ? 100 : 25;
    }
    if (score <= 0) continue;

    const startSeconds = Math.floor(Math.max(0, seg.offsetMs) / 1000);
    const candidate: SegmentMatch = {
      startSeconds,
      snippet: truncateSnippet(seg.text),
      score,
    };
    if (
      !best ||
      candidate.score > best.score ||
      (candidate.score === best.score &&
        candidate.startSeconds < best.startSeconds)
    ) {
      best = candidate;
    }
  }

  if (best) return best;

  // Fallback: first offset for the primary phrase (heatmap helper).
  const fallback = firstConceptOffsetSeconds(primary, segments);
  if (fallback == null) return null;
  const seg =
    segments.find(
      (s) => Math.floor(Math.max(0, s.offsetMs) / 1000) === fallback,
    ) ?? segments[0]!;
  return {
    startSeconds: fallback,
    snippet: truncateSnippet(seg.text),
    score: 1,
  };
}

function truncateSnippet(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
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
