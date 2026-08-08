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
  /**
   * When the member marked in the expiry banner that a renewal request was
   * sent on WhatsApp (ISO). Null when there is no pending mark.
   */
  renewalRequestedAt: string | null;
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
  /** club_members.renewal_requested_at when the column is readable. */
  renewalRequestedAt: string | null;
};

/** Expired end date means the cookie is no longer trusted. */
function checkFromRow(row: {
  expires_at: string | null;
  renewal_requested_at?: string | null;
}): ClubMemberCheck {
  const expiresAt = row.expires_at ?? null;
  const expired = Boolean(
    expiresAt && new Date(expiresAt).getTime() < Date.now(),
  );
  return {
    valid: !expired,
    expiresAt,
    renewalRequestedAt: row.renewal_requested_at ?? null,
  };
}

/**
 * Cookie alone is not enough: member must still be allowlisted and not expired.
 * If club_members is missing (SQL not applied yet), keep cookie trust so login is not bricked.
 */
async function clubMemberStillValid(
  session: ClubSessionPayload,
): Promise<ClubMemberCheck> {
  const denied: ClubMemberCheck = {
    valid: false,
    expiresAt: null,
    renewalRequestedAt: null,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_members")
      .select("phone, expires_at, renewal_requested_at")
      .eq("phone", session.phone)
      .maybeSingle();

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      // Migration 43 not applied yet: read the older column set instead of
      // treating the whole session as invalid.
      if (msg.includes("renewal_requested_at")) {
        const legacy = await admin
          .from("club_members")
          .select("phone, expires_at")
          .eq("phone", session.phone)
          .maybeSingle();
        if (legacy.error || !legacy.data) return denied;
        return checkFromRow(legacy.data);
      }
      if (msg.includes("does not exist") || msg.includes("42p01")) {
        return { valid: true, expiresAt: null, renewalRequestedAt: null };
      }
      return denied;
    }

    if (!data) return denied;

    return checkFromRow(data);
  } catch {
    return { valid: true, expiresAt: null, renewalRequestedAt: null };
  }
}

type LiveClubSession = {
  session: ClubSessionPayload;
  expiresAt: string | null;
  renewalRequestedAt: string | null;
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

  return {
    session,
    expiresAt: member.expiresAt,
    renewalRequestedAt: member.renewalRequestedAt,
  };
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
      renewalRequestedAt: live.renewalRequestedAt,
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
    renewalRequestedAt: null,
  };
}

export async function validateClubSession(): Promise<boolean> {
  const live = await assertLiveClubSession();
  return Boolean(live);
}
