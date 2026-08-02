/**
 * Public watch URLs and teaser presentation for members-only videos.
 * Guests get opaque UUID paths. YouTube ids stay server-side until entitled.
 */

import { isMembersOnlyVideo, type VideoAccessFlags } from "@/lib/videos/access";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** YouTube video id shape (11 chars). */
const YOUTUBE_ID_RE = /^[\w-]{11}$/;

export const GATED_LOCK_IMAGE = "/brand/gated-lock.svg";

export type WatchPathVideo = VideoAccessFlags & {
  id: string;
  youtube_id: string;
};

export function isUuidParam(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function isYoutubeIdParam(value: string): boolean {
  return YOUTUBE_ID_RE.test(value.trim());
}

/**
 * Href for cards / suggest / related.
 * Members-only → `/watch/{uuid}` so the address bar does not carry a YouTube id.
 */
export function getWatchHref(
  video: WatchPathVideo,
  opts?: { startSeconds?: number | null },
): string {
  const base = isMembersOnlyVideo(video)
    ? `/watch/${video.id}`
    : `/watch/${video.youtube_id || video.id}`;
  const t = opts?.startSeconds;
  if (t != null && t > 0 && !isMembersOnlyVideo(video)) {
    return `${base}?t=${Math.floor(t)}`;
  }
  return base;
}

/**
 * Thumbnail for list / teaser UI.
 * Guests never receive i.ytimg.com URLs that embed a YouTube id.
 */
export function getTeaserThumbSrc(
  video: WatchPathVideo & { thumbnail_url?: string | null },
  opts?: { entitled?: boolean; opaqueThumbPath?: string | null },
): string {
  if (isMembersOnlyVideo(video) && !opts?.entitled) {
    const opaque = opts?.opaqueThumbPath?.trim();
    if (
      opaque &&
      !opaque.includes("ytimg.com") &&
      !opaque.includes("youtube.com")
    ) {
      return opaque;
    }
    return GATED_LOCK_IMAGE;
  }
  if (video.thumbnail_url?.trim()) {
    const url = video.thumbnail_url.trim();
    if (
      isMembersOnlyVideo(video) &&
      (url.includes("ytimg.com") || url.includes("youtube.com"))
    ) {
      return GATED_LOCK_IMAGE;
    }
    return url;
  }
  if (video.youtube_id?.trim()) {
    return `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;
  }
  return GATED_LOCK_IMAGE;
}
