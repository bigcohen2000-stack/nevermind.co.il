"use server";

import { createClient } from "@/lib/supabase/server";
import {
  shouldPersistProgress,
  type ContinueWatchingItem,
} from "@/lib/videos/progress-shared";

export type SaveProgressResult =
  | { ok: true; cleared?: boolean }
  | { ok: false; error: string; skippedAuth?: boolean };

export async function saveVideoProgress(input: {
  youtubeId: string;
  progressSeconds: number;
  durationSeconds?: number | null;
}): Promise<SaveProgressResult> {
  try {
    const youtubeId = input.youtubeId?.trim();
    if (!youtubeId) return { ok: false, error: "חסר מזהה סרטון." };

    const progressSeconds = Math.max(0, Math.floor(input.progressSeconds));
    const durationSeconds =
      input.durationSeconds && input.durationSeconds > 0
        ? Math.floor(input.durationSeconds)
        : null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, skippedAuth: true, error: "לא מחוברים." };
    }

    if (!shouldPersistProgress(progressSeconds, durationSeconds)) {
      await supabase
        .from("video_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("youtube_id", youtubeId);
      return { ok: true, cleared: true };
    }

    const { error } = await supabase.from("video_progress").upsert(
      {
        user_id: user.id,
        youtube_id: youtubeId,
        progress_seconds: progressSeconds,
        duration_seconds: durationSeconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,youtube_id" },
    );

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getVideoProgressSeconds(
  youtubeId: string,
): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data } = await supabase
      .from("video_progress")
      .select("progress_seconds")
      .eq("user_id", user.id)
      .eq("youtube_id", youtubeId)
      .maybeSingle();

    return data?.progress_seconds ?? 0;
  } catch {
    return 0;
  }
}

export async function getLatestContinueWatching(): Promise<ContinueWatchingItem | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: progress } = await supabase
      .from("video_progress")
      .select("youtube_id, progress_seconds, duration_seconds, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!progress) return null;
    if (
      !shouldPersistProgress(
        progress.progress_seconds,
        progress.duration_seconds,
      )
    ) {
      return null;
    }

    const { data: video } = await supabase
      .from("videos")
      .select("title, thumbnail_url, youtube_id")
      .eq("youtube_id", progress.youtube_id)
      .maybeSingle();

    const title = video?.title ?? progress.youtube_id;
    const thumbnailUrl =
      video?.thumbnail_url ??
      `https://i.ytimg.com/vi/${progress.youtube_id}/hqdefault.jpg`;

    return {
      youtubeId: progress.youtube_id,
      progressSeconds: progress.progress_seconds,
      durationSeconds: progress.duration_seconds,
      title,
      thumbnailUrl,
      updatedAt: progress.updated_at,
    };
  } catch {
    return null;
  }
}
