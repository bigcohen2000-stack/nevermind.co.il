import "server-only";

import {
  BOOKS_LOVE_CONCEPT,
  LOVE_BOOK_VIDEO_TITLE_NEEDLES,
} from "@/lib/content/books-page";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { presentVideosForClient } from "@/lib/videos/sanitize-public";
import { listVideosForConceptName } from "@/lib/videos/queries";
import { resolveVideoEntitlement } from "@/lib/club/access";
import type { Video } from "@/types/supabase";

const LIST_COLUMNS =
  "id, youtube_id, title, thumbnail_url, playlist_id, is_unlisted, is_gated, created_at, published_at, duration_seconds, breakdown_level" as const;

function titleMatchesBookTalk(title: string): boolean {
  const t = title.toLowerCase();
  return LOVE_BOOK_VIDEO_TITLE_NEEDLES.some((needle) =>
    t.includes(needle.toLowerCase()),
  );
}

/**
 * Videos that name the book / "אהבה ב-20 עמודים", plus love-concept related.
 */
export async function getBooksLoveVideos(limit = 9): Promise<{
  bookTalks: Video[];
  related: Video[];
}> {
  const entitled = await resolveVideoEntitlement()
    .then((a) => a.entitled || a.hasVideoAccess)
    .catch(() => false);

  let bookTalks: Video[] = [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select(LIST_COLUMNS)
      .ilike("title", "%אהבה%")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(40);

    bookTalks = presentVideosForClient(
      ((data ?? []) as Video[]).filter((v) => titleMatchesBookTalk(v.title)),
      entitled,
    ).slice(0, Math.min(6, limit));
  } catch {
    bookTalks = [];
  }

  const relatedRaw = await listVideosForConceptName(
    BOOKS_LOVE_CONCEPT,
    Math.max(limit, 12),
  ).catch(() => [] as Video[]);

  const bookIds = new Set(bookTalks.map((v) => v.id));
  const related = relatedRaw
    .filter((v) => !bookIds.has(v.id))
    .slice(0, limit);

  return { bookTalks, related };
}
