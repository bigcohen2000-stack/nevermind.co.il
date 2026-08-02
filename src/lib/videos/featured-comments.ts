import "server-only";

import {
  heartInsightsForVideo,
  type HeartInsight,
} from "@/lib/community/heart-insights";
import { createClient } from "@/lib/supabase/server";

export type FeaturedInvestigatorComment = {
  id: string;
  authorName: string | null;
  body: string;
  commentedAt?: string | null;
  timestampSeconds?: number | null;
  youtubeUrl?: string | null;
};

function fromHeartInsight(row: HeartInsight, index: number): FeaturedInvestigatorComment {
  return {
    id: row.commentId ?? `heart-${index}-${row.question.slice(0, 12)}`,
    authorName: row.authorName,
    body: row.question,
    commentedAt: row.commentedAt,
    timestampSeconds: row.timestampSeconds ?? null,
    youtubeUrl: row.youtubeUrl,
  };
}

/**
 * Curated creator-hearted comments for a video.
 * Prefers Supabase rows. Falls back to manual HEART_INSIGHTS list.
 * Cap: 3 under the player.
 */
export async function getFeaturedInvestigatorComments(input: {
  videoId: string;
  youtubeId?: string | null;
  limit?: number;
}): Promise<FeaturedInvestigatorComment[]> {
  const limit = Math.min(3, Math.max(1, input.limit ?? 3));

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("video_featured_comments")
      .select(
        "id, author_name, body, created_at, commented_at, timestamp_seconds, youtube_url",
      )
      .eq("video_id", input.videoId)
      .eq("is_creator_hearted", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data
        .filter((row) => typeof row.body === "string" && row.body.trim())
        .map((row) => ({
          id: row.id,
          authorName:
            typeof row.author_name === "string" && row.author_name.trim()
              ? row.author_name.trim()
              : null,
          body: row.body.trim(),
          commentedAt:
            (typeof row.commented_at === "string" && row.commented_at) ||
            row.created_at ||
            null,
          timestampSeconds:
            typeof row.timestamp_seconds === "number"
              ? row.timestamp_seconds
              : null,
          youtubeUrl:
            typeof row.youtube_url === "string" && row.youtube_url.trim()
              ? row.youtube_url.trim()
              : null,
        }));
    }
  } catch {
    // table / columns missing: fall through to static list
  }

  return heartInsightsForVideo({
    videoId: input.videoId,
    youtubeId: input.youtubeId,
    limit,
  }).map(fromHeartInsight);
}
