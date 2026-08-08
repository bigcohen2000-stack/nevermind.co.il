export type ContinueWatchingItem = {
  youtubeId: string;
  progressSeconds: number;
  durationSeconds: number | null;
  title: string;
  thumbnailUrl: string | null;
  updatedAt: string;
};

export const VIDEO_PROGRESS_STORAGE_KEY = "nm_video_progress_v1";
export const VIDEO_COMPLETIONS_STORAGE_KEY = "nm_video_completions_v1";

/** Near-end threshold used for Continue Watching clear + "הושלם". */
export const COMPLETION_RATIO = 0.92;

export function isProgressComplete(
  progressSeconds: number,
  durationSeconds: number | null,
): boolean {
  if (!durationSeconds || durationSeconds <= 0) return false;
  return progressSeconds / durationSeconds >= COMPLETION_RATIO;
}

/** Ignore tiny starts and nearly-finished watches. */
export function shouldPersistProgress(
  progressSeconds: number,
  durationSeconds: number | null,
): boolean {
  if (progressSeconds < 5) return false;
  if (isProgressComplete(progressSeconds, durationSeconds)) return false;
  return true;
}

export function progressPercent(
  progressSeconds: number,
  durationSeconds: number | null,
): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));
}

export function formatWatchTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
