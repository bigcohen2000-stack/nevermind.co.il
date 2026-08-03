import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type StudioFeaturedCommentRow = {
  id: string;
  video_id: string;
  youtube_id: string;
  video_title: string;
  author_name: string | null;
  body: string;
  sort_order: number;
  is_creator_hearted: boolean;
  timestamp_seconds: number | null;
  created_at: string;
};

export async function listStudioFeaturedComments(
  limit = 100,
): Promise<StudioFeaturedCommentRow[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("video_featured_comments")
      .select(
        "id, video_id, author_name, body, sort_order, is_creator_hearted, timestamp_seconds, created_at, videos!inner(youtube_id, title)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row) => {
      const video = row.videos as unknown as {
        youtube_id: string;
        title: string;
      };
      return {
        id: row.id,
        video_id: row.video_id,
        youtube_id: video.youtube_id,
        video_title: video.title,
        author_name: row.author_name,
        body: row.body,
        sort_order: row.sort_order,
        is_creator_hearted: row.is_creator_hearted,
        timestamp_seconds: row.timestamp_seconds,
        created_at: row.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function resolveVideoIdByYoutubeId(
  youtubeId: string,
): Promise<{ id: string; title: string } | null> {
  const id = youtubeId.trim();
  if (!id) return null;
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("videos")
      .select("id, title")
      .eq("youtube_id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
