"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isUuidParam } from "@/lib/videos/watch-path";

export type LiveVoteResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; error: string; needsAuth?: boolean };

export type LiveRequestResult =
  | { ok: true }
  | { ok: false; error: string; needsAuth?: boolean };

const requestSchema = z.object({
  videoTitle: z.string().trim().min(2).max(200),
  note: z.string().trim().max(500).optional().default(""),
  videoId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && isUuidParam(v) ? v : undefined)),
});

async function countLikes(videoId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("live_video_likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Toggle like on a LIVE archive / vote candidate. Requires signed-in user.
 */
export async function toggleLiveVideoLike(
  videoIdRaw: string,
): Promise<LiveVoteResult> {
  const videoId = videoIdRaw?.trim() ?? "";
  if (!isUuidParam(videoId)) {
    return { ok: false, error: "מזהה סרטון לא תקין." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        needsAuth: true,
        error: "צריך להירשם או להתחבר כדי לתת לייק.",
      };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("live_video_likes")
      .select("video_id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle();

    if (lookupError) {
      return {
        ok: false,
        error:
          lookupError.message.includes("live_video_likes") ||
          lookupError.code === "42P01"
            ? "מערכת הלייקים עדיין לא פעילה. נסו שוב אחרי עדכון."
            : lookupError.message,
      };
    }

    if (existing) {
      const { error } = await supabase
        .from("live_video_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/live");
      return {
        ok: true,
        liked: false,
        likeCount: await countLikes(videoId),
      };
    }

    const { error } = await supabase.from("live_video_likes").insert({
      user_id: user.id,
      video_id: videoId,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/live");
    return {
      ok: true,
      liked: true,
      likeCount: await countLikes(videoId),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בלייק.",
    };
  }
}

/**
 * Request a specific video (or topic title) for a future LIVE.
 */
export async function submitLiveVideoRequest(input: {
  videoTitle: string;
  note?: string;
  videoId?: string;
}): Promise<LiveRequestResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "בדקו את שם הסרטון או ההערה." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        needsAuth: true,
        error: "צריך להירשם או להתחבר כדי להזמין סרטון ללייב.",
      };
    }

    const { error } = await supabase.from("live_video_requests").insert({
      user_id: user.id,
      video_id: parsed.data.videoId ?? null,
      video_title: parsed.data.videoTitle,
      note: parsed.data.note ?? "",
    });

    if (error) {
      return {
        ok: false,
        error:
          error.message.includes("live_video_requests") || error.code === "42P01"
            ? "מערכת הבקשות עדיין לא פעילה. נסו שוב אחרי עדכון, או שלחו בוואטסאפ."
            : error.message,
      };
    }

    revalidatePath("/live");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בשליחה.",
    };
  }
}
