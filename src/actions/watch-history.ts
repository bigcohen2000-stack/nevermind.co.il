"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

export type WatchHistoryItem = Video & {
  watchedAt: string;
};

export type RecordWatchResult =
  | { ok: true }
  | { ok: false; error: string; skippedAuth?: boolean };

/**
 * Record that the user started (or re-started) a video.
 */
export async function recordWatchStart(
  youtubeId: string,
): Promise<RecordWatchResult> {
  try {
    const id = youtubeId?.trim();
    if (!id) return { ok: false, error: "חסר מזהה סרטון." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, skippedAuth: true, error: "לא מחוברים." };
    }

    const { error } = await supabase.from("watch_history").upsert(
      {
        user_id: user.id,
        youtube_id: id,
        watched_at: new Date().toISOString(),
      },
      { onConflict: "user_id,youtube_id" },
    );

    if (error) return { ok: false, error: error.message };

    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function listWatchHistory(
  limit = 24,
): Promise<WatchHistoryItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: history, error } = await supabase
      .from("watch_history")
      .select("youtube_id, watched_at")
      .eq("user_id", user.id)
      .order("watched_at", { ascending: false })
      .limit(limit);

    if (error || !history?.length) return [];

    const ids = history.map((row) => row.youtube_id);
    const { data: videos } = await supabase
      .from("videos")
      .select("*")
      .in("youtube_id", ids);

    if (!videos?.length) return [];

    const byId = new Map(videos.map((video) => [video.youtube_id, video]));
    return history
      .map((row) => {
        const video = byId.get(row.youtube_id);
        if (!video) return null;
        return { ...video, watchedAt: row.watched_at };
      })
      .filter((item): item is WatchHistoryItem => Boolean(item));
  } catch {
    return [];
  }
}

export async function clearWatchHistory(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "לא מחוברים." };
    }

    const { error } = await supabase
      .from("watch_history")
      .delete()
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
