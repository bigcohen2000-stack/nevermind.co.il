"use server";

import { revalidatePath } from "next/cache";

import {
  listStudioFeaturedComments,
  resolveVideoIdByYoutubeId,
  type StudioFeaturedCommentRow,
} from "@/lib/studio/featured-comments";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type FeaturedCommentActionResult =
  | { ok: true; message?: string; rows?: StudioFeaturedCommentRow[] }
  | { ok: false; error: string };

function revalidate() {
  revalidatePath("/studio/comments");
  revalidatePath("/watch", "layout");
}

export async function createFeaturedComment(input: {
  youtubeId: string;
  authorName?: string;
  body: string;
  sortOrder?: number;
  timestampSeconds?: number | null;
}): Promise<FeaturedCommentActionResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  const body = input.body.trim();
  if (!body || body.length > 4000) {
    return { ok: false, error: "תוכן התגובה חסר או ארוך מדי." };
  }

  const video = await resolveVideoIdByYoutubeId(input.youtubeId);
  if (!video) {
    return {
      ok: false,
      error: "לא נמצא סרטון עם ה-YouTube ID הזה במסד. סנכרנו קודם.",
    };
  }

  const sortOrder =
    typeof input.sortOrder === "number" && Number.isFinite(input.sortOrder)
      ? Math.max(0, Math.floor(input.sortOrder))
      : 0;

  const timestampSeconds =
    typeof input.timestampSeconds === "number" &&
    Number.isFinite(input.timestampSeconds) &&
    input.timestampSeconds >= 0
      ? Math.floor(input.timestampSeconds)
      : null;

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("video_featured_comments").insert({
      video_id: video.id,
      author_name: input.authorName?.trim() || null,
      body,
      sort_order: sortOrder,
      timestamp_seconds: timestampSeconds,
      is_creator_hearted: true,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidate();
    const rows = await listStudioFeaturedComments();
    return { ok: true, message: "התגובה נוספה.", rows };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בהוספה.",
    };
  }
}

export async function deleteFeaturedComment(
  id: string,
): Promise<FeaturedCommentActionResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  if (!id.trim()) {
    return { ok: false, error: "מזהה חסר." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("video_featured_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidate();
    const rows = await listStudioFeaturedComments();
    return { ok: true, message: "נמחקה.", rows };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה במחיקה.",
    };
  }
}
