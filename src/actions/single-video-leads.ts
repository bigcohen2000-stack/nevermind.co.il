"use server";

import {
  generateRawClubToken,
  hashClubToken,
} from "@/lib/club/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import type { SingleVideoLeadStatus } from "@/lib/studio/single-video-leads";

export type SingleVideoLeadActionResult =
  | {
      ok: true;
      id?: string;
      watchUrl?: string;
      clubLoginUrl?: string;
      whatsappText?: string;
      message?: string;
    }
  | { ok: false; error: string };

const VALID_STATUSES = new Set<SingleVideoLeadStatus>([
  "requested",
  "chatting",
  "paid",
  "sent",
  "closed",
]);

function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, "").trim();
}

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://nevermind.co.il";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/**
 * Public CTA beacon: log a single-video request (service role).
 * No studio auth. Light rate-limit: just insert (no uniqueness).
 */
export async function logSingleVideoLead(input: {
  videoId: string;
  videoTitle: string;
}): Promise<SingleVideoLeadActionResult> {
  const videoId = input.videoId.trim();
  const videoTitle = input.videoTitle.trim();
  if (!videoTitle) {
    return { ok: false, error: "חסרה כותרת סרטון." };
  }
  if (!isUuid(videoId)) {
    return { ok: false, error: "מזהה סרטון לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("single_video_leads")
      .insert({
        video_id: videoId,
        video_title: videoTitle,
        status: "requested",
        source: "cta",
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "רישום הבקשה נכשל.",
      };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Studio-only: update lead status / note.
 */
export async function updateSingleVideoLeadStatus(
  id: string,
  status: SingleVideoLeadStatus,
  note?: string,
): Promise<SingleVideoLeadActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const leadId = id.trim();
  if (!isUuid(leadId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }
  if (!VALID_STATUSES.has(status)) {
    return { ok: false, error: "סטטוס לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const patch: {
      status: string;
      updated_at: string;
      note?: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (note !== undefined) {
      patch.note = note.trim();
    }

    const { error } = await admin
      .from("single_video_leads")
      .update(patch)
      .eq("id", leadId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, message: "סטטוס עודכן." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

/**
 * Studio-only: mint club token, mark paid/sent, return WhatsApp text.
 */
export async function fulfillSingleVideoLead(input: {
  leadId: string;
  phone: string;
  daysValid: number;
}): Promise<SingleVideoLeadActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const leadId = input.leadId.trim();
  if (!isUuid(leadId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }

  const phone = normalizePhone(input.phone);
  const days = Math.min(Math.max(1, Math.floor(input.daysValid || 30)), 730);
  if (phone.length < 9) {
    return { ok: false, error: "מספר טלפון לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: lead, error: leadError } = await admin
      .from("single_video_leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return { ok: false, error: leadError?.message ?? "ליד לא נמצא." };
    }

    if (!lead.video_id) {
      return { ok: false, error: "לליד אין מזהה סרטון." };
    }

    const raw = generateRawClubToken();
    const tokenHash = hashClubToken(raw);
    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: tokenRow, error: tokenError } = await admin
      .from("club_tokens")
      .insert({
        token_hash: tokenHash,
        phone,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (tokenError || !tokenRow) {
      return {
        ok: false,
        error: tokenError?.message ?? "יצירת טוקן נכשלה.",
      };
    }

    const watchUrl = `/watch/${lead.video_id}`;
    const clubLoginUrl = `${siteOrigin()}/club/login?token=${encodeURIComponent(raw)}`;
    const absoluteWatch = `${siteOrigin()}${watchUrl}`;

    const { error: updateError } = await admin
      .from("single_video_leads")
      .update({
        phone,
        status: "sent",
        watch_url: watchUrl,
        club_token_id: tokenRow.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    const title = lead.video_title?.trim() || "הסרטון";
    const whatsappText = [
      `היי, הנה הקישור לצפייה בסרטון "${title}".`,
      "",
      `כניסה למועדון: ${clubLoginUrl}`,
      `דף הצפייה: ${absoluteWatch}`,
      "",
      "הקישור האישי לכניסה. לא להעביר הלאה.",
    ].join("\n");

    return {
      ok: true,
      watchUrl,
      clubLoginUrl,
      whatsappText,
      message: "נוצר קישור. הועתק / שלחו בוואטסאפ.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
