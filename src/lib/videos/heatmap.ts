/**
 * Transcript Heatmap: concept density per minute of video.
 */

export type TranscriptSegment = {
  offsetMs: number;
  durationMs: number;
  text: string;
};

export type HeatConcept = {
  name: string;
  startTimestamp: number | null;
};

export type HeatmapBucket = {
  /** Zero-based minute index. */
  minute: number;
  startSeconds: number;
  endSeconds: number;
  /** Unique concept names matched in this minute. */
  concepts: string[];
  /** 0..1 relative density vs the hottest minute on this video. */
  density: number;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function durationSecondsFromSegments(segments: TranscriptSegment[]): number {
  let maxMs = 0;
  for (const seg of segments) {
    const end = seg.offsetMs + Math.max(0, seg.durationMs);
    if (end > maxMs) maxMs = end;
  }
  return Math.max(60, Math.ceil(maxMs / 1000));
}

function matchConceptsInText(text: string, conceptNames: string[]): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const name of conceptNames) {
    const needle = normalizeName(name);
    if (needle.length < 2) continue;
    if (lower.includes(needle)) hits.push(name);
  }
  return hits;
}

/**
 * Build one bucket per minute. Density comes from unique matched concepts
 * (caption text overlap + optional start_timestamp anchors).
 */
export function buildTranscriptHeatmap(
  segments: TranscriptSegment[],
  concepts: HeatConcept[],
  durationHintSeconds?: number | null,
): HeatmapBucket[] {
  const conceptNames = [
    ...new Set(
      concepts
        .map((c) => c.name.trim())
        .filter((n) => n.length > 0),
    ),
  ];

  if (conceptNames.length === 0 && segments.length === 0) {
    return [];
  }

  const fromConcepts = concepts.reduce((max, c) => {
    if (c.startTimestamp != null && c.startTimestamp > max) {
      return c.startTimestamp;
    }
    return max;
  }, 0);

  const durationSec = Math.max(
    durationHintSeconds && durationHintSeconds > 0
      ? Math.ceil(durationHintSeconds)
      : 0,
    durationSecondsFromSegments(segments),
    fromConcepts > 0 ? fromConcepts + 60 : 0,
    60,
  );

  const minuteCount = Math.max(1, Math.ceil(durationSec / 60));
  const buckets: Array<{ concepts: Set<string> }> = Array.from(
    { length: minuteCount },
    () => ({ concepts: new Set<string>() }),
  );

  for (const seg of segments) {
    const startSec = Math.max(0, seg.offsetMs / 1000);
    const endSec = Math.max(
      startSec,
      (seg.offsetMs + Math.max(seg.durationMs, 1)) / 1000,
    );
    const startMin = Math.min(minuteCount - 1, Math.floor(startSec / 60));
    const endMin = Math.min(minuteCount - 1, Math.floor(endSec / 60));
    const hits = matchConceptsInText(seg.text, conceptNames);
    for (let m = startMin; m <= endMin; m += 1) {
      for (const hit of hits) buckets[m]!.concepts.add(hit);
    }
  }

  // Flat transcript fallback: distribute text proportionally when no timed chunks.
  if (segments.length === 0 && conceptNames.length > 0) {
    /* no-op here: caller may pass a synthetic single segment */
  }

  for (const concept of concepts) {
    if (concept.startTimestamp == null || concept.startTimestamp < 0) continue;
    const m = Math.min(
      minuteCount - 1,
      Math.floor(concept.startTimestamp / 60),
    );
    buckets[m]!.concepts.add(concept.name.trim());
  }

  let maxCount = 0;
  for (const b of buckets) {
    maxCount = Math.max(maxCount, b.concepts.size);
  }

  return buckets.map((b, minute) => {
    const conceptsList = [...b.concepts].sort((a, c) => a.localeCompare(c, "he"));
    const count = conceptsList.length;
    return {
      minute,
      startSeconds: minute * 60,
      endSeconds: Math.min(durationSec, (minute + 1) * 60),
      concepts: conceptsList,
      density: maxCount > 0 ? count / maxCount : 0,
    };
  });
}

/**
 * When only flat caption text exists, invent equal time slices for matching.
 */
export function segmentsFromFlatTranscript(
  content: string,
  durationSeconds: number,
): TranscriptSegment[] {
  const text = content.replace(/\s+/g, " ").trim();
  if (!text) return [];
  const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
  const words = text.split(" ");
  const per = Math.max(1, Math.ceil(words.length / minutes));
  const out: TranscriptSegment[] = [];
  for (let i = 0; i < minutes; i += 1) {
    const slice = words.slice(i * per, (i + 1) * per).join(" ");
    if (!slice) continue;
    out.push({
      offsetMs: i * 60_000,
      durationMs: 60_000,
      text: slice,
    });
  }
  return out;
}

/** Heat fill: muted gray → brand action red (NeverMind tokens, no purple). */
export function heatColor(density: number): string {
  const d = Math.max(0, Math.min(1, density));
  if (d <= 0) return "rgba(156, 163, 175, 0.22)";
  const alpha = 0.22 + d * 0.78;
  return `rgba(212, 43, 43, ${alpha.toFixed(3)})`;
}

export function formatMinuteLabel(startSeconds: number): string {
  const m = Math.floor(startSeconds / 60);
  const s = startSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * First caption hit for a concept name (seconds), or null if not found.
 */
export function firstConceptOffsetSeconds(
  conceptName: string,
  segments: TranscriptSegment[],
): number | null {
  const needle = conceptName.trim().toLowerCase();
  if (needle.length < 2 || segments.length === 0) return null;
  for (const seg of segments) {
    if (seg.text.toLowerCase().includes(needle)) {
      return Math.floor(Math.max(0, seg.offsetMs) / 1000);
    }
  }
  return null;
}
