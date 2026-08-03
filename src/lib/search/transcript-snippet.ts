import "server-only";

import {
  firstConceptOffsetSeconds,
  segmentsFromFlatTranscript,
  type TranscriptSegment,
} from "@/lib/videos/heatmap";

export type CaptionSnippetMatch = {
  startSeconds: number;
  snippet: string;
  score: number;
};

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

export function parseStoredSegments(raw: unknown): TranscriptSegment[] {
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

export function truncateSnippet(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
}

/**
 * Best caption chunk matching query terms (full phrase weighs more).
 */
export function bestSegmentMatch(
  terms: string[],
  segments: TranscriptSegment[],
): CaptionSnippetMatch | null {
  if (segments.length === 0 || terms.length === 0) return null;

  const primary = terms[0]!;
  let best: CaptionSnippetMatch | null = null;

  for (const seg of segments) {
    const lower = seg.text.toLowerCase();
    let score = 0;
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i]!.toLowerCase();
      if (term.length < 2) continue;
      if (!lower.includes(term)) continue;
      score += i === 0 ? 100 : 25;
    }
    if (score <= 0) continue;

    const startSeconds = Math.floor(Math.max(0, seg.offsetMs) / 1000);
    const candidate: CaptionSnippetMatch = {
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

/**
 * Resolve a display snippet for one transcript row against a search query.
 */
export function matchTranscriptSnippet(
  query: string,
  content: string | null | undefined,
  segmentsRaw: unknown,
): CaptionSnippetMatch | null {
  const terms = expandConceptTerms(query);
  if (terms.length === 0) return null;

  let segments = parseStoredSegments(segmentsRaw);
  if (segments.length === 0 && typeof content === "string" && content.trim()) {
    segments = segmentsFromFlatTranscript(content.trim(), 0);
  }
  return bestSegmentMatch(terms, segments);
}
