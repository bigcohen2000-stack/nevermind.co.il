"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isProgressComplete } from "@/lib/videos/progress-shared";
import type { Video } from "@/types/supabase";

export type MarkCompletedResult =
  | { ok: true; completed: boolean }
  | { ok: false; error: string; needsAuth?: boolean };

/**
 * Record completion when playback crosses the near-end threshold.
 * Safe to call repeatedly (upsert).
 */
export async function recordVideoCompletion(
  youtubeId: string,
): Promise<MarkCompletedResult> {
  try {
    const id = youtubeId?.trim();
    if (!id) return { ok: false, error: "חסר מזהה סרטון." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, needsAuth: true, error: "לא מחוברים." };
    }

    const { error } = await supabase.from("video_completions").upsert(
      {
        user_id: user.id,
        youtube_id: id,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,youtube_id" },
    );

    if (error) return { ok: false, error: error.message };
    revalidatePath("/my-list");
    revalidatePath("/profile");
    return { ok: true, completed: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Manual "סמן כהושלם" — also clears in-progress resume row.
 */
export async function markVideoCompleted(
  youtubeId: string,
): Promise<MarkCompletedResult> {
  try {
    const id = youtubeId?.trim();
    if (!id) return { ok: false, error: "חסר מזהה סרטון." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        ok: false,
        needsAuth: true,
        error: "יש להתחבר כדי לסמן סרטון כהושלם.",
      };
    }

    const { error: upsertError } = await supabase
      .from("video_completions")
      .upsert(
        {
          user_id: user.id,
          youtube_id: id,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,youtube_id" },
      );

    if (upsertError) return { ok: false, error: upsertError.message };

    await supabase
      .from("video_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("youtube_id", id);

    revalidatePath("/my-list");
    revalidatePath("/profile");
    revalidatePath(`/watch/${id}`);
    return { ok: true, completed: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getCompletedYoutubeIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("video_completions")
      .select("youtube_id")
      .eq("user_id", user.id);

    if (error || !data) return [];
    return data.map((row) => row.youtube_id);
  } catch {
    return [];
  }
}

export async function isVideoCompleted(youtubeId: string): Promise<boolean> {
  try {
    const id = youtubeId?.trim();
    if (!id) return false;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("video_completions")
      .select("youtube_id")
      .eq("user_id", user.id)
      .eq("youtube_id", id)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export type CompletedVideoItem = Video & { completedAt: string };

export async function listCompletedVideos(
  limit = 24,
): Promise<CompletedVideoItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rows, error } = await supabase
      .from("video_completions")
      .select("youtube_id, completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error || !rows?.length) return [];

    const ids = rows.map((r) => r.youtube_id);
    const { data: videos } = await supabase
      .from("videos")
      .select("*")
      .in("youtube_id", ids);

    const byId = new Map((videos ?? []).map((v) => [v.youtube_id, v]));
    return rows
      .map((row) => {
        const video = byId.get(row.youtube_id);
        if (!video) return null;
        return { ...video, completedAt: row.completed_at };
      })
      .filter((v): v is CompletedVideoItem => Boolean(v));
  } catch {
    return [];
  }
}

/** Helper for progress saves: record completion when ratio crosses threshold. */
export async function maybeRecordCompletionFromProgress(input: {
  youtubeId: string;
  progressSeconds: number;
  durationSeconds: number | null;
}): Promise<void> {
  if (
    !isProgressComplete(input.progressSeconds, input.durationSeconds)
  ) {
    return;
  }
  await recordVideoCompletion(input.youtubeId);
}
