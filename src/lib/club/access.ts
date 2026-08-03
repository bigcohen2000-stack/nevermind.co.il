import "server-only";

import { getPremiumStatus } from "@/actions/premium";
import {
  clearClubSessionCookie,
  readClubSession,
  type ClubSessionPayload,
} from "@/lib/club/session";
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
 * Cookie alone is not enough: member must still be allowlisted and not expired.
 * If club_members is missing (SQL not applied yet), keep cookie trust so login is not bricked.
 */
async function clubMemberStillValid(
  session: ClubSessionPayload,
): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_members")
      .select("phone, expires_at")
      .eq("phone", session.phone)
      .maybeSingle();

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("does not exist") || msg.includes("42p01")) {
        return true;
      }
      return false;
    }

    if (!data) return false;

    if (
      data.expires_at &&
      new Date(data.expires_at).getTime() < Date.now()
    ) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

async function assertLiveClubSession(): Promise<ClubSessionPayload | null> {
  const session = await readClubSession();
  if (!session) return null;

  const version = await clubConfigVersion();
  if (session.v !== version) {
    await clearClubSessionCookie();
    return null;
  }

  const memberOk = await clubMemberStillValid(session);
  if (!memberOk) {
    await clearClubSessionCookie();
    return null;
  }

  return session;
}

/**
 * Fast club cookie first, then Supabase profile flags.
 * NeverMind archive unlock only.
 */
export async function resolveVideoEntitlement(): Promise<ClubAccessResult> {
  const session = await assertLiveClubSession();
  if (session) {
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
  const session = await assertLiveClubSession();
  return Boolean(session);
}
