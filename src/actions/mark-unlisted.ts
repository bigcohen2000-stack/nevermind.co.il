"use server";

import { revalidatePath } from "next/cache";

import { isStudioAuthenticated } from "@/lib/studio/session";
import { syncYoutubeLibrary } from "@/lib/youtube/sync";

export type MarkUnlistedResult =
  | {
      ok: true;
      upserted: number;
      unlistedCount: number;
      gatedCount: number;
      youtubeIds: string[];
      errors: string[];
    }
  | { ok: false; error: string };

const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function parseYoutubeIds(raw: string): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const token of raw.split(/[\s,;]+/)) {
    const id = token.trim();
    if (!YT_ID.test(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/**
 * Studio-safe bulk path: upsert explicit youtube IDs via sync unlistedVideoIds,
 * forcing is_unlisted + is_gated for club / members content.
 */
export async function markUnlistedVideos(
  rawIds: string,
): Promise<MarkUnlistedResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "Unauthorized. Unlock the Studio first." };
    }

    const youtubeIds = parseYoutubeIds(rawIds);
    if (youtubeIds.length === 0) {
      return {
        ok: false,
        error: "Paste at least one valid 11-character YouTube ID.",
      };
    }
    if (youtubeIds.length > 100) {
      return {
        ok: false,
        error: "Max 100 IDs per run. Split into batches.",
      };
    }

    const result = await syncYoutubeLibrary({
      unlistedVideoIds: youtubeIds,
      gatedVideoIds: youtubeIds,
      maxTranscriptFetches: 0,
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/videos");
    revalidatePath("/studio");

    return {
      ok: true,
      upserted: result.upserted,
      unlistedCount: result.unlistedCount,
      gatedCount: result.gatedCount,
      youtubeIds: result.youtubeIds,
      errors: result.errors,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
