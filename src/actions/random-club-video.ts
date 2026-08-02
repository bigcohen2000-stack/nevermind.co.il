"use server";

import { resolveVideoEntitlement } from "@/lib/club/access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getWatchHref } from "@/lib/videos/watch-path";

export type RandomClubVideoResult =
  | { ok: true; href: string; videoId: string }
  | { ok: false; error: string };

/**
 * Pick one random members-only video. Requires club / video entitlement.
 */
export async function getRandomClubVideo(): Promise<RandomClubVideoResult> {
  try {
    const access = await resolveVideoEntitlement();
    if (!access.entitled) {
      return {
        ok: false,
        error: "הכניסה למועדון נדרשת לפני בחירה אקראית מהמאגר.",
      };
    }

    const admin = getSupabaseAdmin();
    const { count, error: countError } = await admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .or("is_gated.eq.true,is_unlisted.eq.true");

    if (countError) {
      return { ok: false, error: countError.message };
    }

    const total = count ?? 0;
    if (total < 1) {
      return { ok: false, error: "אין סרטוני מועדון זמינים כרגע." };
    }

    const offset = Math.floor(Math.random() * total);
    const { data: video, error: videoError } = await admin
      .from("videos")
      .select("id, youtube_id, is_gated, is_unlisted")
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .range(offset, offset)
      .maybeSingle();

    if (videoError) {
      return { ok: false, error: videoError.message };
    }
    if (!video?.id) {
      return { ok: false, error: "אין סרטוני מועדון זמינים כרגע." };
    }

    return {
      ok: true,
      href: getWatchHref(video),
      videoId: video.id,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "בחירה אקראית נכשלה.",
    };
  }
}
