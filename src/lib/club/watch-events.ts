import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Best-effort club watch identity log. Never throws to the page.
 */
export async function logClubWatchEvent(input: {
  phone: string;
  videoId: string;
}): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    await admin.from("club_watch_events").insert({
      phone: input.phone,
      video_id: input.videoId,
    });
  } catch {
    // ignore
  }
}
