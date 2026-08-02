import type { HeatmapBucket } from "@/lib/videos/heatmap";
import { formatDiveMinutes } from "@/lib/videos/investigation";

export type ThoughtTurnPoint = {
  minute: number;
  startSeconds: number;
  concepts: string[];
};

/**
 * Peak concept-density minutes. Not YouTube retention.
 * Used as honest "thought turn" markers until Analytics exists.
 */
export function pickThoughtTurnPoints(
  buckets: HeatmapBucket[],
  limit = 3,
): ThoughtTurnPoint[] {
  const hot = buckets
    .filter((b) => b.density >= 0.65 && b.concepts.length > 0)
    .sort((a, b) => b.density - a.density || a.minute - b.minute);

  const picked: ThoughtTurnPoint[] = [];
  for (const b of hot) {
    if (picked.length >= limit) break;
    // Prefer spacing of at least 2 minutes between markers.
    if (picked.some((p) => Math.abs(p.minute - b.minute) < 2)) continue;
    picked.push({
      minute: b.minute,
      startSeconds: b.startSeconds,
      concepts: b.concepts.slice(0, 4),
    });
  }

  if (picked.length === 0) {
    const fallback = [...buckets]
      .filter((b) => b.concepts.length > 0)
      .sort((a, b) => b.density - a.density)
      .slice(0, Math.min(limit, 2));
    return fallback.map((b) => ({
      minute: b.minute,
      startSeconds: b.startSeconds,
      concepts: b.concepts.slice(0, 4),
    }));
  }

  return picked.sort((a, b) => a.minute - b.minute);
}

export function diveDepthCopy(durationSeconds: number | null | undefined): string | null {
  const minutes = formatDiveMinutes(durationSeconds);
  if (minutes == null) return null;
  return `עומק צלילה: ${minutes} דקות של ריכוז בנושא הזה בסרטון.`;
}
