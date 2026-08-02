import "server-only";

import { google, type youtube_v3 } from "googleapis";

import { getServerEnv, splitCsv } from "@/env";
import {
  curatedConceptCategory,
  extractCuratedConcepts,
} from "@/lib/concepts/quality";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  firstConceptOffsetSeconds,
  type TranscriptSegment,
} from "@/lib/videos/heatmap";
import { parseYoutubeDuration } from "@/lib/videos/format-meta";
import { inferBreakdownLevel } from "@/lib/videos/investigation";
import { isYoutubeUnavailableTitle } from "@/lib/videos/youtube-availability";
import { upsertTranscriptForVideo } from "@/lib/youtube/transcripts";

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
  /**
   * Max new transcript fetches per run (skips videos that already have one).
   * Keeps Vercel maxDuration safe. Default 12.
   */
  maxTranscriptFetches?: number;
  /**
   * Skip concept upsert/link for this run (bulk ingest / CLI).
   * Default false. Use true when only refreshing video rows + gate flags.
   */
  skipConcepts?: boolean;
};

export type SyncResult = {
  upserted: number;
  youtubeIds: string[];
  gatedCount: number;
  unlistedCount: number;
  conceptsLinked: number;
  transcriptsUpserted: number;
  /** Playlists actually walked (uploads + discovered + env). */
  playlistsSynced: number;
  /**
   * Rows removed because YouTube returned no playable item
   * (deleted / private / playlist tombstone titles).
   */
  removedUnavailable: number;
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
  publishedAt: string | null;
  durationSeconds: number | null;
};

/**
 * Optional club marker in the *title* only. Descriptions often pitch the club
 * ("הצטרפו למועדון") on public videos, so description must not gate.
 */
const CLUB_TITLE_MARKER = "מועדון";

/**
 * Gating rule (YouTube unlisted is the source of truth for club lock):
 * - privacyStatus "unlisted" → is_unlisted=true AND is_gated=true
 * - force → gated (YOUTUBE_GATED_VIDEO_IDS or GATED_PLAYLIST_IDS)
 * - title contains "מועדון" → gated (optional extra signal)
 * - otherwise public stays open (description marketing copy does not gate)
 *
 * Limitation: channel uploads sync (API key) only sees *public* items.
 * Sync auto-discovers *public* channel playlists so unlisted videos that sit
 * on those playlists are ingested and auto-gated. Unlisted/private playlists
 * themselves are invisible to an API key — put their IDs in GATED_PLAYLIST_IDS
 * / YOUTUBE_PLAYLIST_IDS, or list video IDs in YOUTUBE_UNLISTED_VIDEO_IDS.
 */
export function computeIsGated(input: {
  isUnlisted: boolean;
  title: string;
  description: string;
  force?: boolean;
}): boolean {
  if (input.force) return true;
  if (input.isUnlisted) return true;
  return input.title.includes(CLUB_TITLE_MARKER);
}

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

/**
 * Concept linker for sync: curated Hebrew terms only (see lib/concepts/quality).
 */
export function extractKeywords(
  title: string,
  description: string,
  tags: string[] = [],
): string[] {
  return extractCuratedConcepts(title, description, tags, 8);
}

async function upsertConceptsForVideo(
  videoUuid: string,
  keywords: string[],
  segments: TranscriptSegment[] = [],
): Promise<number> {
  if (keywords.length === 0) return 0;
  const admin = getSupabaseAdmin();
  let linked = 0;

  for (const name of keywords) {
    const { data: concept, error } = await admin
      .from("concepts")
      .upsert(
        { name, category: curatedConceptCategory(name) },
        { onConflict: "name" },
      )
      .select("id")
      .single();

    if (error || !concept) continue;

    const startTimestamp = firstConceptOffsetSeconds(name, segments);

    const { error: linkError } = await admin.from("video_concepts").upsert(
      {
        video_id: videoUuid,
        concept_id: concept.id,
        start_timestamp: startTimestamp,
      },
      { onConflict: "video_id,concept_id" },
    );

    if (!linkError) linked += 1;
  }

  return linked;
}

function parseSegmentsJson(raw: unknown): TranscriptSegment[] {
  if (!Array.isArray(raw)) return [];
  const out: TranscriptSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!text) continue;
    out.push({
      offsetMs: Math.max(0, Math.round(Number(row.offsetMs) || 0)),
      durationMs: Math.max(0, Math.round(Number(row.durationMs) || 0)),
      text,
    });
  }
  return out;
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
    publishedAt: row.publishedAt ?? existing.publishedAt,
    durationSeconds: row.durationSeconds ?? existing.durationSeconds,
  });
}

export async function syncYoutubeLibrary(
  options: SyncInput = {},
): Promise<SyncResult> {
  const env = getServerEnv();
  const gatedPlaylists = new Set(splitCsv(env.GATED_PLAYLIST_IDS));

  // Explicit empty arrays mean "skip this source" (e.g. unlisted-only mark).
  // Undefined falls back to env defaults.
  const channelIds =
    options.channelIds !== undefined
      ? options.channelIds
      : splitCsv(env.YOUTUBE_CHANNEL_IDS);
  const playlistIds =
    options.playlistIds !== undefined
      ? options.playlistIds
      : [
          ...splitCsv(env.YOUTUBE_PLAYLIST_IDS),
          ...splitCsv(env.GATED_PLAYLIST_IDS),
        ];
  const unlistedVideoIds =
    options.unlistedVideoIds !== undefined
      ? options.unlistedVideoIds
      : splitCsv(env.YOUTUBE_UNLISTED_VIDEO_IDS);
  const gatedVideoIds = new Set([
    ...(options.gatedVideoIds ?? []),
    ...splitCsv(env.YOUTUBE_GATED_VIDEO_IDS),
  ]);
  const maxTranscriptFetches = Math.max(
    0,
    options.maxTranscriptFetches ?? 12,
  );
  const skipConcepts = options.skipConcepts === true;
  let transcriptFetches = 0;

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
    transcriptsUpserted: 0,
    playlistsSynced: 0,
    removedUnavailable: 0,
    errors: [],
  };

  const byId = new Map<string, CollectedVideo>();

  // --- Channels → uploads + public playlists --------------------------------
  // Uploads playlist (API key) only lists *public* videos. Unlisted club items
  // still appear when someone put them on a *public* playlist (e.g. "רמה 1").
  // Auto-discover those channel playlists so env does not need every PL id.
  // Unlisted / private playlists remain invisible without OAuth — put those
  // IDs in GATED_PLAYLIST_IDS or YOUTUBE_PLAYLIST_IDS manually.
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

    let playlistPageToken: string | undefined;
    do {
      try {
        const playlistsRes = await youtube.playlists.list({
          part: ["id"],
          channelId,
          maxResults: 50,
          pageToken: playlistPageToken,
        });
        for (const pl of playlistsRes.data.items ?? []) {
          if (pl.id) resolvedPlaylists.add(pl.id);
        }
        playlistPageToken = playlistsRes.data.nextPageToken ?? undefined;
      } catch (err) {
        result.errors.push(
          `channel ${channelId} playlists.list: ${err instanceof Error ? err.message : String(err)}`,
        );
        break;
      }
    } while (playlistPageToken);
  }

  result.playlistsSynced = resolvedPlaylists.size;

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

          const title = item.snippet?.title?.trim() || youtubeId;
          // Playlist tombstones: keep sync from re-upserting dead rows.
          if (isYoutubeUnavailableTitle(title)) continue;

          // Unlisted on YouTube → club. Gated playlist / explicit IDs also force gate.
          const fromGatedPlaylist = gatedPlaylists.has(playlistId);
          const isUnlisted = privacy === "unlisted";
          const isGated =
            isUnlisted ||
            fromGatedPlaylist ||
            gatedVideoIds.has(youtubeId);

          mergeCollected(byId, {
            youtubeId,
            title,
            description: item.snippet?.description ?? "",
            thumbnailUrl: thumbnailFromSnippet(item.snippet),
            playlistId: fromGatedPlaylist
              ? playlistId
              : (byId.get(youtubeId)?.playlistId ?? playlistId),
            isUnlisted,
            isGated,
            tags: [],
            publishedAt: item.snippet?.publishedAt ?? null,
            durationSeconds: null,
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
        part: ["snippet", "status", "contentDetails"],
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
          // Unlisted (or force-listed as unlisted) is always club.
          isGated: isUnlisted || gatedVideoIds.has(youtubeId),
          tags: item.snippet?.tags ?? [],
          publishedAt: item.snippet?.publishedAt ?? null,
          durationSeconds: parseYoutubeDuration(
            item.contentDetails?.duration,
          ),
        });
      }
    } catch (err) {
      result.errors.push(
        `videos.list [${ids.join(",")}]: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Enrich every collected row via videos.list: tags, duration, and authoritative
  // privacyStatus (playlistItems privacy can lag; unlisted → club lock).
  // Writes directly (not mergeCollected) so public/unlisted from videos.list wins.
  // IDs missing from videos.list (deleted / fully private) are dropped and pruned from DB.
  const allIds = [...byId.keys()];
  const unavailableIds: string[] = [];
  const forcedUnlisted = new Set(unlistedVideoIds);

  for (const ids of chunk(allIds, 50)) {
    try {
      const videosRes = await youtube.videos.list({
        part: ["snippet", "status", "contentDetails"],
        id: ids,
      });
      const returned = new Set<string>();
      for (const item of videosRes.data.items ?? []) {
        if (!item.id) continue;
        const existing = byId.get(item.id);
        if (!existing) continue;
        if (item.status?.privacyStatus === "private") {
          byId.delete(item.id);
          unavailableIds.push(item.id);
          continue;
        }
        const title = item.snippet?.title?.trim() || existing.title;
        if (isYoutubeUnavailableTitle(title)) {
          byId.delete(item.id);
          unavailableIds.push(item.id);
          continue;
        }
        returned.add(item.id);
        const privacyUnlisted = item.status?.privacyStatus === "unlisted";
        const isUnlisted = privacyUnlisted || forcedUnlisted.has(item.id);
        byId.set(item.id, {
          ...existing,
          title,
          tags:
            item.snippet?.tags && item.snippet.tags.length > 0
              ? item.snippet.tags
              : existing.tags,
          isUnlisted,
          isGated: existing.isGated || isUnlisted,
          description:
            existing.description || (item.snippet?.description ?? ""),
          thumbnailUrl:
            existing.thumbnailUrl ?? thumbnailFromSnippet(item.snippet),
          publishedAt: item.snippet?.publishedAt ?? existing.publishedAt,
          durationSeconds:
            parseYoutubeDuration(item.contentDetails?.duration) ??
            existing.durationSeconds,
        });
      }
      for (const id of ids) {
        if (!returned.has(id) && byId.has(id)) {
          byId.delete(id);
          unavailableIds.push(id);
        }
      }
    } catch (err) {
      result.errors.push(
        `videos.list enrich: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Also purge existing DB tombstones left from older syncs.
  try {
    const { data: tombstones } = await admin
      .from("videos")
      .select("youtube_id, title")
      .or("title.eq.Deleted video,title.eq.Private video");
    for (const row of tombstones ?? []) {
      if (
        row.youtube_id &&
        isYoutubeUnavailableTitle(row.title) &&
        !unavailableIds.includes(row.youtube_id)
      ) {
        unavailableIds.push(row.youtube_id);
      }
    }
  } catch (err) {
    result.errors.push(
      `tombstone scan: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (unavailableIds.length > 0) {
    const uniqueUnavailable = [...new Set(unavailableIds)];
    for (const ids of chunk(uniqueUnavailable, 50)) {
      const { error: delError, count } = await admin
        .from("videos")
        .delete({ count: "exact" })
        .in("youtube_id", ids);
      if (delError) {
        result.errors.push(`prune unavailable: ${delError.message}`);
      } else {
        result.removedUnavailable += count ?? ids.length;
      }
    }
  }

  // --- Upsert into Supabase -------------------------------------------------
  for (const row of byId.values()) {
    row.isGated = computeIsGated({
      isUnlisted: row.isUnlisted,
      title: row.title,
      description: row.description,
      force: row.isGated || gatedVideoIds.has(row.youtubeId),
    });

    const baseRow = {
      youtube_id: row.youtubeId,
      title: row.title,
      description: row.description,
      thumbnail_url: row.thumbnailUrl,
      playlist_id: row.playlistId,
      is_unlisted: row.isUnlisted,
      is_gated: row.isGated,
    };

    const inferredBreakdown = inferBreakdownLevel({
      title: row.title,
      description: row.description,
      tags: row.tags,
      isUnlisted: row.isUnlisted,
      isGated: row.isGated,
    });

    let data: { id: string; breakdown_level: string | null } | null = null;
    let error: { message: string } | null = null;

    {
      const existing = await admin
        .from("videos")
        .select("id, breakdown_level")
        .eq("youtube_id", row.youtubeId)
        .maybeSingle();

      let breakdownLevel =
        existing.data?.breakdown_level ?? inferredBreakdown;

      let full = await admin
        .from("videos")
        .upsert(
          {
            ...baseRow,
            published_at: row.publishedAt,
            duration_seconds: row.durationSeconds,
            breakdown_level: breakdownLevel,
          },
          { onConflict: "youtube_id" },
        )
        .select("id, breakdown_level")
        .single();

      // Live DB may still lack migration 25 (archive_shards not in CHECK).
      if (
        full.error &&
        breakdownLevel === "archive_shards" &&
        /breakdown_level_check|check constraint/i.test(full.error.message)
      ) {
        breakdownLevel =
          existing.data?.breakdown_level &&
          existing.data.breakdown_level !== "archive_shards"
            ? existing.data.breakdown_level
            : "unfiltered";
        full = await admin
          .from("videos")
          .upsert(
            {
              ...baseRow,
              published_at: row.publishedAt,
              duration_seconds: row.durationSeconds,
              breakdown_level: breakdownLevel,
            },
            { onConflict: "youtube_id" },
          )
          .select("id, breakdown_level")
          .single();
      }

      data = full.data;
      error = full.error;
    }

    // Older DBs may lack publish/duration/breakdown columns.
    if (
      error &&
      /duration_seconds|published_at|breakdown_level|schema cache/i.test(
        error.message,
      )
    ) {
      const fallback = await admin
        .from("videos")
        .upsert(baseRow, { onConflict: "youtube_id" })
        .select("id")
        .single();
      data = fallback.data
        ? { id: fallback.data.id, breakdown_level: null }
        : null;
      error = fallback.error;
    }

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

    const keywords = skipConcepts
      ? []
      : extractKeywords(row.title, row.description, row.tags);

    const { data: existingTranscript } = skipConcepts
      ? { data: null }
      : await admin
          .from("video_transcripts")
          .select("video_id, segments")
          .eq("video_id", data.id)
          .maybeSingle();

    let segments: TranscriptSegment[] = parseSegmentsJson(
      existingTranscript?.segments,
    );

    if (
      !skipConcepts &&
      !existingTranscript &&
      transcriptFetches < maxTranscriptFetches
    ) {
      transcriptFetches += 1;
      const transcript = await upsertTranscriptForVideo(data.id, row.youtubeId);
      if (transcript.ok) {
        result.transcriptsUpserted += 1;
        segments = transcript.segments;
      } else {
        result.errors.push(transcript.error);
      }
    }

    if (!skipConcepts) {
      result.conceptsLinked += await upsertConceptsForVideo(
        data.id,
        keywords,
        segments,
      );
    }
  }

  return result;
}
