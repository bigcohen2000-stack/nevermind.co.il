"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CLUB_MAGIC_TTL_MS } from "@/lib/club/constants";
import { normalizeClubPhone } from "@/lib/club/phone";
import {
  assertClubLoginRateLimit,
  clearClubLoginFailures,
  recordClubLoginFailure,
} from "@/lib/club/rate-limit";
import {
  clearClubSessionCookie,
  formatPasswordHash,
  generateRawClubToken,
  hashClubFeedToken,
  hashClubToken,
  setClubSessionCookie,
  verifyClubPassword,
} from "@/lib/club/session";
import type { ClubPasswordStatus } from "@/lib/club/password-status";
import { getClubPodcastFeedUrl } from "@/lib/podcast/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

export type { ClubPasswordStatus } from "@/lib/club/password-status";

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://nevermind.co.il";
}

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
    return h.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
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

async function upsertMember(input: {
  phone: string;
  displayName: string;
}): Promise<void> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const name = input.displayName.trim();
  await admin.from("club_members").upsert(
    {
      phone: input.phone,
      display_name: name,
      updated_at: now,
      last_seen_at: now,
    },
    { onConflict: "phone" },
  );
}

async function logLogin(input: {
  phone: string;
  displayName: string | null;
  tokenId: string | null;
  source: "magic" | "password";
}) {
  const admin = getSupabaseAdmin();
  await admin.from("club_login_events").insert({
    phone: input.phone,
    display_name: input.displayName,
    token_id: input.tokenId,
    source: input.source,
    user_agent: await userAgent(),
  });
}

/**
 * Email admin only when a brand-new club session cookie is minted.
 */
async function notifyAdminClubLogin(input: {
  phone: string;
  displayName: string;
  source: "magic" | "password";
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>";
  if (!apiKey || !adminEmail) return;

  try {
    const resend = new Resend(apiKey);
    const when = new Date().toLocaleString("he-IL");
    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `כניסת מועדון: ${input.displayName || input.phone}`,
      text: [
        "כניסת מועדון חדשה ב-nevermind.co.il",
        `שם: ${input.displayName || "-"}`,
        `טלפון: ${input.phone}`,
        `מקור: ${input.source === "magic" ? "קישור קסם" : "סיסמה"}`,
        `זמן: ${when}`,
      ].join("\n"),
    });
  } catch {
    // Never block login on notify failure.
  }
}

export type ClubActionResult =
  | {
      ok: true;
      url?: string;
      message?: string;
      phone?: string;
      member?: {
        phone: string;
        display_name: string;
        notes: string | null;
        expires_at: string | null;
        created_at: string;
        updated_at: string;
        last_seen_at: string | null;
      };
    }
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
      await admin
        .from("club_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", row.id);
      return { ok: false, error: "פג תוקף הקישור." };
    }

    const phone = normalizeClubPhone(row.phone) ?? row.phone.replace(/\D/g, "");
    const { data: member } = await admin
      .from("club_members")
      .select("display_name")
      .eq("phone", phone)
      .maybeSingle();
    const displayName = member?.display_name?.trim() || "";

    await upsertMember({ phone, displayName: displayName || phone.slice(-4) });

    const version = await getConfigVersion();
    await setClubSessionCookie({
      phone,
      name: displayName || null,
      tokenId: row.id,
      v: version,
    });

    await admin
      .from("club_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", row.id);

    await logLogin({
      phone,
      displayName: displayName || null,
      tokenId: row.id,
      source: "magic",
    });
    await notifyAdminClubLogin({
      phone,
      displayName: displayName || phone,
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
 * Phone + shared club password. Phone must be on club_members allowlist.
 */
export async function loginClubPassword(input: {
  phone: string;
  password: string;
  displayName?: string;
}): Promise<ClubActionResult> {
  const phone = normalizeClubPhone(input.phone);
  const password = input.password.trim();
  const displayName = (input.displayName ?? "").trim();
  const ip = await clientIp();
  const rateKeys = [phone ? `phone:${phone}` : "", `ip:${ip}`].filter(Boolean);

  const rate = assertClubLoginRateLimit(rateKeys);
  if (!rate.ok) return rate;

  if (!phone) {
    recordClubLoginFailure(rateKeys);
    return { ok: false, error: "מספר הטלפון אינו תקין." };
  }
  if (!displayName || displayName.length < 2) {
    return { ok: false, error: "נא להזין שם מלא." };
  }
  if (!password) {
    recordClubLoginFailure(rateKeys);
    return { ok: false, error: "סיסמת המועדון שגויה." };
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: member } = await admin
      .from("club_members")
      .select("phone, display_name, expires_at")
      .eq("phone", phone)
      .maybeSingle();

    if (!member) {
      recordClubLoginFailure(rateKeys);
      return {
        ok: false,
        error: "מספר הטלפון אינו מורשה במערכת. בקשו גישה בוואטסאפ.",
      };
    }

    if (
      member.expires_at &&
      new Date(member.expires_at).getTime() < Date.now()
    ) {
      recordClubLoginFailure(rateKeys);
      return {
        ok: false,
        error: "תוקף הגישה שלכם הסתיים. פנו בוואטסאפ לחידוש.",
      };
    }

    const { data: config } = await admin
      .from("club_config")
      .select("password_hash, version")
      .eq("id", 1)
      .maybeSingle();

    const stored = config?.password_hash?.trim() ?? "";
    if (!stored || !verifyClubPassword(password, stored)) {
      recordClubLoginFailure(rateKeys);
      return { ok: false, error: "סיסמת המועדון שגויה." };
    }

    clearClubLoginFailures(rateKeys);

    await upsertMember({ phone, displayName });

    await setClubSessionCookie({
      phone,
      name: displayName,
      tokenId: null,
      v: config?.version ?? 1,
    });

    await logLogin({
      phone,
      displayName,
      tokenId: null,
      source: "password",
    });
    await notifyAdminClubLogin({
      phone,
      displayName,
      source: "password",
    });

    return {
      ok: true,
      message:
        "הגישה למאגר פתוחה במכשיר הזה. הגישה אישית. הסיסמה והקישור אינם להעברה.",
    };
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
 * Studio-only: add or update allowlisted club member.
 */
export async function upsertClubMember(input: {
  phone: string;
  displayName: string;
  notes?: string;
  expiresAt?: string | null;
}): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return { ok: false, error: "Studio locked." };

  const phone = normalizeClubPhone(input.phone);
  const displayName = input.displayName.trim();
  if (!phone) {
    return {
      ok: false,
      error:
        'מספר טלפון לא תקין. הזן כמו 05XXXXXXXX או 9725XXXXXXXX (רק ספרות / מקף).',
    };
  }
  if (displayName.length < 2) return { ok: false, error: "נא להזין שם (לפחות 2 תווים)." };

  let expiresAt: string | null | undefined = undefined;
  if (input.expiresAt !== undefined) {
    if (input.expiresAt === null) {
      expiresAt = null;
    } else {
      const trimmed = input.expiresAt.trim();
      if (!trimmed) {
        expiresAt = null;
      } else {
        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime())) {
          return { ok: false, error: "תאריך תפוגה לא תקין." };
        }
        expiresAt = parsed.toISOString();
      }
    }
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const row: {
      phone: string;
      display_name: string;
      notes: string | null;
      updated_at: string;
      expires_at?: string | null;
    } = {
      phone,
      display_name: displayName,
      notes: input.notes?.trim() || null,
      updated_at: now,
    };
    if (expiresAt !== undefined) {
      row.expires_at = expiresAt;
    }
    const { data, error } = await admin
      .from("club_members")
      .upsert(row, { onConflict: "phone" })
      .select(
        "phone, display_name, notes, expires_at, created_at, updated_at, last_seen_at",
      )
      .single();

    if (error) {
      const msg = error.message || "";
      if (
        msg.includes("schema cache") ||
        msg.includes("Could not find the table") ||
        msg.includes("does not exist")
      ) {
        return {
          ok: false,
          error:
            "טבלת club_members חסרה או שה-schema cache לא התעדכן. הרץ 35_ensure_club_members.sql, ואז ב-Supabase: Settings → API → Reload schema.",
        };
      }
      // Retry without expires_at if column missing.
      if (msg.includes("expires_at")) {
        const retry = await admin
          .from("club_members")
          .upsert(
            {
              phone,
              display_name: displayName,
              notes: input.notes?.trim() || null,
              updated_at: now,
            },
            { onConflict: "phone" },
          )
          .select("phone, display_name, notes, created_at, updated_at, last_seen_at")
          .single();
        if (retry.error) return { ok: false, error: retry.error.message };
        return {
          ok: true,
          phone,
          message: `נשמר: ${displayName} (${phone}).`,
          member: {
            phone: retry.data.phone,
            display_name: retry.data.display_name,
            notes: retry.data.notes,
            expires_at: null,
            created_at: retry.data.created_at,
            updated_at: retry.data.updated_at,
            last_seen_at: retry.data.last_seen_at,
          },
        };
      }
      return { ok: false, error: msg };
    }

    return {
      ok: true,
      phone,
      message: `נשמר: ${displayName} (${phone}).`,
      member: data
        ? {
            phone: data.phone,
            display_name: data.display_name,
            notes: data.notes,
            expires_at: data.expires_at,
            created_at: data.created_at,
            updated_at: data.updated_at,
            last_seen_at: data.last_seen_at,
          }
        : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function deleteClubMember(phoneRaw: string): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return { ok: false, error: "Studio locked." };
  const phone = normalizeClubPhone(phoneRaw);
  if (!phone) return { ok: false, error: "מספר טלפון לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("club_members").delete().eq("phone", phone);
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "החבר הוסר." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Studio-only: mint personal magic link (default 30 minutes).
 */
export async function mintClubToken(input: {
  phone: string;
  /** Minutes until link expires. Default 30. Cap 24h. */
  minutesValid?: number;
  displayName?: string;
}): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const phone = normalizeClubPhone(input.phone);
  const minutes = Math.min(
    Math.max(5, Math.floor(input.minutesValid ?? 30)),
    24 * 60,
  );
  if (!phone) {
    return { ok: false, error: "מספר טלפון לא תקין." };
  }

  try {
    const displayName = (input.displayName ?? "").trim();
    if (displayName.length >= 2) {
      await upsertMember({ phone, displayName });
    } else {
      const admin = getSupabaseAdmin();
      const { data: existing } = await admin
        .from("club_members")
        .select("phone")
        .eq("phone", phone)
        .maybeSingle();
      if (!existing) {
        await upsertMember({ phone, displayName: phone.slice(-4) });
      }
    }

    const raw = generateRawClubToken();
    const tokenHash = hashClubToken(raw);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

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
    return {
      ok: true,
      url,
      message: `קישור תקף ל־${minutes} דקות.`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

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
      message: `הסיסמה נשמרה. חבר חייב להיות ברשימה (טלפון מורשה). גרסה ${nextVersion}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

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

export type ClubFeedTokenActionResult =
  | { ok: true; url: string; message?: string; tokenId: string }
  | { ok: false; error: string };

/**
 * Mint a long-lived personal private podcast RSS URL for a club member.
 * Raw token is returned once in the URL. Store only the hash.
 */
export async function mintClubFeedToken(input: {
  phone: string;
  label?: string;
}): Promise<ClubFeedTokenActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const phone = normalizeClubPhone(input.phone);
  if (!phone) {
    return { ok: false, error: "מספר טלפון לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: member } = await admin
      .from("club_members")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    if (!member) {
      return { ok: false, error: "הטלפון לא ברשימת חברי המועדון." };
    }

    const raw = generateRawClubToken();
    const tokenHash = hashClubFeedToken(raw);
    const label = (input.label ?? "").trim().slice(0, 120);

    const { data, error } = await admin
      .from("club_feed_tokens")
      .insert({
        token_hash: tokenHash,
        phone,
        label,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "יצירת פיד נכשלה.",
      };
    }

    return {
      ok: true,
      tokenId: data.id,
      url: getClubPodcastFeedUrl(raw),
      message:
        "פיד פרטי נוצר. העתיקו את הקישור עכשיו. לא יוצג שוב אחרי רענון.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function revokeClubFeedToken(
  tokenId: string,
): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("club_feed_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", tokenId);

    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "פיד הפודקאסט בוטל." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function revokeAllClubFeedTokensForPhone(
  phoneInput: string,
): Promise<ClubActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const phone = normalizeClubPhone(phoneInput);
  if (!phone) return { ok: false, error: "מספר טלפון לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("club_feed_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("phone", phone)
      .is("revoked_at", null);

    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "כל פידי הפודקאסט של החבר בוטלו." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
