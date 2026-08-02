import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type StudioLibraryVideoRow = {
  id: string;
  title: string;
  youtube_id: string;
  is_gated: boolean;
  is_unlisted: boolean;
  teaser_youtube_id: string | null;
  created_at: string;
  published_at: string | null;
};

export type StudioLibraryStatus = {
  recentVideos: StudioLibraryVideoRow[];
  gatedWithoutTeaser: StudioLibraryVideoRow[];
};

/**
 * Recent library rows and gated/unlisted rows missing a teaser clip.
 */
export async function getStudioLibraryStatus(): Promise<StudioLibraryStatus> {
  const empty: StudioLibraryStatus = {
    recentVideos: [],
    gatedWithoutTeaser: [],
  };

  try {
    const admin = getSupabaseAdmin();
    const select =
      "id, title, youtube_id, is_gated, is_unlisted, teaser_youtube_id, created_at, published_at";

    const [recentRes, gapRes] = await Promise.all([
      admin
        .from("videos")
        .select(select)
        .order("created_at", { ascending: false })
        .limit(12),
      admin
        .from("videos")
        .select(select)
        .or("is_gated.eq.true,is_unlisted.eq.true")
        .is("teaser_youtube_id", null)
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

    return {
      recentVideos: (recentRes.data ?? []) as StudioLibraryVideoRow[],
      gatedWithoutTeaser: (gapRes.data ?? []) as StudioLibraryVideoRow[],
    };
  } catch {
    return empty;
  }
}
