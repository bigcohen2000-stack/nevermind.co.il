"use server";

import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

export type PremiumStatus = {
  isAuthenticated: boolean;
  isPremium: boolean;
  hasVideoAccess: boolean;
  userId: string | null;
};

/**
 * Resolve video entitlement from profiles.has_video_access
 * (legacy: is_premium still counts as access during transition).
 *
 * Admin grant (Supabase SQL editor / service role). No client path:
 *
 *   update public.profiles
 *   set has_video_access = true, updated_at = now()
 *   where id = (
 *     select id from auth.users where email = 'user@example.com' limit 1
 *   );
 *
 * RLS: users can read their own profile and insert a stub with
 * has_video_access = false. They cannot update the flag.
 * Unlock is enforced in the app (watch page + this helper).
 */
export async function getPremiumStatus(): Promise<PremiumStatus> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        isPremium: false,
        hasVideoAccess: false,
        userId: null,
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, has_video_access")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        is_premium: false,
        has_video_access: false,
      });
      return {
        isAuthenticated: true,
        isPremium: false,
        hasVideoAccess: false,
        userId: user.id,
      };
    }

    const hasVideoAccess =
      Boolean(profile.has_video_access) || Boolean(profile.is_premium);

    return {
      isAuthenticated: true,
      isPremium: hasVideoAccess,
      hasVideoAccess,
      userId: user.id,
    };
  } catch {
    return {
      isAuthenticated: false,
      isPremium: false,
      hasVideoAccess: false,
      userId: null,
    };
  }
}

export type GatedBonusVideo = Pick<
  Video,
  "id" | "youtube_id" | "title" | "thumbnail_url" | "is_gated" | "is_unlisted"
> & {
  sharedConcept: string | null;
};

/**
 * For members with video access: gated videos that share concepts
 * with the finished video.
 *
 * RLS hides gated rows (and their video_concepts) from anon/authenticated.
 * After entitlement check, resolve links + metadata via service role.
 */
export async function getGatedBonusVideos(
  videoId: string,
  conceptIds: string[],
  limit = 2,
): Promise<GatedBonusVideo[]> {
  try {
    const status = await getPremiumStatus();
    if (!status.hasVideoAccess) return [];

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();
    const scored = new Map<string, string | null>();

    if (conceptIds.length > 0) {
      const { data: links } = await admin
        .from("video_concepts")
        .select("video_id, concepts(name)")
        .in("concept_id", conceptIds)
        .neq("video_id", videoId)
        .limit(80);

      for (const row of links ?? []) {
        if (scored.has(row.video_id)) continue;
        const concepts = row.concepts as
          | { name: string }
          | { name: string }[]
          | null;
        const name = Array.isArray(concepts)
          ? concepts[0]?.name
          : concepts?.name;
        scored.set(row.video_id, name ?? null);
      }
    }

    const ids = [...scored.keys()];
    if (ids.length === 0) return [];

    const { data: videos } = await admin
      .from("videos")
      .select("id, youtube_id, title, thumbnail_url, is_gated, is_unlisted")
      .in("id", ids)
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .limit(limit);

    if (!videos?.length) return [];

    return videos.map((v) => ({
      ...v,
      sharedConcept: scored.get(v.id) ?? null,
    }));
  } catch {
    return [];
  }
}
