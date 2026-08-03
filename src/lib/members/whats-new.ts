import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getWatchHref } from "@/lib/videos/watch-path";

export type WhatsNewVideo = {
  id: string;
  title: string;
  youtube_id: string;
  published_at: string | null;
  created_at: string;
  href: string;
};

/**
 * Recent gated/unlisted videos for a club member, newest first.
 * Excludes videos already logged in club_watch_events for this phone.
 */
export async function getClubWhatsNew(input: {
  phone: string | null;
  limit?: number;
}): Promise<WhatsNewVideo[]> {
  const phone = input.phone?.trim();
  if (!phone) return [];

  const limit = Math.min(Math.max(input.limit ?? 12, 1), 40);

  try {
    const admin = getSupabaseAdmin();

    const { data: member } = await admin
      .from("club_members")
      .select("phone, last_seen_at")
      .eq("phone", phone)
      .maybeSingle();
    if (!member) return [];

    const sinceIso =
      member.last_seen_at ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: watched } = await admin
      .from("club_watch_events")
      .select("video_id")
      .eq("phone", phone)
      .limit(500);

    const watchedIds = new Set(
      (watched ?? []).map((row) => row.video_id).filter(Boolean),
    );

    const { data: videos } = await admin
      .from("videos")
      .select("id, title, youtube_id, published_at, created_at, is_gated, is_unlisted")
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(80);

    const out: WhatsNewVideo[] = [];
    for (const row of videos ?? []) {
      if (watchedIds.has(row.id)) continue;
      const stamp = row.published_at ?? row.created_at;
      if (stamp && new Date(stamp).getTime() < new Date(sinceIso).getTime()) {
        // Still include a few recent unwatched even if before last_seen,
        // but prefer ones after last_seen. Skip old ones past 60 days.
        const ageMs = Date.now() - new Date(stamp).getTime();
        if (ageMs > 60 * 24 * 60 * 60 * 1000) continue;
      }
      out.push({
        id: row.id,
        title: row.title,
        youtube_id: row.youtube_id,
        published_at: row.published_at,
        created_at: row.created_at,
        href: getWatchHref({
          id: row.id,
          youtube_id: row.youtube_id,
          is_gated: row.is_gated,
          is_unlisted: row.is_unlisted,
        }),
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
