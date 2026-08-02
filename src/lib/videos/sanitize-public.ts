import "server-only";

import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildOpaqueThumbPath } from "@/lib/videos/thumb-token";
import type { Video } from "@/types/supabase";

/**
 * Strip YouTube source identifiers from members-only rows before they
 * reach the client (RSC props, JSON, cards). Playback still resolves
 * youtube_id on the server after entitlement checks.
 */
export function redactMembersOnlySource(video: Video): Video {
  if (!isMembersOnlyVideo(video)) return video;
  return {
    ...video,
    youtube_id: "",
    // Teaser ids are only injected on the locked watch page, never in grids.
    teaser_youtube_id: null,
    thumbnail_url: buildOpaqueThumbPath(video.id),
    // Descriptions sometimes paste YouTube URLs. Keep title only for teasers.
    description: null,
  };
}

export function redactMembersOnlySources(videos: Video[]): Video[] {
  return videos.map(redactMembersOnlySource);
}

/**
 * When entitled, leave sources intact. Guests get redacted rows.
 */
export function presentVideosForClient(
  videos: Video[],
  entitled: boolean,
): Video[] {
  if (entitled) return videos;
  return redactMembersOnlySources(videos);
}
