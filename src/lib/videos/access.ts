/**
 * Members-only video rule for NeverMind.
 *
 * Source of truth for locking:
 * - YouTube "unlisted" (לא רשום) → always locked for the public
 * - Explicit is_gated flag → locked
 *
 * Public / listed videos stay open. Access opens only with has_video_access.
 */

export type VideoAccessFlags = {
  is_gated?: boolean | null;
  is_unlisted?: boolean | null;
};

/** True when the video must stay behind the members lock for non-entitled users. */
export function isMembersOnlyVideo(video: VideoAccessFlags): boolean {
  return Boolean(video.is_gated) || Boolean(video.is_unlisted);
}
