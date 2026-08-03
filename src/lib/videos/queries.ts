import "server-only";

import { cache } from "react";

import { isCuratedConcept, isQualityConceptName } from "@/lib/concepts/quality";
import { searchArticles } from "@/lib/search/articles";
import { SEARCH_FETCH_CAP } from "@/lib/search/search-params";
import type { SuggestItem } from "@/lib/search/types";
import { createClient } from "@/lib/supabase/server";
import type { TranscriptSegment } from "@/lib/videos/heatmap";
import { isBreakdownLevel } from "@/lib/videos/investigation";
import { isYoutubeUnavailableTitle } from "@/lib/videos/youtube-availability";
import type { Concept, Video } from "@/types/supabase";

export type { SuggestItem } from "@/lib/search/types";

/**
 * Columns needed for cards, browse, search grids, and related rails.
 * Omits description + core_facts (often large) to cut payload on list paths.
 */
const VIDEO_LIST_COLUMNS =
  "id, youtube_id, title, thumbnail_url, playlist_id, is_unlisted, is_gated, created_at, published_at, duration_seconds, breakdown_level" as const;

type VideoListRow = Pick<
  Video,
  | "id"
  | "youtube_id"
  | "title"
  | "thumbnail_url"
  | "playlist_id"
  | "is_unlisted"
  | "is_gated"
  | "created_at"
  | "published_at"
  | "duration_seconds"
  | "breakdown_level"
>;

function toListVideo(row: VideoListRow): Video {
  return {
    ...row,
    description: null,
    core_facts: [],
    breakdown_level: row.breakdown_level ?? null,
    club_teaser_label: null,
    club_teaser_href: null,
    teaser_youtube_id: null,
  };
}

function toListVideos(rows: VideoListRow[] | null | undefined): Video[] {
  return (rows ?? []).map(toListVideo);
}

/** Strip characters that break plainto_tsquery / PostgREST textSearch. */
function sanitizeSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(/[^\p{L}\p{N}\s\-']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function tryCreateClient() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const supabase = await tryCreateClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return Boolean(user);
}

export type SuggestSearchOptions = {
  /** When set, only videos with this breakdown_level are returned. */
  breakdown?: string;
};

export async function suggestSearch(
  query: string,
  options: SuggestSearchOptions = {},
): Promise<{
  items: SuggestItem[];
  concepts: Concept[];
}> {
  const q = sanitizeSearchQuery(query);
  if (q.length < 1) {
    return { items: [], concepts: [] };
  }

  const supabase = await tryCreateClient();
  if (!supabase) {
    return { items: [], concepts: [] };
  }
  const pattern = `%${q}%`;
  const breakdown = isBreakdownLevel(options.breakdown)
    ? options.breakdown
    : undefined;

  const [{ data: titleVideos }, { data: concepts }, { data: transcriptHits }] =
    await Promise.all([
      supabase
        .from("videos")
        .select(
          "id, youtube_id, title, is_gated, is_unlisted, breakdown_level",
        )
        .ilike("title", pattern)
        .limit(8),
      supabase
        .from("concepts")
        .select("id, name, category")
        .ilike("name", pattern)
        .limit(6),
      supabase
        .from("video_transcripts")
        .select("video_id")
        .textSearch("search_vector", q, { config: "simple", type: "plain" })
        .limit(8),
    ]);

  const byId = new Map<
    string,
    {
      id: string;
      youtube_id: string;
      title: string;
      is_gated: boolean;
      is_unlisted: boolean;
      breakdown_level: string | null;
    }
  >();
  for (const v of titleVideos ?? []) {
    byId.set(v.id, {
      ...v,
      breakdown_level: v.breakdown_level ?? null,
    });
  }

  const transcriptHitIds = (transcriptHits ?? []).map((row) => row.video_id);
  const missingTranscriptIds = transcriptHitIds.filter((id) => !byId.has(id));

  if (missingTranscriptIds.length > 0) {
    const { data: transcriptVideos } = await supabase
      .from("videos")
      .select(
        "id, youtube_id, title, is_gated, is_unlisted, breakdown_level",
      )
      .in("id", missingTranscriptIds)
      .limit(8);
    for (const v of transcriptVideos ?? []) {
      byId.set(v.id, {
        ...v,
        breakdown_level: v.breakdown_level ?? null,
      });
    }
  }

  // Caption snippets only for transcript hits (title-only matches stay clean).
  const snippetByVideoId = new Map<
    string,
    { snippet: string; startSeconds: number }
  >();
  const snippetIds = transcriptHitIds.filter((id) => byId.has(id));
  if (snippetIds.length > 0) {
    const { matchTranscriptSnippet } = await import(
      "@/lib/search/transcript-snippet"
    );
    const { data: transcripts } = await supabase
      .from("video_transcripts")
      .select("video_id, content, segments")
      .in("video_id", snippetIds);
    for (const row of transcripts ?? []) {
      const match = matchTranscriptSnippet(q, row.content, row.segments);
      if (!match) continue;
      snippetByVideoId.set(row.video_id, {
        snippet: match.snippet,
        startSeconds: match.startSeconds,
      });
    }
  }

  const articles = searchArticles(q, 4).map((a) => ({
    type: "article" as const,
    slug: a.slug,
    title: a.title,
    category: a.category,
    description: a.description,
  }));

  let videoRows = [...byId.values()];
  if (breakdown) {
    videoRows = videoRows.filter((v) => v.breakdown_level === breakdown);
  }

  const items: SuggestItem[] = [
    ...articles,
    ...videoRows.slice(0, 6).map((v) => {
      const isGated = Boolean(v.is_gated) || Boolean(v.is_unlisted);
      const snip = snippetByVideoId.get(v.id);
      return {
        type: "video" as const,
        id: v.id,
        // Guests must not receive YouTube ids for gated teasers.
        youtubeId: isGated ? "" : v.youtube_id,
        title: v.title,
        isGated,
        snippet: snip?.snippet ?? null,
        startSeconds: isGated ? null : (snip?.startSeconds ?? null),
        breakdownLevel: v.breakdown_level,
      };
    }),
    ...(concepts ?? []).map((c) => ({
      type: "concept" as const,
      id: c.id,
      name: c.name,
      category: c.category,
    })),
  ];

  return { items, concepts: concepts ?? [] };
}

export type SearchAllResult = {
  videos: Video[];
  concepts: Concept[];
  articles: ReturnType<typeof searchArticles>;
};

export async function searchAll(query: string): Promise<SearchAllResult> {
  const q = sanitizeSearchQuery(query);
  const [videos, concepts, articles] = await Promise.all([
    searchVideos(q),
    searchConcepts(q),
    Promise.resolve(searchArticles(q, 12)),
  ]);
  return { videos, concepts, articles };
}

async function searchConcepts(query: string): Promise<Concept[]> {
  const q = sanitizeSearchQuery(query);
  if (!q) return [];
  const supabase = await tryCreateClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("concepts")
    .select("id, name, category")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(24);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  // Prefer exact / curated matches so the concepts accordion stays sharp.
  const ranked = [...rows].sort((a, b) => {
    const aExact =
      a.name.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0
        ? 1
        : 0;
    const bExact =
      b.name.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0
        ? 1
        : 0;
    if (bExact !== aExact) return bExact - aExact;
    const aCurated = isCuratedConcept(a.name) ? 1 : 0;
    const bCurated = isCuratedConcept(b.name) ? 1 : 0;
    if (bCurated !== aCurated) return bCurated - aCurated;
    return a.name.localeCompare(b.name, "he");
  });

  return ranked
    .filter((c) => {
      const exact =
        c.name.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0;
      return exact || isQualityConceptName(c.name) || isCuratedConcept(c.name);
    })
    .slice(0, 8);
}

/**
 * Browse grid: include gated / unlisted teasers so guests see the lock overlay.
 * Anon RLS still hides gated rows, so we merge service-role metadata for teasers.
 * Transcripts stay blocked by transcript RLS + the watch-page lock.
 */
export type VideoBrowseFilter = "all" | "open" | "club";
export type VideoBrowseSort = "newest" | "oldest" | "title" | "longest";

export type ListBrowseVideosOptions = {
  limit?: number;
  /** 0-based offset into the sorted browse set. */
  offset?: number;
  filter?: VideoBrowseFilter;
  sort?: VideoBrowseSort;
  /** Exact concept name (Hebrew). Limits results to linked videos. */
  concept?: string;
  /** Investigation breakdown level. */
  breakdown?: string;
};

export type BrowseVideosPage = {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function sortVideos(videos: Video[], sort: VideoBrowseSort): Video[] {
  const copy = [...videos];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => {
        const da = new Date(a.published_at ?? a.created_at).getTime();
        const db = new Date(b.published_at ?? b.created_at).getTime();
        return da - db;
      });
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "he"));
    case "longest":
      return copy.sort(
        (a, b) => (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0),
      );
    case "newest":
    default:
      return copy.sort((a, b) => {
        const da = new Date(a.published_at ?? a.created_at).getTime();
        const db = new Date(b.published_at ?? b.created_at).getTime();
        return db - da;
      });
  }
}

export async function listPublicVideos(limit = 24): Promise<Video[]> {
  return listBrowseVideos({ limit, filter: "all", sort: "newest" });
}

/**
 * Resolve video ids linked to a concept.
 * Prefers exact name match. Falls back to a single curated/ilike hit only when
 * exactly one quality concept matches (avoids weakly related noise).
 */
async function resolveConceptVideoIds(conceptName: string): Promise<string[]> {
  const name = conceptName.trim();
  if (!name) return [];

  const pickConceptId = (
    exactId: string | null | undefined,
    fuzzy: Array<{ id: string; name: string }> | null,
  ): string | null => {
    if (exactId) return exactId;
    const rows = fuzzy ?? [];
    const quality = rows.filter(
      (row) =>
        isCuratedConcept(row.name) ||
        row.name.trim().localeCompare(name, "he", { sensitivity: "base" }) ===
          0,
    );
    if (quality.length === 1) return quality[0]!.id;
    if (rows.length === 1 && isCuratedConcept(rows[0]!.name)) {
      return rows[0]!.id;
    }
    return null;
  };

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();
    const { data: exact } = await admin
      .from("concepts")
      .select("id")
      .eq("name", name)
      .maybeSingle();
    const { data: fuzzy } = exact?.id
      ? { data: null }
      : await admin
          .from("concepts")
          .select("id, name")
          .ilike("name", `%${name}%`)
          .limit(8);
    const conceptId = pickConceptId(exact?.id, fuzzy);
    if (conceptId) {
      const { data: links } = await admin
        .from("video_concepts")
        .select("video_id")
        .eq("concept_id", conceptId)
        .limit(2500);
      const ids = [...new Set((links ?? []).map((row) => row.video_id))];
      if (ids.length > 0) return ids;
    }
  } catch {
    /* fall through to RLS client */
  }

  const supabase = await tryCreateClient();
  if (!supabase) return [];

  const { data: exact } = await supabase
    .from("concepts")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  const { data: fuzzy } = exact?.id
    ? { data: null }
    : await supabase
        .from("concepts")
        .select("id, name")
        .ilike("name", `%${name}%`)
        .limit(8);
  const conceptId = pickConceptId(exact?.id, fuzzy);
  if (!conceptId) return [];

  const { data: links } = await supabase
    .from("video_concepts")
    .select("video_id")
    .eq("concept_id", conceptId)
    .limit(2500);

  return [...new Set((links ?? []).map((row) => row.video_id))];
}

/**
 * Videos linked to a concept by exact name.
 * Includes gated teasers via admin (same as listBrowseVideos), then redacts.
 */
export async function listVideosForConceptName(
  name: string,
  limit = 6,
): Promise<Video[]> {
  const conceptName = name.trim();
  if (!conceptName || limit < 1) return [];

  const videoIds = await resolveConceptVideoIds(conceptName);
  if (videoIds.length === 0) return [];

  const take = Math.min(limit, videoIds.length);
  const ids = videoIds.slice(0, Math.min(60, videoIds.length));

  const supabase = await tryCreateClient();
  const viaRls = supabase
    ? toListVideos(
        (
          await supabase
            .from("videos")
            .select(VIDEO_LIST_COLUMNS)
            .in("id", ids)
            .order("created_at", { ascending: false })
        ).data as VideoListRow[] | null,
      )
    : [];

  let gatedTeasers: Video[] = [];
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select(VIDEO_LIST_COLUMNS)
      .in("id", ids)
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .order("created_at", { ascending: false });
    gatedTeasers = toListVideos(data as VideoListRow[] | null);
  } catch {
    gatedTeasers = [];
  }

  const byId = new Map<string, Video>();
  for (const v of [...gatedTeasers, ...viaRls]) {
    byId.set(v.id, v);
  }

  const { redactMembersOnlySources } = await import(
    "@/lib/videos/sanitize-public"
  );
  return redactMembersOnlySources(
    sortVideos([...byId.values()], "newest").slice(0, take),
  );
}

/**
 * Max videos considered for browse pagination (merge + sort).
 * Must cover the full indexed library (public + club teasers), not stall at ~400.
 */
const BROWSE_FETCH_CAP = 2500;

export async function listBrowseVideos(
  options: ListBrowseVideosOptions = {},
): Promise<Video[]> {
  const limit = Math.max(1, options.limit ?? 48);
  const offset = Math.max(0, options.offset ?? 0);
  const page = await collectBrowseVideos({
    ...options,
    fetchCap: Math.min(BROWSE_FETCH_CAP, offset + limit),
  });
  return page.slice(offset, offset + limit);
}

/**
 * Paginated browse list with total count for Previous/Next UI.
 * Clamps out-of-range pages to the last available page.
 */
export async function listBrowseVideosPage(
  options: ListBrowseVideosOptions & {
    page?: number;
    pageSize?: number;
  } = {},
): Promise<BrowseVideosPage> {
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 12));
  const requestedPage = Math.max(1, Math.floor(options.page ?? 1));

  const all = await collectBrowseVideos({
    ...options,
    fetchCap: BROWSE_FETCH_CAP,
  });
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;

  return {
    videos: all.slice(offset, offset + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

async function collectBrowseVideos(
  options: ListBrowseVideosOptions & { fetchCap?: number },
): Promise<Video[]> {
  const fetchCap = Math.min(
    BROWSE_FETCH_CAP,
    Math.max(1, options.fetchCap ?? BROWSE_FETCH_CAP),
  );
  const filter = options.filter ?? "all";
  const sort = options.sort ?? "newest";
  const conceptName = options.concept?.trim() || undefined;
  const breakdown = isBreakdownLevel(options.breakdown)
    ? options.breakdown
    : undefined;

  const conceptIds = conceptName
    ? await resolveConceptVideoIds(conceptName)
    : null;
  if (conceptIds && conceptIds.length === 0) return [];

  const supabase = await tryCreateClient();
  let viaRls: Video[] = [];
  if (filter !== "club" && supabase) {
    let viaRlsQuery = supabase
      .from("videos")
      .select(VIDEO_LIST_COLUMNS)
      .order("created_at", { ascending: false });
    if (breakdown) {
      viaRlsQuery = viaRlsQuery.eq("breakdown_level", breakdown);
    }
    if (conceptIds) {
      viaRlsQuery = viaRlsQuery.in("id", conceptIds);
    } else {
      viaRlsQuery = viaRlsQuery.limit(fetchCap);
    }
    viaRls = toListVideos(
      (await viaRlsQuery).data as VideoListRow[] | null,
    );
  }

  let gatedTeasers: Video[] = [];
  if (filter !== "open") {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const admin = getSupabaseAdmin();
      let gatedQuery = admin
        .from("videos")
        .select(VIDEO_LIST_COLUMNS)
        .or("is_gated.eq.true,is_unlisted.eq.true")
        .order("created_at", { ascending: false });
      if (breakdown) {
        gatedQuery = gatedQuery.eq("breakdown_level", breakdown);
      }
      if (conceptIds) {
        gatedQuery = gatedQuery.in("id", conceptIds);
      } else {
        gatedQuery = gatedQuery.limit(fetchCap);
      }
      const { data } = await gatedQuery;
      gatedTeasers = toListVideos(data as VideoListRow[] | null);
    } catch {
      gatedTeasers = [];
    }
  }

  const byId = new Map<string, Video>();
  for (const v of [...gatedTeasers, ...viaRls]) {
    if (conceptIds && !conceptIds.includes(v.id)) continue;
    if (breakdown && v.breakdown_level !== breakdown) continue;
    if (filter === "open" && (v.is_gated || v.is_unlisted)) continue;
    if (filter === "club" && !(v.is_gated || v.is_unlisted)) continue;
    if (isYoutubeUnavailableTitle(v.title)) continue;
    byId.set(v.id, v);
  }

  const { redactMembersOnlySources } = await import(
    "@/lib/videos/sanitize-public"
  );
  return redactMembersOnlySources(sortVideos([...byId.values()], sort));
}

export async function getVideoByYoutubeId(youtubeId: string): Promise<Video | null> {
  const supabase = await tryCreateClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("youtube_id", youtubeId)
    .maybeSingle();
  return data;
}

async function getVideoById(id: string): Promise<Video | null> {
  const supabase = await tryCreateClient();
  if (supabase) {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) return data;
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("*")
      .eq("id", id)
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

/**
 * Watch-page loader. Accepts opaque UUID (preferred for members-only) or
 * YouTube id (public videos / legacy links). Anon RLS hides gated rows, so
 * guests fall back to service-role metadata for the lock UI only.
 * Cached per-request so generateMetadata + page share one fetch.
 */
export const getVideoForWatch = cache(
  async (videoParam: string): Promise<Video | null> => {
    const param = videoParam.trim();
    if (!param) return null;

    const { isUuidParam } = await import("@/lib/videos/watch-path");
    if (isUuidParam(param)) {
      return getVideoById(param);
    }

    const viaUser = await getVideoByYoutubeId(param);
    if (viaUser) return viaUser;

    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const admin = getSupabaseAdmin();
      const byFull = await admin
        .from("videos")
        .select("*")
        .eq("youtube_id", param)
        .or("is_gated.eq.true,is_unlisted.eq.true")
        .maybeSingle();
      if (byFull.data) return byFull.data;

      // Public teaser clip ids can resolve to the gated parent for the lock UI.
      const byTeaser = await admin
        .from("videos")
        .select("*")
        .eq("teaser_youtube_id", param)
        .or("is_gated.eq.true,is_unlisted.eq.true")
        .maybeSingle();
      return byTeaser.data;
    } catch {
      return null;
    }
  },
);

export async function getVideoTranscript(
  videoId: string,
): Promise<string | null> {
  const payload = await getVideoTranscriptPayload(videoId);
  return payload?.content ?? null;
}

export type VideoTranscriptPayload = {
  content: string;
  segments: TranscriptSegment[];
};

export async function getVideoTranscriptPayload(
  videoId: string,
): Promise<VideoTranscriptPayload | null> {
  const supabase = await tryCreateClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("video_transcripts")
    .select("content, segments")
    .eq("video_id", videoId)
    .maybeSingle();

  const content = data?.content?.trim();
  if (!content) return null;

  const segments = parseStoredSegments(data?.segments);
  return { content, segments };
}

function parseStoredSegments(raw: unknown): TranscriptSegment[] {
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

export async function getVideoConcepts(videoId: string): Promise<
  Array<{ name: string; start_timestamp: number | null; concept_id: string }>
> {
  const supabase = await tryCreateClient();
  if (!supabase) return [];
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
  opts?: { entitled?: boolean },
): Promise<RelatedVideo[]> {
  const supabase = await tryCreateClient();
  if (!supabase) return [];
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

  const { data: videos } = await supabase
    .from("videos")
    .select(VIDEO_LIST_COLUMNS)
    .in("id", ids);
  if (!videos) return [];

  // Entitled: may still miss gated rows under RLS. Merge via service role.
  let merged = toListVideos(videos as VideoListRow[]);
  if (opts?.entitled) {
    const missing = ids.filter((id) => !merged.some((v) => v.id === id));
    if (missing.length > 0) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const admin = getSupabaseAdmin();
        const { data: gatedExtra } = await admin
          .from("videos")
          .select(VIDEO_LIST_COLUMNS)
          .in("id", missing);
        if (gatedExtra?.length) {
          merged = [...merged, ...toListVideos(gatedExtra as VideoListRow[])];
        }
      } catch {
        /* keep RLS set */
      }
    }
  }

  const { redactMembersOnlySource } = await import(
    "@/lib/videos/sanitize-public"
  );

  return merged.map((v) => {
    const safe = opts?.entitled ? v : redactMembersOnlySource(v);
    return {
      ...safe,
      startTimestamp: scored.get(v.id)?.startTimestamp ?? null,
      sharedConcept: scored.get(v.id)?.sharedConcept ?? null,
    };
  });
}

export async function searchVideos(query: string): Promise<Video[]> {
  const q = sanitizeSearchQuery(query);
  if (!q) {
    return listPublicVideos(SEARCH_FETCH_CAP);
  }

  const supabase = await tryCreateClient();
  if (!supabase) return [];

  const pattern = `%${q}%`;
  const limit = SEARCH_FETCH_CAP;

  const [{ data: byTitle }, { data: concepts }, { data: transcriptHits }] =
    await Promise.all([
      supabase
        .from("videos")
        .select(VIDEO_LIST_COLUMNS)
        .ilike("title", pattern)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("concepts").select("id, name").ilike("name", pattern).limit(16),
      supabase
        .from("video_transcripts")
        .select("video_id")
        .textSearch("search_vector", q, { config: "simple", type: "plain" })
        .limit(limit),
    ]);

  // Anon RLS hides gated rows: merge gated title teasers via service role.
  let gatedByTitle: Video[] = [];
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select(VIDEO_LIST_COLUMNS)
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(limit);
    gatedByTitle = toListVideos(data as VideoListRow[] | null);
  } catch {
    gatedByTitle = [];
  }

  // Score tiers: exact concept link > title match > soft concept > transcript.
  const scores = new Map<string, number>();
  const bump = (id: string, points: number) => {
    scores.set(id, Math.max(scores.get(id) ?? 0, points));
  };

  const titleHits = [
    ...gatedByTitle,
    ...toListVideos(byTitle as VideoListRow[] | null),
  ];
  for (const v of titleHits) {
    const titleHit =
      v.title.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0;
    bump(v.id, titleHit ? 95 : 70);
  }

  const conceptRows = concepts ?? [];
  const exactConceptIds = conceptRows
    .filter(
      (c) =>
        c.name.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0 ||
        isCuratedConcept(c.name),
    )
    .map((c) => c.id);
  const softConceptIds = conceptRows
    .map((c) => c.id)
    .filter((id) => !exactConceptIds.includes(id));

  if (exactConceptIds.length > 0) {
    const { data: conceptLinks } = await supabase
      .from("video_concepts")
      .select("video_id")
      .in("concept_id", exactConceptIds)
      .limit(limit);
    for (const row of conceptLinks ?? []) {
      bump(row.video_id, 100);
    }
  }

  if (softConceptIds.length > 0) {
    const { data: softLinks } = await supabase
      .from("video_concepts")
      .select("video_id")
      .in("concept_id", softConceptIds)
      .limit(Math.min(12, limit));
    for (const row of softLinks ?? []) {
      bump(row.video_id, 55);
    }
  }

  for (const row of transcriptHits ?? []) {
    bump(row.video_id, 35);
  }

  const orderedIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit);

  if (orderedIds.length === 0) return [];

  // Prefer already-fetched title hits; load the rest by id.
  const byId = new Map<string, Video>();
  for (const v of titleHits) {
    byId.set(v.id, v);
  }

  const missing = orderedIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    const { data: extra } = await supabase
      .from("videos")
      .select(VIDEO_LIST_COLUMNS)
      .in("id", missing);
    for (const v of toListVideos(extra as VideoListRow[] | null)) {
      byId.set(v.id, v);
    }
    // Gated ids may still be missing under anon RLS.
    const stillMissing = missing.filter((id) => !byId.has(id));
    if (stillMissing.length > 0) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const admin = getSupabaseAdmin();
        const { data: gatedExtra } = await admin
          .from("videos")
          .select(VIDEO_LIST_COLUMNS)
          .in("id", stillMissing)
          .or("is_gated.eq.true,is_unlisted.eq.true");
        for (const v of toListVideos(gatedExtra as VideoListRow[] | null)) {
          byId.set(v.id, v);
        }
      } catch {
        /* keep what we have */
      }
    }
  }

  const { redactMembersOnlySources } = await import(
    "@/lib/videos/sanitize-public"
  );
  return redactMembersOnlySources(
    orderedIds.map((id) => byId.get(id)).filter((v): v is Video => Boolean(v)),
  );
}

/**
 * 3–5 highly relevant videos for a Learning Journey playlist.
 * Prefers concept-linked matches, then title, then the ranked search list.
 * Returns [] when fewer than 3 strong matches exist.
 */
export async function getLearningJourney(
  query: string,
  max = 5,
): Promise<Video[]> {
  const q = sanitizeSearchQuery(query);
  if (!q) return [];

  const supabase = await tryCreateClient();
  if (!supabase) return [];
  const pattern = `%${q}%`;
  const scored = new Map<string, number>();

  const bump = (id: string, points: number) => {
    scored.set(id, (scored.get(id) ?? 0) + points);
  };

  const [{ data: concepts }, { data: byTitle }, { data: byDescription }] =
    await Promise.all([
      supabase.from("concepts").select("id, name").ilike("name", pattern).limit(12),
      supabase.from("videos").select("id").ilike("title", pattern).limit(24),
      supabase
        .from("videos")
        .select("id")
        .ilike("description", pattern)
        .limit(24),
    ]);

  for (const row of byTitle ?? []) bump(row.id, 40);
  for (const row of byDescription ?? []) bump(row.id, 15);

  const conceptIds = (concepts ?? []).map((c) => c.id);
  if (conceptIds.length > 0) {
    const { data: links } = await supabase
      .from("video_concepts")
      .select("video_id, concepts(name)")
      .in("concept_id", conceptIds)
      .limit(40);

    for (const row of links ?? []) {
      const conceptsJoin = row.concepts as
        | { name: string }
        | { name: string }[]
        | null;
      const name = Array.isArray(conceptsJoin)
        ? conceptsJoin[0]?.name
        : conceptsJoin?.name;
      const exact =
        name &&
        name.trim().localeCompare(q, "he", { sensitivity: "base" }) === 0;
      bump(row.video_id, exact ? 100 : 70);
    }
  }

  try {
    const { data: transcriptHits } = await supabase
      .from("video_transcripts")
      .select("video_id")
      .textSearch("search_vector", q, { config: "simple", type: "plain" })
      .limit(24);
    for (const row of transcriptHits ?? []) bump(row.video_id, 25);
  } catch {
    /* transcript index may be empty */
  }

  const rankedIds = [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, max);

  if (rankedIds.length < 3) return [];

  const { data: videos } = await supabase
    .from("videos")
    .select(VIDEO_LIST_COLUMNS)
    .in("id", rankedIds);

  if (!videos?.length) return [];

  const listed = toListVideos(videos as VideoListRow[]);
  const byId = new Map(listed.map((v) => [v.id, v]));
  const ordered = rankedIds
    .map((id) => byId.get(id))
    .filter((v): v is Video => Boolean(v))
    .slice(0, max);

  const { redactMembersOnlySources } = await import(
    "@/lib/videos/sanitize-public"
  );
  return redactMembersOnlySources(ordered);
}

export type ConceptDirectoryItem = {
  id: string;
  name: string;
  category: string | null;
  videoCount: number;
};

/**
 * Unique concepts with how many visible videos link to each.
 * Counts respect video_concepts RLS (gated videos hidden for anon).
 */
export async function listConceptsWithVideoCounts(): Promise<
  ConceptDirectoryItem[]
> {
  const supabase = await tryCreateClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("concepts")
    .select("id, name, category, video_concepts(count)")
    .order("name", { ascending: true });

  if (error || !data) return [];

  const items: ConceptDirectoryItem[] = data.map((row) => {
    const links = row.video_concepts as { count: number }[] | null;
    const videoCount = Array.isArray(links) ? Number(links[0]?.count ?? 0) : 0;
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      videoCount,
    };
  });

  return items
    .filter(
      (item) =>
        item.videoCount > 0 &&
        item.name.trim().length > 0 &&
        (isCuratedConcept(item.name) || item.videoCount >= 2),
    )
    .sort(
      (a, b) =>
        b.videoCount - a.videoCount ||
        a.name.localeCompare(b.name, "he"),
    );
}
