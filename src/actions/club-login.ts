"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearClubSessionCookie,
  formatPasswordHash,
  generateRawClubToken,
  hashClubToken,
  setClubSessionCookie,
  verifyClubPassword,
} from "@/lib/club/session";
import type { ClubPasswordStatus } from "@/lib/club/password-status";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

export type { ClubPasswordStatus } from "@/lib/club/password-status";

function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, "").trim();
}

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://nevermind.co.il";
}

async function userAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("user-agent");
  } catch {
    return null;
  }
}

async function getConfigVersion(): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("club_config")
    .select("version")
    .eq("id", 1)
    .maybeSingle();
  return data?.version ?? 1;
}

async function logLogin(input: {
  phone: string;
  tokenId: string | null;
  source: "magic" | "password";
}) {
  const admin = getSupabaseAdmin();
  await admin.from("club_login_events").insert({
    phone: input.phone,
    token_id: input.tokenId,
    source: input.source,
    user_agent: await userAgent(),
  });
}

export type ClubActionResult =
  | { ok: true; url?: string; message?: string }
  | { ok: false; error: string };

/**
 * Redeem personal magic link token. Sets nm_club cookie.
 */
export async function redeemClubToken(
  rawToken: string,
): Promise<ClubActionResult> {
  const token = rawToken.trim();
  if (!token || token.length < 16) {
    return { ok: false, error: "הקישור אינו תקף." };
  }

  try {
    const admin = getSupabaseAdmin();
    const tokenHash = hashClubToken(token);
    const { data: row, error } = await admin
      .from("club_tokens")
      .select("id, phone, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !row) {
      return { ok: false, error: "הקישור אינו תקף." };
    }
    if (row.revoked_at) {
      return { ok: false, error: "הקישור בוטל." };
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return { ok: false, error: "פג תוקף הקישור." };
    }

    const version = await getConfigVersion();
    await setClubSessionCookie({
      phone: row.phone,
      tokenId: row.id,
      v: version,
    });

    await admin
      .from("club_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", row.id);

    await logLogin({
      phone: row.phone,
      tokenId: row.id,
      source: "magic",
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Backup: phone + shared club password from club_config.
 */
export async function loginClubPassword(input: {
  phone: string;
  password: string;
}): Promise<ClubActionResult> {
  const phone = normalizePhone(input.phone);
  const password = input.password.trim();

  if (phone.length < 9) {
    return {
      ok: false,
      error:
        "מספר הטלפון או הסיסמה אינם נכונים. לא עבד? אפשר לכתוב לי בוואטסאפ.",
    };
  }
  if (!password) {
    return {
      ok: false,
      error:
        "מספר הטלפון או הסיסמה אינם נכונים. לא עבד? אפשר לכתוב לי בוואטסאפ.",
    };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: config } = await admin
      .from("club_config")
      .select("password_hash, version")
      .eq("id", 1)
      .maybeSingle();

    const stored = config?.password_hash?.trim() ?? "";
    if (!stored || !verifyClubPassword(password, stored)) {
      return {
        ok: false,
        error:
          "מספר הטלפון או הסיסמה אינם נכונים. לא עבד? אפשר לכתוב לי בוואטסאפ.",
      };
    }

    await setClubSessionCookie({
      phone,
      tokenId: null,
      v: config?.version ?? 1,
    });

    await logLogin({ phone, tokenId: null, source: "password" });

    return { ok: true, message: "הגישה למאגר פתוחה במכשיר הזה." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function logoutClub(): Promise<void> {
  await clearClubSessionCookie();
  redirect("/members#login");
}

/**
 * Studio-only: mint personal magic link for WhatsApp.
 */
export async function mintClubToken(input: {
  phone: string;
  daysValid: number;
}): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const phone = normalizePhone(input.phone);
  const days = Math.min(Math.max(1, Math.floor(input.daysValid || 30)), 730);
  if (phone.length < 9) {
    return { ok: false, error: "מספר טלפון לא תקין." };
  }

  try {
    const raw = generateRawClubToken();
    const tokenHash = hashClubToken(raw);
    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_tokens")
      .insert({
        token_hash: tokenHash,
        phone,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "יצירת טוקן נכשלה.",
      };
    }

    const url = `${siteOrigin()}/club/login?token=${encodeURIComponent(raw)}`;
    return { ok: true, url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Studio-only: whether a shared club password exists (never returns the hash).
 */
export async function getClubPasswordStatus(): Promise<ClubPasswordStatus> {
  const empty: ClubPasswordStatus = {
    isSet: false,
    version: 1,
    updatedAt: null,
  };
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return empty;

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_config")
      .select("password_hash, version, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return empty;
    return {
      isSet: Boolean(data.password_hash && data.password_hash.length > 0),
      version: data.version ?? 1,
      updatedAt: data.updated_at ?? null,
    };
  } catch {
    return empty;
  }
}

/**
 * Studio-only: set shared backup password in club_config (no Vercel redeploy).
 */
export async function setClubSharedPassword(
  password: string,
): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return { ok: false, error: "סיסמה קצרה מדי (מינימום 6 תווים)." };
  }
  if (trimmed.length > 128) {
    return { ok: false, error: "סיסמה ארוכה מדי." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: current } = await admin
      .from("club_config")
      .select("version")
      .eq("id", 1)
      .maybeSingle();

    const nextVersion = (current?.version ?? 1) + 1;
    const password_hash = formatPasswordHash(trimmed);

    const { error } = await admin.from("club_config").upsert({
      id: 1,
      password_hash,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      message: `הסיסמה נשמרה. חברי מועדון נכנסים עם טלפון + הסיסמה הזו ב־/members. גרסה ${nextVersion}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Studio-only: revoke a token by id.
 */
export async function revokeClubToken(
  tokenId: string,
): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("club_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", tokenId);

    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "הטוקן בוטל." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
