"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://nevermind.co.il";

export type MeetingActionResult =
  | {
      ok: true;
      meetingId?: string;
      heldAt?: string;
      confirmUrl?: string;
      whatsappText?: string;
      message?: string;
    }
  | { ok: false; error: string };

async function requireStudio() {
  const ok = await isStudioAuthenticated();
  if (!ok) return { ok: false as const, error: "הסטודיו נעול." };
  return { ok: true as const };
}

function confirmUrlForToken(token: string): string {
  return `${siteUrl()}/m/${token}`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("he-IL", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Jerusalem",
    });
  } catch {
    return iso;
  }
}

/**
 * Schedule a future meeting (or log held) and optionally request user V.
 */
export async function scheduleUserMeeting(input: {
  userId: string;
  heldAt: string;
  note?: string;
  /** scheduled = future + optional confirm. held = already happened. */
  status?: "scheduled" | "held";
  requestConfirmation?: boolean;
  customerName?: string;
}): Promise<MeetingActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const parsed = z
    .object({
      userId: z.string().uuid(),
      heldAt: z.string().min(1),
      note: z.string().max(500).optional(),
      status: z.enum(["scheduled", "held"]).optional(),
      requestConfirmation: z.boolean().optional(),
      customerName: z.string().max(80).optional(),
    })
    .safeParse(input);

  if (!parsed.success) return { ok: false, error: "קלט לא תקין." };

  const held = new Date(parsed.data.heldAt);
  if (Number.isNaN(held.getTime())) {
    return { ok: false, error: "תאריך לא תקין." };
  }

  const status = parsed.data.status ?? "held";
  const wantConfirm =
    Boolean(parsed.data.requestConfirmation) && status === "scheduled";
  const token = wantConfirm ? randomBytes(18).toString("base64url") : null;
  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("user_meetings")
      .insert({
        user_id: parsed.data.userId,
        held_at: held.toISOString(),
        note: parsed.data.note?.trim() || null,
        status,
        confirmation_token: token,
        confirmation_requested_at: token ? now : null,
        confirmed_at: null,
      })
      .select("id, held_at, confirmation_token")
      .single();

    if (error) {
      return {
        ok: false,
        error:
          error.message.includes("confirmation_token") ||
          error.message.includes("status")
            ? `${error.message}. החל מיגרציה 34 ב-Supabase.`
            : error.message,
      };
    }

    revalidatePath("/studio/users");
    revalidatePath("/profile");

    const confirmUrl = data.confirmation_token
      ? confirmUrlForToken(data.confirmation_token)
      : undefined;
    const name = parsed.data.customerName?.trim() || "שלום";
    const whatsappText = confirmUrl
      ? [
          `שלום ${name},`,
          "",
          "נקבעה פגישה ב-NeverMinde:",
          formatWhen(data.held_at),
          "",
          "לאישור לחץ על הקישור (V):",
          confirmUrl,
          "",
          "אם צריך לשנות שעה, כתוב כאן.",
        ].join("\n")
      : undefined;

    return {
      ok: true,
      meetingId: data.id,
      heldAt: data.held_at,
      confirmUrl,
      whatsappText,
      message: wantConfirm
        ? "פגישה נקבעה. קישור אישור מוכן."
        : status === "held"
          ? "פגישה נרשמה."
          : "פגישה נקבעה.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** @deprecated Prefer scheduleUserMeeting. Kept for old form imports. */
export async function recordUserMeeting(input: {
  userId: string;
  heldAt: string;
  note?: string;
}): Promise<MeetingActionResult> {
  return scheduleUserMeeting({
    userId: input.userId,
    heldAt: input.heldAt,
    note: input.note,
    status: "held",
  });
}

/**
 * Re-issue confirmation link for an existing scheduled meeting.
 */
export async function requestMeetingConfirmation(input: {
  meetingId: string;
  customerName?: string;
}): Promise<MeetingActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(input.meetingId);
  if (!id.success) return { ok: false, error: "מזהה לא תקין." };

  const token = randomBytes(18).toString("base64url");
  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("user_meetings")
      .update({
        status: "scheduled",
        confirmation_token: token,
        confirmation_requested_at: now,
        confirmed_at: null,
      })
      .eq("id", id.data)
      .select("id, held_at, confirmation_token")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "עדכון נכשל." };
    }

    const confirmUrl = confirmUrlForToken(token);
    const name = input.customerName?.trim() || "שלום";
    const whatsappText = [
      `שלום ${name},`,
      "",
      "נשלח שוב קישור לאישור פגישה ב-NeverMinde:",
      formatWhen(data.held_at),
      "",
      "לאישור (V):",
      confirmUrl,
    ].join("\n");

    revalidatePath("/studio/users");
    return {
      ok: true,
      meetingId: data.id,
      heldAt: data.held_at,
      confirmUrl,
      whatsappText,
      message: "קישור אישור חדש מוכן.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Public: load meeting summary for confirmation page (no state change).
 */
export async function getMeetingConfirmPreview(token: string): Promise<
  | { ok: true; heldAt: string; alreadyConfirmed: boolean }
  | { ok: false; error: string }
> {
  const clean = token.trim();
  if (clean.length < 8 || clean.length > 80) {
    return { ok: false, error: "קישור לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("user_meetings")
      .select("held_at, status, confirmed_at")
      .eq("confirmation_token", clean)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, error: "הקישור לא נמצא או שפג תוקפו." };
    }

    return {
      ok: true,
      heldAt: data.held_at,
      alreadyConfirmed:
        Boolean(data.confirmed_at) || data.status === "confirmed",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Public: user confirms meeting via token (no login required).
 */
export async function confirmMeetingByToken(
  token: string,
): Promise<MeetingActionResult> {
  const clean = token.trim();
  if (clean.length < 8 || clean.length > 80) {
    return { ok: false, error: "קישור לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: existing, error: loadError } = await admin
      .from("user_meetings")
      .select("id, held_at, status, confirmed_at")
      .eq("confirmation_token", clean)
      .maybeSingle();

    if (loadError || !existing) {
      return { ok: false, error: "הקישור לא נמצא או שפג תוקפו." };
    }

    if (existing.confirmed_at || existing.status === "confirmed") {
      return {
        ok: true,
        meetingId: existing.id,
        heldAt: existing.held_at,
        message: "הפגישה כבר אושרה. תודה.",
      };
    }

    const now = new Date().toISOString();
    const { data, error } = await admin
      .from("user_meetings")
      .update({
        status: "confirmed",
        confirmed_at: now,
      })
      .eq("id", existing.id)
      .select("id, held_at")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "אישור נכשל." };
    }

    revalidatePath("/studio/users");
    revalidatePath("/profile");
    return {
      ok: true,
      meetingId: data.id,
      heldAt: data.held_at,
      message: "תודה. הפגישה אושרה.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
