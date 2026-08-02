import "server-only";

import {
  CORE_MECHANISMS,
  collectCoreMechanisms,
  type CoreMechanism,
} from "@/lib/profile/core-mechanisms";
import {
  emptyProfileProgressStats,
  type ProfileProgressStats,
} from "@/lib/profile/progress-format";
import { createClient } from "@/lib/supabase/server";

export type { ProfileProgressStats } from "@/lib/profile/progress-format";
export {
  formatDiveDepthHours,
  formatMeetingDate,
} from "@/lib/profile/progress-format";

/**
 * Analytical progress for /profile. No gamification.
 * Each metric is loaded independently so a missing migration does not wipe the rest.
 */
export async function getProfileProgressStats(
  userId: string,
): Promise<ProfileProgressStats> {
  const supabase = await createClient();
  const stats = emptyProfileProgressStats();

  try {
    const { data: history } = await supabase
      .from("watch_history")
      .select("youtube_id")
      .eq("user_id", userId);

    const youtubeIds = (history ?? [])
      .map((row) => row.youtube_id)
      .filter(Boolean);

    if (youtubeIds.length > 0) {
      const { data: videos } = await supabase
        .from("videos")
        .select("id")
        .in("youtube_id", youtubeIds);

      const videoIds = (videos ?? []).map((v) => v.id).filter(Boolean);

      if (videoIds.length > 0) {
        const { data: links } = await supabase
          .from("video_concepts")
          .select("concept_id, concepts(name)")
          .in("video_id", videoIds);

        const names: string[] = [];
        for (const row of links ?? []) {
          const concept = row.concepts as
            | { name: string }
            | { name: string }[]
            | null;
          if (!concept) continue;
          if (Array.isArray(concept)) {
            for (const c of concept) {
              if (c?.name) names.push(c.name);
            }
          } else if (concept.name) {
            names.push(concept.name);
          }
        }
        const explored = collectCoreMechanisms(names);
        stats.exploredLabels = CORE_MECHANISMS.filter((m) => explored.has(m));
        stats.mechanismsExplored = stats.exploredLabels.length;
      }
    }
  } catch {
    // keep defaults
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("watch_time_seconds")
      .eq("id", userId)
      .maybeSingle();
    stats.watchTimeSeconds = Math.max(
      0,
      Number(profile?.watch_time_seconds ?? 0) || 0,
    );
  } catch {
    // column may be missing until migration
  }

  try {
    const { data: meeting } = await supabase
      .from("user_meetings")
      .select("held_at")
      .eq("user_id", userId)
      .order("held_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    stats.lastMeetingAt = meeting?.held_at ?? null;
  } catch {
    // table may be missing until migration
  }

  return stats;
}
