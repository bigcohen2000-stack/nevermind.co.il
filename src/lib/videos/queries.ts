import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Concept, Video } from "@/types/supabase";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return Boolean(user);
}

export type SuggestItem =
  | { type: "video"; id: string; youtubeId: string; title: string; isGated: boolean }
  | { type: "concept"; id: string; name: string; category: string | null };

export async function suggestSearch(query: string): Promise<{
  items: SuggestItem[];
  concepts: Concept[];
}> {
  const q = query.trim();
  if (q.length < 1) {
    return { items: [], concepts: [] };
  }

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [{ data: videos }, { data: concepts }] = await Promise.all([
    supabase
      .from("videos")
      .select("id, youtube_id, title, is_gated")
      .ilike("title", pattern)
      .limit(8),
    supabase
      .from("concepts")
      .select("id, name, category")
      .ilike("name", pattern)
      .limit(8),
  ]);

  const items: SuggestItem[] = [
    ...(videos ?? []).map((v) => ({
      type: "video" as const,
      id: v.id,
      youtubeId: v.youtube_id,
      title: v.title,
      isGated: v.is_gated,
    })),
    ...(concepts ?? []).map((c) => ({
      type: "concept" as const,
      id: c.id,
      name: c.name,
      category: c.category,
    })),
  ];

  return { items, concepts: concepts ?? [] };
}

export async function listPublicVideos(limit = 24): Promise<Video[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getVideoByYoutubeId(youtubeId: string): Promise<Video | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("youtube_id", youtubeId)
    .maybeSingle();
  return data;
}

export async function getVideoConcepts(videoId: string): Promise<
  Array<{ name: string; start_timestamp: number | null; concept_id: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("video_concepts")
    .select("start_timestamp, concept_id, concepts(name)")
    .eq("video_id", videoId);

  if (!data) return [];

  return data.map((row) => {
    const concepts = row.concepts as { name: string } | { name: string }[] | null;
    const name = Array.isArray(concepts)
      ? concepts[0]?.name
      : concepts?.name;
    return {
      name: name ?? "",
      start_timestamp: row.start_timestamp,
      concept_id: row.concept_id,
    };
  });
}

export type RelatedVideo = Video & {
  startTimestamp: number | null;
  sharedConcept: string | null;
};

export async function getRelatedVideos(
  videoId: string,
  conceptIds: string[],
  playlistId: string | null,
  limit = 8,
): Promise<RelatedVideo[]> {
  const supabase = await createClient();
  const scored = new Map<
    string,
    { startTimestamp: number | null; sharedConcept: string | null }
  >();

  if (conceptIds.length > 0) {
    const { data: links } = await supabase
      .from("video_concepts")
      .select("video_id, start_timestamp, concept_id, concepts(name)")
      .in("concept_id", conceptIds)
      .neq("video_id", videoId)
      .limit(60);

    for (const row of links ?? []) {
      if (scored.has(row.video_id)) continue;
      const concepts = row.concepts as
        | { name: string }
        | { name: string }[]
        | null;
      const name = Array.isArray(concepts)
        ? concepts[0]?.name
        : concepts?.name;
      scored.set(row.video_id, {
        startTimestamp: row.start_timestamp,
        sharedConcept: name ?? null,
      });
    }
  }

  if (playlistId) {
    const { data: samePlaylist } = await supabase
      .from("videos")
      .select("id")
      .eq("playlist_id", playlistId)
      .neq("id", videoId)
      .limit(20);

    for (const row of samePlaylist ?? []) {
      if (!scored.has(row.id)) {
        scored.set(row.id, { startTimestamp: null, sharedConcept: null });
      }
    }
  }

  const ids = [...scored.keys()].slice(0, limit);
  if (ids.length === 0) return [];

  const { data: videos } = await supabase.from("videos").select("*").in("id", ids);
  if (!videos) return [];

  return videos.map((v) => ({
    ...v,
    startTimestamp: scored.get(v.id)?.startTimestamp ?? null,
    sharedConcept: scored.get(v.id)?.sharedConcept ?? null,
  }));
}

export async function searchVideos(query: string): Promise<Video[]> {
  const q = query.trim();
  const supabase = await createClient();
  if (!q) {
    return listPublicVideos(24);
  }

  const { data } = await supabase
    .from("videos")
    .select("*")
    .ilike("title", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(24);

  return data ?? [];
}
