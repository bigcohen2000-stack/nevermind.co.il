"use server";

import { revalidatePath } from "next/cache";

import { normalizeClubPhone } from "@/lib/club/phone";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MarkCaughtUpResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Studio: mark that this club member is caught up (sets last_seen_at = now).
 * Used so "מה חדש" resets for them.
 */
export async function markClubMemberCaughtUp(
  phoneRaw: string,
): Promise<MarkCaughtUpResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  const phone = normalizeClubPhone(phoneRaw);
  if (!phone || phone.length < 9) {
    return { ok: false, error: "מספר טלפון לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { error } = await admin
      .from("club_members")
      .update({ last_seen_at: now, updated_at: now })
      .eq("phone", phone);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/studio/users");
    revalidatePath("/members");
    return { ok: true, message: "סומן כמעודכן עד כאן." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה.",
    };
  }
}
