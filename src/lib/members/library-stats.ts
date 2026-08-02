import "server-only";

import { createClient } from "@supabase/supabase-js";

import { ARCHIVE_PRICING_ROWS } from "@/lib/content/offers";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildOpaqueThumbPath } from "@/lib/videos/thumb-token";
import type { Database, Video } from "@/types/supabase";

export type MembersLibraryStats = {
  /** Videos locked for the club (gated or unlisted). */
  clubVideos: number;
  /** Open / public videos. */
  publicVideos: number;
  /** All indexed videos. */
  totalVideos: number;
  /** Concepts in the search index. */
  concepts: number;
  /** Accounts with video access. */
  membersWithAccess: number;
  /** Archive pricing frames (from site data). */
  accessFrames: number;
};

export type MembersSampleVideo = Pick<
  Video,
  | "id"
  | "youtube_id"
  | "title"
  | "thumbnail_url"
  | "is_gated"
  | "is_unlisted"
  | "description"
>;

export type MembersLibraryPreview = {
  stats: MembersLibraryStats;
  clubSamples: MembersSampleVideo[];
  publicSamples: MembersSampleVideo[];
};

const EMPTY: MembersLibraryStats = {
  clubVideos: 0,
  publicVideos: 0,
  totalVideos: 0,
  concepts: 0,
  membersWithAccess: 0,
  accessFrames: ARCHIVE_PRICING_ROWS.length,
};

function createStatsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function headCount(
  promise: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await promise;
  if (error) return 0;
  return count ?? 0;
}

/**
 * Live library sizes for /members. Service role so gated/unlisted counts are exact.
 */
export async function getMembersLibraryStats(): Promise<MembersLibraryStats> {
  const client = createStatsClient();
  if (!client) return EMPTY;

  try {
    const [totalVideos, clubVideos, publicVideos, concepts] = await Promise.all([
      headCount(client.from("videos").select("*", { count: "exact", head: true })),
      headCount(
        client
          .from("videos")
          .select("*", { count: "exact", head: true })
          .or("is_gated.eq.true,is_unlisted.eq.true"),
      ),
      headCount(
        client
          .from("videos")
          .select("*", { count: "exact", head: true })
          .eq("is_gated", false)
          .eq("is_unlisted", false),
      ),
      headCount(
        client.from("concepts").select("*", { count: "exact", head: true }),
      ),
    ]);

    // Prefer has_video_access; fall back to legacy is_premium if migration 14 missing.
    let membersWithAccess = await headCount(
      client
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("has_video_access", true),
    );

    if (membersWithAccess === 0) {
      const premiumOnly = await headCount(
        client
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_premium", true),
      );
      // If has_video_access column is missing, the first query returns 0 via error path.
      membersWithAccess = premiumOnly;
    }

    return {
      totalVideos,
      clubVideos,
      publicVideos,
      concepts,
      membersWithAccess,
      accessFrames: ARCHIVE_PRICING_ROWS.length,
    };
  } catch {
    return EMPTY;
  }
}

const SAMPLE_FIELDS =
  "id, youtube_id, title, thumbnail_url, is_gated, is_unlisted, description" as const;

async function pickRandomPublic(
  client: NonNullable<ReturnType<typeof createStatsClient>>,
  total: number,
  limit: number,
): Promise<MembersSampleVideo[]> {
  if (total < 1 || limit < 1) return [];
  const picks = new Set<number>();
  const max = Math.min(limit, total);
  while (picks.size < max) {
    picks.add(Math.floor(Math.random() * total));
  }
  const rows: MembersSampleVideo[] = [];
  for (const offset of picks) {
    const { data } = await client
      .from("videos")
      .select(SAMPLE_FIELDS)
      .eq("is_gated", false)
      .eq("is_unlisted", false)
      .range(offset, offset)
      .maybeSingle();
    if (data) rows.push(data);
  }
  return rows;
}

/**
 * Counts + a few sample titles so /members visitors can see the split.
 */
export async function getMembersLibraryPreview(): Promise<MembersLibraryPreview> {
  const stats = await getMembersLibraryStats();
  const client = createStatsClient();
  if (!client) {
    return { stats, clubSamples: [], publicSamples: [] };
  }

  try {
    const { data: clubRows } = await client
      .from("videos")
      .select(SAMPLE_FIELDS)
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .order("created_at", { ascending: false })
      .limit(3);

    const clubSamples = (clubRows ?? []).map((row) => {
      if (!isMembersOnlyVideo(row)) return row;
      return {
        ...row,
        youtube_id: "",
        thumbnail_url: buildOpaqueThumbPath(row.id),
        description: null,
      };
    });

    const publicSamples = await pickRandomPublic(
      client,
      stats.publicVideos,
      3,
    );

    return { stats, clubSamples, publicSamples };
  } catch {
    return { stats, clubSamples: [], publicSamples: [] };
  }
}
