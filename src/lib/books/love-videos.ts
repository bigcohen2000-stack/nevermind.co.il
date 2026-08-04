import "server-only";

import {
  BOOKS_LOVE_CONCEPT,
  LOVE_BOOK_VIDEO_TITLE_NEEDLES,
} from "@/lib/content/books-page";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { presentVideosForClient } from "@/lib/videos/sanitize-public";
import type { Video } from "@/types/supabase";

const LIST_COLUMNS =
  "id, youtube_id, title, thumbnail_url, playlist_id, is_unlisted, is_gated, created_at, published_at, duration_seconds, breakdown_level" as const;

function titleMatchesBookTalk(title: string): boolean {
  const t = title.toLowerCase();
  return LOVE_BOOK_VIDEO_TITLE_NEEDLES.some((needle) =>
    t.includes(needle.toLowerCase()),
  );
}

function dedupeById(videos: Video[]): Video[] {
  const byId = new Map<string, Video>();
  for (const video of videos) {
    if (!byId.has(video.id)) byId.set(video.id, video);
  }
  return Array.from(byId.values());
}

async function resolveLoveConceptVideoIds(): Promise<string[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data: concepts } = await admin
      .from("concepts")
      .select("id")
      .ilike("name", BOOKS_LOVE_CONCEPT)
      .limit(5);
    const conceptIds = (concepts ?? [])
      .map((c) => (c as { id: string }).id)
      .filter(Boolean);
    if (conceptIds.length === 0) return [];

    const { data: links } = await admin
      .from("video_concepts")
      .select("video_id")
      .in("concept_id", conceptIds);
    const ids = new Set<string>();
    for (const row of links ?? []) {
      const id = (row as { video_id: string }).video_id;
      if (id) ids.add(id);
    }
    return Array.from(ids);
  } catch {
    return [];
  }
}

export type BooksLoveVideosResult = {
  /** Book-talk titles first, then other love-concept videos. Deduped + sanitized. */
  videos: Video[];
  bookTalkCount: number;
  relatedCount: number;
  total: number;
};

/**
 * Love investigation videos for /books.
 * Merges book-talk titles + concept "אהבה", dedupes by id, then sanitizes once.
 */
export async function getBooksLoveVideos(
  limit = 24,
): Promise<BooksLoveVideosResult> {
  const take = Math.max(1, Math.min(60, limit));
  const entitled = await resolveVideoEntitlement()
    .then((a) => a.entitled || a.hasVideoAccess)
    .catch(() => false);

  let titleHits: Video[] = [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select(LIST_COLUMNS)
      .ilike("title", "%אהבה%")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(60);

    titleHits = ((data ?? []) as Video[]).filter((v) =>
      titleMatchesBookTalk(v.title),
    );
  } catch {
    titleHits = [];
  }

  let conceptHits: Video[] = [];
  try {
    const conceptIds = await resolveLoveConceptVideoIds();
    if (conceptIds.length > 0) {
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from("videos")
        .select(LIST_COLUMNS)
        .in("id", conceptIds.slice(0, 80))
        .order("published_at", { ascending: false, nullsFirst: false });
      conceptHits = (data ?? []) as Video[];
    }
  } catch {
    conceptHits = [];
  }

  // Prefer book-talk rows first in the merged order, then concept hits.
  const merged = dedupeById([...titleHits, ...conceptHits]).slice(0, take);
  const bookTalkIds = new Set(titleHits.map((v) => v.id));
  const bookTalkCount = merged.filter((v) => bookTalkIds.has(v.id)).length;
  const relatedCount = merged.length - bookTalkCount;

  const videos = presentVideosForClient(merged, entitled);

  return {
    videos,
    bookTalkCount,
    relatedCount,
    total: videos.length,
  };
}
