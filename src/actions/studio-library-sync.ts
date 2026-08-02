"use server";

import { syncYoutubeLibrary } from "@/lib/youtube/sync";
import { isStudioAuthenticated } from "@/lib/studio/session";

export type StudioLibrarySyncResult =
  | { ok: true; message: string; upserted: number }
  | { ok: false; message: string };

/**
 * Studio-only manual YouTube library sync.
 */
export async function runStudioLibrarySync(): Promise<StudioLibrarySyncResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, message: "הסטודיו נעול. התחברו דרך הסימנייה." };
  }

  try {
    const result = await syncYoutubeLibrary({});
    const soft =
      result.errors.length > 0
        ? ` שגיאות רכות: ${result.errors.length}.`
        : "";
    return {
      ok: true,
      upserted: result.upserted,
      message: `סונכרנו ${result.upserted} סרטונים.${soft}`,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "סנכרון הספרייה נכשל. נסו שוב.",
    };
  }
}
