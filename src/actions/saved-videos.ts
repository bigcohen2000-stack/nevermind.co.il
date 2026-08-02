"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

export type ToggleSavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string; needsAuth?: boolean };

/**
 * Optimistic-friendly toggle: insert if missing, delete if present.
 */
export async function toggleSavedVideo(
  youtubeId: string,
): Promise<ToggleSavedResult> {
  try {
    const id = youtubeId?.trim();
    if (!id) {
      return { ok: false, error: "חסר מזהה סרטון." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        needsAuth: true,
        error: "יש להתחבר כדי לשמור סרטונים לרשימה שלי.",
      };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("saved_videos")
      .select("youtube_id")
      .eq("user_id", user.id)
      .eq("youtube_id", id)
      .maybeSingle();

    if (lookupError) {
      return { ok: false, error: lookupError.message };
    }

    if (existing) {
      const { error } = await supabase
        .from("saved_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("youtube_id", id);

      if (error) return { ok: false, error: error.message };

      revalidatePath("/my-list");
      return { ok: true, saved: false };
    }

    const { error } = await supabase.from("saved_videos").insert({
      user_id: user.id,
      youtube_id: id,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/my-list");
    return { ok: true, saved: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getSavedYoutubeIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_videos")
      .select("youtube_id")
      .eq("user_id", user.id);

    if (error || !data) return [];
    return data.map((row) => row.youtube_id);
  } catch {
    return [];
  }
}

export async function listSavedVideos(): Promise<Video[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: saved, error: savedError } = await supabase
      .from("saved_videos")
      .select("youtube_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (savedError || !saved?.length) return [];

    const ids = saved.map((row) => row.youtube_id);
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .in("youtube_id", ids);

    if (videosError || !videos) return [];

    const byId = new Map(videos.map((video) => [video.youtube_id, video]));
    return ids
      .map((youtubeId) => byId.get(youtubeId))
      .filter((video): video is Video => Boolean(video));
  } catch {
    return [];
  }
}
