"use server";

import { revalidatePath } from "next/cache";
import { google } from "googleapis";

import { getServerEnv } from "@/env";
import { extractCuratedConcepts } from "@/lib/concepts/quality";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { firstConceptOffsetSeconds } from "@/lib/videos/heatmap";
import { computeIsGated } from "@/lib/youtube/sync";
import { upsertTranscriptForVideo } from "@/lib/youtube/transcripts";

export type IngestVideoResult =
  | {
      ok: true;
      youtubeId: string;
      videoId: string;
      title: string;
      concepts: string[];
      transcriptLength: number;
      isUnlisted: boolean;
      isGated: boolean;
    }
  | { ok: false; error: string };

/**
 * Pull a single YouTube video (metadata + transcript + concepts) into Supabase.
 */
export async function ingestVideoData(
  youtubeUrl: string,
): Promise<IngestVideoResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "Unauthorized. Unlock the Studio first." };
    }

    const raw = youtubeUrl?.trim();
    if (!raw) {
      return { ok: false, error: "YouTube URL is required" };
    }

    const youtubeId = extractYoutubeId(raw);
    if (!youtubeId) {
      return {
        ok: false,
        error: "Could not extract youtube_id from URL (youtu.be / youtube.com)",
      };
    }

    const env = getServerEnv();
    const admin = getSupabaseAdmin();

    const metadata = await fetchYoutubeMetadata(youtubeId, env.YOUTUBE_API_KEY);

    if (!metadata.ok) {
      return metadata;
    }

    const concepts = extractKnownConcepts(
      metadata.title,
      metadata.description,
    );

    const isUnlisted = metadata.isUnlisted;
    const isGated = computeIsGated({
      isUnlisted,
      title: metadata.title,
      description: metadata.description,
      force: isUnlisted,
    });

    const { data: video, error: upsertError } = await admin
      .from("videos")
      .upsert(
        {
          youtube_id: youtubeId,
          title: metadata.title,
          description: metadata.description,
          thumbnail_url: metadata.thumbnailUrl,
          is_unlisted: isUnlisted,
          is_gated: isGated,
        },
        { onConflict: "youtube_id" },
      )
      .select("id")
      .single();

    if (upsertError || !video) {
      return {
        ok: false,
        error: `videos upsert failed: ${upsertError?.message ?? "unknown"}`,
      };
    }

    const transcript = await upsertTranscriptForVideo(video.id, youtubeId);
    const transcriptLength = transcript.ok ? transcript.content.length : 0;
    const segments = transcript.ok ? transcript.segments : [];

    for (const name of concepts) {
      const { data: concept, error: conceptError } = await admin
        .from("concepts")
        .upsert({ name, category: null }, { onConflict: "name" })
        .select("id")
        .single();

      if (conceptError || !concept) continue;

      const startTimestamp = firstConceptOffsetSeconds(name, segments);

      await admin.from("video_concepts").upsert(
        {
          video_id: video.id,
          concept_id: concept.id,
          start_timestamp: startTimestamp,
        },
        { onConflict: "video_id,concept_id" },
      );
    }

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/videos");

    return {
      ok: true,
      youtubeId,
      videoId: video.id,
      title: metadata.title,
      concepts,
      transcriptLength,
      isUnlisted,
      isGated,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Supports youtube.com, youtu.be, shorts/embed/live, and bare 11-char ids. */
function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        ["embed", "shorts", "live", "v"].includes(parts[0]) &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchYoutubeMetadata(
  youtubeId: string,
  apiKey: string,
): Promise<
  | {
      ok: true;
      title: string;
      description: string;
      thumbnailUrl: string | null;
      isUnlisted: boolean;
    }
  | { ok: false; error: string }
> {
  try {
    const youtube = google.youtube({ version: "v3", auth: apiKey });
    const res = await youtube.videos.list({
      part: ["snippet", "status"],
      id: [youtubeId],
      maxResults: 1,
    });

    const item = res.data.items?.[0];
    if (!item?.snippet) {
      return { ok: false, error: `YouTube video not found: ${youtubeId}` };
    }

    const privacy = item.status?.privacyStatus;
    if (privacy === "private") {
      return {
        ok: false,
        error: `YouTube video is private (API cannot ingest): ${youtubeId}`,
      };
    }

    const thumbs = item.snippet.thumbnails;
    const thumbnailUrl =
      thumbs?.maxres?.url ??
      thumbs?.standard?.url ??
      thumbs?.high?.url ??
      thumbs?.medium?.url ??
      thumbs?.default?.url ??
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

    return {
      ok: true,
      title: item.snippet.title?.trim() || youtubeId,
      description: item.snippet.description ?? "",
      thumbnailUrl,
      isUnlisted: privacy === "unlisted",
    };
  } catch (err) {
    return {
      ok: false,
      error: `YouTube API error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/** Match curated Hebrew concepts from title/description. */
function extractKnownConcepts(title: string, description: string): string[] {
  return extractCuratedConcepts(title, description, [], 4);
}
