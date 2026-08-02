"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { extractYoutubeVideoId } from "@/lib/videos/teaser";

export type SetStudioVideoTeaserResult =
  | { ok: true; teaserYoutubeId: string | null }
  | { ok: false; error: string };

const inputSchema = z.object({
  videoId: z.string().uuid(),
  teaserInput: z.string().max(500),
});

/**
 * Studio-only: attach or clear a dedicated public teaser clip on a video.
 */
export async function setStudioVideoTeaser(
  videoId: string,
  teaserInput: string,
): Promise<SetStudioVideoTeaserResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "הניהול נעול." };
    }

    const parsed = inputSchema.safeParse({
      videoId,
      teaserInput: teaserInput.trim(),
    });
    if (!parsed.success) {
      return { ok: false, error: "קלט לא תקין." };
    }

    const raw = parsed.data.teaserInput;
    const teaserYoutubeId = raw ? extractYoutubeVideoId(raw) : null;
    if (raw && !teaserYoutubeId) {
      return {
        ok: false,
        error: "לא הצלחתי לחלץ מזהה יוטיוב מהקלט.",
      };
    }

    const admin = getSupabaseAdmin();
    const { data: video, error: loadError } = await admin
      .from("videos")
      .select("id, youtube_id, is_gated, is_unlisted")
      .eq("id", parsed.data.videoId)
      .maybeSingle();

    if (loadError || !video) {
      return { ok: false, error: "הסרטון לא נמצא." };
    }

    if (teaserYoutubeId && teaserYoutubeId === video.youtube_id) {
      return {
        ok: false,
        error:
          "הטעימה חייבת להיות העלאה קצרה נפרדת. אסור להשתמש במזהה של הסרטון המלא.",
      };
    }

    const { error } = await admin
      .from("videos")
      .update({ teaser_youtube_id: teaserYoutubeId })
      .eq("id", parsed.data.videoId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/studio");
    revalidatePath(`/watch/${parsed.data.videoId}`);
    revalidatePath("/videos");

    return { ok: true, teaserYoutubeId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שמירת הטעימה נכשלה.",
    };
  }
}
