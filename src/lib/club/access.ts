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
  /**
   * When the membership ends (ISO), from club_members.expires_at or
   * profiles.access_expires_at. Null means open ended.
   */
  expiresAt: string | null;
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

type ClubMemberCheck = {
  valid: boolean;
  /** club_members.expires_at when the column is readable. */
  expiresAt: string | null;
};

/**
 * Cookie alone is not enough: member must still be allowlisted and not expired.
 * If club_members is missing (SQL not applied yet), keep cookie trust so login is not bricked.
 */
async function clubMemberStillValid(
  session: ClubSessionPayload,
): Promise<ClubMemberCheck> {
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
        return { valid: true, expiresAt: null };
      }
      return { valid: false, expiresAt: null };
    }

    if (!data) return { valid: false, expiresAt: null };

    if (
      data.expires_at &&
      new Date(data.expires_at).getTime() < Date.now()
    ) {
      return { valid: false, expiresAt: data.expires_at };
    }

    return { valid: true, expiresAt: data.expires_at ?? null };
  } catch {
    return { valid: true, expiresAt: null };
  }
}

type LiveClubSession = {
  session: ClubSessionPayload;
  expiresAt: string | null;
};

async function assertLiveClubSession(): Promise<LiveClubSession | null> {
  const session = await readClubSession();
  if (!session) return null;

  const version = await clubConfigVersion();
  if (session.v !== version) {
    await clearClubSessionCookie();
    return null;
  }

  const member = await clubMemberStillValid(session);
  if (!member.valid) {
    await clearClubSessionCookie();
    return null;
  }

  return { session, expiresAt: member.expiresAt };
}

/**
 * Fast club cookie first, then Supabase profile flags.
 * NeverMind archive unlock only.
 */
export async function resolveVideoEntitlement(): Promise<ClubAccessResult> {
  const live = await assertLiveClubSession();
  if (live) {
    const premium = await getPremiumStatus().catch(() => ({
      isAuthenticated: false,
      isPremium: false,
      hasVideoAccess: false,
      userId: null,
      accessExpiresAt: null as string | null,
    }));
    return {
      entitled: true,
      clubSession: true,
      hasVideoAccess: true,
      isAuthenticated: premium.isAuthenticated,
      phone: live.session.phone,
      displayName: live.session.name?.trim() || null,
      expiresAt: live.expiresAt ?? premium.accessExpiresAt ?? null,
    };
  }

  const premium = await getPremiumStatus().catch(() => ({
    isAuthenticated: false,
    isPremium: false,
    hasVideoAccess: false,
    userId: null,
    accessExpiresAt: null as string | null,
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
    expiresAt: hasVideoAccess ? premium.accessExpiresAt ?? null : null,
  };
}

export async function validateClubSession(): Promise<boolean> {
  const live = await assertLiveClubSession();
  return Boolean(live);
}
