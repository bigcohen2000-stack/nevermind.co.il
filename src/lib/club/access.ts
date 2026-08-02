import "server-only";

import { getPremiumStatus } from "@/actions/premium";
import { clearClubSessionCookie, readClubSession } from "@/lib/club/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ClubAccessResult = {
  entitled: boolean;
  clubSession: boolean;
  hasVideoAccess: boolean;
  isAuthenticated: boolean;
  phone: string | null;
  /** Display name from club cookie (if set). */
  displayName: string | null;
};

async function clubConfigVersion(): Promise<number> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_config")
      .select("version")
      .eq("id", 1)
      .maybeSingle();
    return data?.version ?? 1;
  } catch {
    return 1;
  }
}

/**
 * Fast club cookie first, then Supabase profile flags.
 * NeverMind archive unlock only.
 */
export async function resolveVideoEntitlement(): Promise<ClubAccessResult> {
  const session = await readClubSession();
  if (session) {
    const version = await clubConfigVersion();
    if (session.v !== version) {
      await clearClubSessionCookie();
    } else {
      // Entitled via club cookie. Still resolve auth for progress / save UI.
      const premium = await getPremiumStatus().catch(() => ({
        isAuthenticated: false,
        isPremium: false,
        hasVideoAccess: false,
        userId: null,
      }));
      return {
        entitled: true,
        clubSession: true,
        hasVideoAccess: true,
        isAuthenticated: premium.isAuthenticated,
        phone: session.phone,
        displayName: session.name?.trim() || null,
      };
    }
  }

  const premium = await getPremiumStatus().catch(() => ({
    isAuthenticated: false,
    isPremium: false,
    hasVideoAccess: false,
    userId: null,
  }));

  const hasVideoAccess =
    Boolean(premium.hasVideoAccess) || Boolean(premium.isPremium);

  return {
    entitled: hasVideoAccess,
    clubSession: false,
    hasVideoAccess,
    isAuthenticated: premium.isAuthenticated,
    phone: null,
    displayName: null,
  };
}

export async function validateClubSession(): Promise<boolean> {
  const session = await readClubSession();
  if (!session) return false;
  const version = await clubConfigVersion();
  if (session.v !== version) {
    await clearClubSessionCookie();
    return false;
  }
  return true;
}
