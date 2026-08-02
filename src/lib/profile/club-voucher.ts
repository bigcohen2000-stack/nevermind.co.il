import "server-only";

import { CLUB_VOUCHER_VALIDITY_DAYS } from "@/lib/club/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ClubVoucherState = {
  memberSince: string;
  expiresAt: string;
  expired: boolean;
  daysLeft: number;
};

/**
 * Resolve club voucher window from club_members.created_at for the session phone.
 */
export async function getClubVoucherState(
  phone: string | null,
): Promise<ClubVoucherState | null> {
  if (!phone?.trim()) return null;

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_members")
      .select("created_at")
      .eq("phone", phone.trim())
      .maybeSingle();

    if (!data?.created_at) return null;

    const memberSince = data.created_at;
    const start = new Date(memberSince).getTime();
    const expiresAtMs =
      start + CLUB_VOUCHER_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();
    const now = Date.now();
    const expired = now > expiresAtMs;
    const daysLeft = expired
      ? 0
      : Math.max(1, Math.ceil((expiresAtMs - now) / (24 * 60 * 60 * 1000)));

    return { memberSince, expiresAt, expired, daysLeft };
  } catch {
    return null;
  }
}
