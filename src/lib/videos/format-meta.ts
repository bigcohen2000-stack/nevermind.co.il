/**
 * Format helpers for video browse meta (date / length).
 */

export function formatVideoDateHe(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDurationHe(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Prefer YouTube publish date, else library ingest date. */
export function videoDisplayDate(video: {
  published_at?: string | null;
  created_at?: string | null;
}): string | null {
  return formatVideoDateHe(video.published_at ?? video.created_at ?? null);
}

/** Single muted meta line: duration, date (plain punctuation). */
export function formatVideoMetaLine(video: {
  duration_seconds?: number | null;
  published_at?: string | null;
  created_at?: string | null;
}): string | null {
  const parts: string[] = [];
  const length = formatDurationHe(video.duration_seconds);
  const date = videoDisplayDate(video);
  if (length) parts.push(length);
  if (date) parts.push(date);
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Parse YouTube ISO-8601 duration (PT#H#M#S). */
export function parseYoutubeDuration(
  iso: string | null | undefined,
): number | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!m) return null;
  const seconds =
    Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
  return seconds > 0 ? seconds : null;
}
