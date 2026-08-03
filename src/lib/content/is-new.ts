const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * True when `isoDate` is within the last `days` days (default 7).
 * Uses published_at when present, otherwise created_at.
 */
export function isNewWithinDays(
  isoDate: string | null | undefined,
  days = 7,
  nowMs: number = Date.now(),
): boolean {
  if (!isoDate) return false;
  const t = Date.parse(isoDate);
  if (!Number.isFinite(t)) return false;
  const age = nowMs - t;
  if (age < 0) return true;
  return age <= days * MS_PER_DAY;
}

export function videoIsNew(video: {
  created_at?: string | null;
  published_at?: string | null;
}): boolean {
  return isNewWithinDays(video.published_at || video.created_at);
}
