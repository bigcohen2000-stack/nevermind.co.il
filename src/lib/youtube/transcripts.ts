import "server-only";

import { YoutubeTranscript } from "youtube-transcript";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extractAndSaveCoreFacts } from "@/lib/youtube/core-facts";
import type { TranscriptSegment } from "@/lib/videos/heatmap";

export type TranscriptFetchResult =
  | { ok: true; content: string; segments: TranscriptSegment[]; coreFacts?: string[] }
  | { ok: false; error: string };

/**
 * Fetch caption text for a YouTube video and upsert into video_transcripts
 * (plain content + timed segments for the heatmap).
 * On success, extract core_facts once via OpenAI (no-op if already set / no key).
 */
export async function upsertTranscriptForVideo(
  videoId: string,
  youtubeId: string,
): Promise<TranscriptFetchResult> {
  try {
    const raw = await YoutubeTranscript.fetchTranscript(youtubeId);
    const segments: TranscriptSegment[] = raw
      .map((segment) => ({
        offsetMs: Math.max(0, Math.round(Number(segment.offset) || 0)),
        durationMs: Math.max(0, Math.round(Number(segment.duration) || 0)),
        text: (segment.text ?? "").replace(/\s+/g, " ").trim(),
      }))
      .filter((segment) => segment.text.length > 0);

    const content = segments
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!content) {
      return { ok: false, error: `transcript ${youtubeId}: empty captions` };
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from("video_transcripts").upsert(
      {
        video_id: videoId,
        content,
        segments,
      },
      { onConflict: "video_id" },
    );

    if (error) {
      return {
        ok: false,
        error: `transcript upsert ${youtubeId}: ${error.message}`,
      };
    }

    const factsResult = await extractAndSaveCoreFacts(videoId, content);
    return {
      ok: true,
      content,
      segments,
      coreFacts: factsResult.ok ? factsResult.facts : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: `transcript ${youtubeId}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
