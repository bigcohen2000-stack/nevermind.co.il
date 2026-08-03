import "server-only";

import {
  LIVE_ARCHIVE_PAGE_SIZE,
  PREVIOUS_LIVES,
} from "@/lib/live/previous-lives";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { presentVideosForClient } from "@/lib/videos/sanitize-public";
import type { Video } from "@/types/supabase";

const LIST_COLUMNS =
  "id, youtube_id, title, thumbnail_url, playlist_id, is_unlisted, is_gated, created_at, published_at, duration_seconds, breakdown_level" as const;

export type LiveArchiveItem = {
  video: Video;
  label: string | null;
  airedAt: string | null;
  likeCount: number;
  likedByMe: boolean;
};

function normalizeQuery(q?: string): string {
  return (q ?? "").trim().slice(0, 80);
}

/**
 * Load curated previous LIVE rows (order preserved), then fill with recent unlisted.
 */
export async function listLiveArchiveVideos(opts?: {
  q?: string;
  limit?: number;
  entitled?: boolean;
}): Promise<Video[]> {
  const limit = Math.min(
    48,
    Math.max(1, opts?.limit ?? LIVE_ARCHIVE_PAGE_SIZE),
  );
  const q = normalizeQuery(opts?.q).toLowerCase();
  const curatedIds = PREVIOUS_LIVES.map((e) => e.youtubeId.trim()).filter(
    Boolean,
  );

  try {
    const admin = getSupabaseAdmin();
    const byYoutube = new Map<string, Video>();

    if (curatedIds.length > 0) {
      const { data } = await admin
        .from("videos")
        .select(LIST_COLUMNS)
        .in("youtube_id", curatedIds);
      for (const row of data ?? []) {
        byYoutube.set(row.youtube_id, row as Video);
      }
    }

    const curatedOrdered: Video[] = [];
    for (const id of curatedIds) {
      const v = byYoutube.get(id);
      if (v) curatedOrdered.push(v);
    }

    const { data: unlisted } = await admin
      .from("videos")
      .select(LIST_COLUMNS)
      .or("is_unlisted.eq.true,is_gated.eq.true")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(80);

    const curatedSet = new Set(curatedOrdered.map((v) => v.id));
    const extras: Video[] = [];
    for (const row of unlisted ?? []) {
      const v = row as Video;
      if (curatedSet.has(v.id)) continue;
      extras.push(v);
    }

    let merged =
      curatedOrdered.length > 0 ? [...curatedOrdered, ...extras] : extras;

    if (q) {
      merged = merged.filter((v) => v.title.toLowerCase().includes(q));
    }

    return presentVideosForClient(merged.slice(0, limit), Boolean(opts?.entitled));
  } catch {
    return [];
  }
}

export async function getLiveLikeCounts(
  videoIds: string[],
): Promise<Map<string, number>> {
  const ids = [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))];
  const map = new Map<string, number>();
  if (ids.length === 0) return map;

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("live_video_like_counts")
      .select("video_id, like_count")
      .in("video_id", ids);

    if (error) return map;

    for (const row of data ?? []) {
      map.set(row.video_id, Number(row.like_count) || 0);
    }
  } catch {
    return map;
  }

  return map;
}

export async function getMyLiveLikedVideoIds(): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
      .from("live_video_likes")
      .select("video_id")
      .eq("user_id", user.id);

    if (error || !data) return new Set();
    return new Set(data.map((r) => r.video_id));
  } catch {
    return new Set();
  }
}

/**
 * Enrich archive videos with curated labels + like state.
 */
export async function getLiveArchiveItems(opts?: {
  q?: string;
  limit?: number;
  entitled?: boolean;
}): Promise<LiveArchiveItem[]> {
  const videos = await listLiveArchiveVideos(opts);
  const metaByYoutube = new Map(
    PREVIOUS_LIVES.map((e) => [
      e.youtubeId,
      { label: e.label ?? null, airedAt: e.airedAt ?? null },
    ]),
  );

  // After redaction youtube_id may be empty. Match curated labels via admin map.
  let idToYoutube = new Map<string, string>();
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("id, youtube_id")
      .in(
        "id",
        videos.map((v) => v.id),
      );
    idToYoutube = new Map(
      (data ?? []).map((r) => [r.id, r.youtube_id as string]),
    );
  } catch {
    idToYoutube = new Map();
  }

  const [counts, liked] = await Promise.all([
    getLiveLikeCounts(videos.map((v) => v.id)),
    getMyLiveLikedVideoIds(),
  ]);

  return videos.map((video) => {
    const yt = idToYoutube.get(video.id) ?? video.youtube_id;
    const meta = yt ? metaByYoutube.get(yt) : undefined;
    return {
      video,
      label: meta?.label ?? null,
      airedAt: meta?.airedAt ?? null,
      likeCount: counts.get(video.id) ?? 0,
      likedByMe: liked.has(video.id),
    };
  });
}

/** Top liked archive candidates for the free-registered LIVE pitch. */
export async function getLiveVoteLeaders(opts?: {
  limit?: number;
  entitled?: boolean;
}): Promise<LiveArchiveItem[]> {
  const items = await getLiveArchiveItems({
    limit: 48,
    entitled: opts?.entitled,
  });
  return [...items]
    .sort(
      (a, b) =>
        b.likeCount - a.likeCount ||
        a.video.title.localeCompare(b.video.title, "he"),
    )
    .filter((item) => item.likeCount > 0)
    .slice(0, opts?.limit ?? 5);
}
