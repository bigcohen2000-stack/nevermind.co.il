/**
 * Parse watch URL `t` values: `105`, `105s`, `1m45s`, `1h2m3s`.
 */
export function parseTimestampParam(t: string | undefined): number {
  if (!t) return 0;
  const trimmed = t.trim();
  if (!trimmed) return 0;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  const hms = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i.exec(trimmed);
  if (hms && (hms[1] || hms[2] || hms[3])) {
    const hours = Number(hms[1] ?? 0);
    const minutes = Number(hms[2] ?? 0);
    const seconds = Number(hms[3] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

/** Prefer readable `1m45s`, fall back to plain seconds under one minute. */
export function formatTimestampParam(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? `${minutes}m` : ""}${seconds > 0 ? `${seconds}s` : ""}`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
  }
  return String(seconds);
}

/** Display label for UI chips: `2:05` (m:ss or h:mm:ss). */
export function formatTimestampLabel(
  totalSeconds: number | null | undefined,
): string | null {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return null;
  }
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
