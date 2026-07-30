import "server-only";

import { google, type youtube_v3 } from "googleapis";

import { getServerEnv, splitCsv } from "@/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SyncInput = {
  /** YouTube channel IDs — syncs their public uploads playlist. */
  channelIds?: string[];
  /** Explicit playlist IDs (public or unlisted playlists reachable by API key). */
  playlistIds?: string[];
  /**
   * Explicit video IDs that are unlisted (or otherwise missing from public
   * channel listings). Fetched via videos.list in pages of 50.
   */
  unlistedVideoIds?: string[];
  /** Force these youtube_ids to is_gated=true after upsert. */
  gatedVideoIds?: string[];
};

export type SyncResult = {
  upserted: number;
  youtubeIds: string[];
  gatedCount: number;
  unlistedCount: number;
  conceptsLinked: number;
  errors: string[];
};

type CollectedVideo = {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  playlistId: string | null;
  isUnlisted: boolean;
  isGated: boolean;
  tags: string[];
};

function thumbnailFromSnippet(
  snippet: youtube_v3.Schema$VideoSnippet | youtube_v3.Schema$PlaylistItemSnippet | null | undefined,
): string | null {
  return (
    snippet?.thumbnails?.high?.url ??
    snippet?.thumbnails?.medium?.url ??
    snippet?.thumbnails?.default?.url ??
    null
  );
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "your",
  "של",
  "את",
  "על",
  "עם",
  "או",
  "זה",
  "זו",
  "הוא",
  "היא",
  "לא",
  "גם",
  "כי",
  "כל",
  "יש",
  "מה",
  "איך",
  "בין",
]);

/** Keywords from YouTube tags + Hebrew/Latin tokens in title/description. */
export function extractKeywords(
  title: string,
  description: string,
  tags: string[] = [],
): string[] {
  const unique = new Set<string>();

  for (const tag of tags) {
    const cleaned = tag.trim().slice(0, 64);
    if (cleaned.length >= 2) unique.add(cleaned);
  }

  const text = `${title}\n${description}`;
  const matches = text.match(/[\u0590-\u05FFa-zA-Z]{3,}/g) ?? [];
  for (const raw of matches) {
    const lower = raw.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;
    unique.add(raw.slice(0, 64));
    if (unique.size >= 12) break;
  }

  return [...unique];
}

async function upsertConceptsForVideo(
  videoUuid: string,
  keywords: string[],
): Promise<number> {
  if (keywords.length === 0) return 0;
  const admin = getSupabaseAdmin();
  let linked = 0;

  for (const name of keywords) {
    const { data: concept, error } = await admin
      .from("concepts")
      .upsert({ name, category: null }, { onConflict: "name" })
      .select("id")
      .single();

    if (error || !concept) continue;

    const { error: linkError } = await admin.from("video_concepts").upsert(
      {
        video_id: videoUuid,
        concept_id: concept.id,
        start_timestamp: null,
      },
      { onConflict: "video_id,concept_id" },
    );

    if (!linkError) linked += 1;
  }

  return linked;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function mergeCollected(
  map: Map<string, CollectedVideo>,
  row: CollectedVideo,
): void {
  const existing = map.get(row.youtubeId);
  if (!existing) {
    map.set(row.youtubeId, row);
    return;
  }
  map.set(row.youtubeId, {
    ...existing,
    isGated: existing.isGated || row.isGated,
    isUnlisted: existing.isUnlisted || row.isUnlisted,
    playlistId: row.playlistId ?? existing.playlistId,
    tags: [...new Set([...existing.tags, ...row.tags])],
    title: existing.title || row.title,
    description: existing.description || row.description,
    thumbnailUrl: existing.thumbnailUrl ?? row.thumbnailUrl,
  });
}

export async function syncYoutubeLibrary(
  options: SyncInput = {},
): Promise<SyncResult> {
  const env = getServerEnv();
  const gatedPlaylists = new Set(splitCsv(env.GATED_PLAYLIST_IDS));

  const channelIds =
    options.channelIds?.length
      ? options.channelIds
      : splitCsv(env.YOUTUBE_CHANNEL_IDS);
  const playlistIds =
    options.playlistIds?.length
      ? options.playlistIds
      : splitCsv(env.YOUTUBE_PLAYLIST_IDS);
  const unlistedVideoIds =
    options.unlistedVideoIds?.length
      ? options.unlistedVideoIds
      : splitCsv(process.env.YOUTUBE_UNLISTED_VIDEO_IDS ?? "");
  const gatedVideoIds = new Set([
    ...(options.gatedVideoIds ?? []),
    ...splitCsv(process.env.YOUTUBE_GATED_VIDEO_IDS ?? ""),
  ]);

  const youtube = google.youtube({
    version: "v3",
    auth: env.YOUTUBE_API_KEY,
  });

  const admin = getSupabaseAdmin();
  const result: SyncResult = {
    upserted: 0,
    youtubeIds: [],
    gatedCount: 0,
    unlistedCount: 0,
    conceptsLinked: 0,
    errors: [],
  };

  const byId = new Map<string, CollectedVideo>();

  // --- Channels → uploads playlists -----------------------------------------
  const resolvedPlaylists = new Set(playlistIds);
  for (const channelId of channelIds) {
    try {
      const channelRes = await youtube.channels.list({
        part: ["contentDetails"],
        id: [channelId],
      });
      const uploads =
        channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (uploads) resolvedPlaylists.add(uploads);
      else result.errors.push(`channel ${channelId}: uploads playlist missing`);
    } catch (err) {
      result.errors.push(
        `channel ${channelId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // --- Playlists (paginated) — public + unlisted items when API can see them
  for (const playlistId of resolvedPlaylists) {
    let pageToken: string | undefined;
    do {
      try {
        const listRes = await youtube.playlistItems.list({
          part: ["snippet", "status", "contentDetails"],
          playlistId,
          maxResults: 50,
          pageToken,
        });

        for (const item of listRes.data.items ?? []) {
          const youtubeId =
            item.contentDetails?.videoId ??
            item.snippet?.resourceId?.videoId ??
            undefined;
          if (!youtubeId) continue;

          const privacy = item.status?.privacyStatus;
          if (privacy === "private") continue;

          const isUnlisted = privacy === "unlisted";
          const isGated =
            gatedPlaylists.has(playlistId) || gatedVideoIds.has(youtubeId);

          mergeCollected(byId, {
            youtubeId,
            title: item.snippet?.title?.trim() || youtubeId,
            description: item.snippet?.description ?? "",
            thumbnailUrl: thumbnailFromSnippet(item.snippet),
            playlistId,
            isUnlisted,
            isGated,
            tags: [],
          });
        }

        pageToken = listRes.data.nextPageToken ?? undefined;
      } catch (err) {
        result.errors.push(
          `playlist ${playlistId}: ${err instanceof Error ? err.message : String(err)}`,
        );
        break;
      }
    } while (pageToken);
  }

  // --- Explicit unlisted (or any) video IDs — videos.list in chunks of 50 ----
  for (const ids of chunk(unlistedVideoIds, 50)) {
    try {
      const videosRes = await youtube.videos.list({
        part: ["snippet", "status"],
        id: ids,
        maxResults: 50,
      });

      for (const item of videosRes.data.items ?? []) {
        const youtubeId = item.id;
        if (!youtubeId) continue;
        if (item.status?.privacyStatus === "private") continue;

        const isUnlisted =
          item.status?.privacyStatus === "unlisted" ||
          unlistedVideoIds.includes(youtubeId);

        mergeCollected(byId, {
          youtubeId,
          title: item.snippet?.title?.trim() || youtubeId,
          description: item.snippet?.description ?? "",
          thumbnailUrl: thumbnailFromSnippet(item.snippet),
          playlistId: null,
          isUnlisted,
          isGated: gatedVideoIds.has(youtubeId),
          tags: item.snippet?.tags ?? [],
        });
      }
    } catch (err) {
      result.errors.push(
        `videos.list [${ids.join(",")}]: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Enrich playlist-sourced rows with tags via videos.list (batched)
  const needsTags = [...byId.values()]
    .filter((v) => v.tags.length === 0)
    .map((v) => v.youtubeId);

  for (const ids of chunk(needsTags, 50)) {
    try {
      const videosRes = await youtube.videos.list({
        part: ["snippet", "status"],
        id: ids,
      });
      for (const item of videosRes.data.items ?? []) {
        if (!item.id) continue;
        const existing = byId.get(item.id);
        if (!existing) continue;
        mergeCollected(byId, {
          ...existing,
          tags: item.snippet?.tags ?? [],
          isUnlisted:
            existing.isUnlisted ||
            item.status?.privacyStatus === "unlisted",
          description: existing.description || (item.snippet?.description ?? ""),
          thumbnailUrl:
            existing.thumbnailUrl ?? thumbnailFromSnippet(item.snippet),
        });
      }
    } catch (err) {
      result.errors.push(
        `videos.list enrich: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // --- Upsert into Supabase -------------------------------------------------
  for (const row of byId.values()) {
    if (gatedVideoIds.has(row.youtubeId)) row.isGated = true;

    const { data, error } = await admin
      .from("videos")
      .upsert(
        {
          youtube_id: row.youtubeId,
          title: row.title,
          description: row.description,
          thumbnail_url: row.thumbnailUrl,
          playlist_id: row.playlistId,
          is_unlisted: row.isUnlisted,
          is_gated: row.isGated,
        },
        { onConflict: "youtube_id" },
      )
      .select("id")
      .single();

    if (error || !data) {
      result.errors.push(
        `upsert ${row.youtubeId}: ${error?.message ?? "unknown"}`,
      );
      continue;
    }

    result.upserted += 1;
    result.youtubeIds.push(row.youtubeId);
    if (row.isGated) result.gatedCount += 1;
    if (row.isUnlisted) result.unlistedCount += 1;

    const keywords = extractKeywords(row.title, row.description, row.tags);
    result.conceptsLinked += await upsertConceptsForVideo(data.id, keywords);
  }

  return result;
}
