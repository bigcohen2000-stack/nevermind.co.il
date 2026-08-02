"use server";

import { createClient } from "@/lib/supabase/server";

export type RandomInvestigationResult =
  | { ok: true; href: string; youtubeId: string; startSeconds: number | null }
  | { ok: false; error: string };

/**
 * Pick one random public-visible video (ORDER BY random via RPC or offset).
 * Optionally attach a random concept entry-point timestamp as ?t=.
 */
export async function getRandomInvestigation(): Promise<RandomInvestigationResult> {
  try {
    const supabase = await createClient();

    let youtubeId: string | null = null;
    let videoUuid: string | null = null;

    // Prefer true Postgres RANDOM() when the helper RPC exists.
    const { data: rpcRow, error: rpcError } = await supabase.rpc(
      "get_random_video",
      {},
    );

    if (!rpcError && rpcRow) {
      const row = Array.isArray(rpcRow) ? rpcRow[0] : rpcRow;
      if (row && typeof row === "object") {
        const typed = row as { id?: string; youtube_id?: string };
        youtubeId = typed.youtube_id ?? null;
        videoUuid = typed.id ?? null;
      }
    }

    if (!youtubeId || !videoUuid) {
      const { count, error: countError } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("is_gated", false)
        .eq("is_unlisted", false);

      if (countError) {
        return { ok: false, error: countError.message };
      }

      const total = count ?? 0;
      if (total < 1) {
        return { ok: false, error: "אין סרטונים זמינים כרגע." };
      }

      const offset = Math.floor(Math.random() * total);
      const { data: video, error: videoError } = await supabase
        .from("videos")
        .select("id, youtube_id")
        .eq("is_gated", false)
        .eq("is_unlisted", false)
        .range(offset, offset)
        .maybeSingle();

      if (videoError) {
        return { ok: false, error: videoError.message };
      }
      if (!video?.youtube_id) {
        return { ok: false, error: "אין סרטונים זמינים כרגע." };
      }

      youtubeId = video.youtube_id;
      videoUuid = video.id;
    }

    let startSeconds: number | null = null;
    const { data: conceptMarks } = await supabase
      .from("video_concepts")
      .select("start_timestamp")
      .eq("video_id", videoUuid)
      .not("start_timestamp", "is", null)
      .limit(24);

    const stamps = (conceptMarks ?? [])
      .map((row) => row.start_timestamp)
      .filter((n): n is number => typeof n === "number" && n >= 0);

    if (stamps.length > 0) {
      startSeconds = stamps[Math.floor(Math.random() * stamps.length)] ?? null;
    }

    const href =
      startSeconds != null
        ? `/watch/${youtubeId}?t=${startSeconds}`
        : `/watch/${youtubeId}`;

    return { ok: true, href, youtubeId, startSeconds };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "בחירה אקראית נכשלה.",
    };
  }
}
