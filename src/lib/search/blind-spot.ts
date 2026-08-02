import "server-only";

import { resolveBlindSpot } from "@/lib/search/blind-spot-map";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

export type BlindSpotRecommendation = {
  premise: string;
  opposite: string;
  tease: string;
  videos: Video[];
};

/**
 * If the search query maps to a blind-spot opposite, return 1–2 videos
 * tagged with (or titled like) that opposite concept.
 */
export async function getBlindSpotRecommendation(
  query: string,
  limit = 2,
): Promise<BlindSpotRecommendation | null> {
  const mapping = resolveBlindSpot(query);
  if (!mapping) return null;

  const videos = await findVideosForConcept(mapping.opposite, limit);
  if (videos.length === 0) return null;

  return {
    premise: mapping.premise,
    opposite: mapping.opposite,
    tease: mapping.tease,
    videos,
  };
}

async function findVideosForConcept(
  conceptName: string,
  limit: number,
): Promise<Video[]> {
  try {
    const supabase = await createClient();
    const terms = expandConceptTerms(conceptName);
    const orderedIds: string[] = [];
    const seen = new Set<string>();

    for (const term of terms) {
      if (orderedIds.length >= limit) break;
      const pattern = `%${term}%`;

      const { data: concepts } = await supabase
        .from("concepts")
        .select("id, name")
        .ilike("name", pattern)
        .limit(8);

      const conceptIds = (concepts ?? []).map((c) => c.id);

      if (conceptIds.length > 0) {
        const { data: links } = await supabase
          .from("video_concepts")
          .select("video_id")
          .in("concept_id", conceptIds)
          .limit(24);

        for (const row of links ?? []) {
          if (seen.has(row.video_id)) continue;
          seen.add(row.video_id);
          orderedIds.push(row.video_id);
          if (orderedIds.length >= limit) break;
        }
      }

      if (orderedIds.length >= limit) break;

      const { data: byTitle } = await supabase
        .from("videos")
        .select("id")
        .eq("is_gated", false)
        .ilike("title", pattern)
        .order("created_at", { ascending: false })
        .limit(limit * 2);

      for (const row of byTitle ?? []) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        orderedIds.push(row.id);
        if (orderedIds.length >= limit) break;
      }
    }

    if (orderedIds.length === 0) return [];

    const { data: videos } = await supabase
      .from("videos")
      .select("*")
      .in("id", orderedIds.slice(0, limit));

    if (!videos?.length) return [];

    const byId = new Map(videos.map((v) => [v.id, v]));
    return orderedIds
      .map((id) => byId.get(id))
      .filter((v): v is Video => Boolean(v))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** Full phrase first, then meaningful tokens (skip short connectors). */
function expandConceptTerms(conceptName: string): string[] {
  const full = conceptName.trim().replace(/\s+/g, " ");
  if (!full) return [];
  const tokens = full
    .split(/\s+/)
    .map((t) => t.replace(/^ו/, ""))
    .filter((t) => t.length >= 2 && t !== full);
  return [full, ...tokens];
}
