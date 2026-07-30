"use server";

import { getServerEnv } from "@/env";
import { syncYoutubeLibrary, type SyncInput, type SyncResult } from "@/lib/youtube/sync";

/**
 * Admin Server Action trigger for YouTube → Supabase sync.
 * Pass the same CRON_SECRET used by /api/admin/sync.
 */
export async function triggerYoutubeSync(
  secret: string,
  input: SyncInput = {},
): Promise<SyncResult | { ok: false; error: string }> {
  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (!secret || secret !== env.CRON_SECRET) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    return await syncYoutubeLibrary(input);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
