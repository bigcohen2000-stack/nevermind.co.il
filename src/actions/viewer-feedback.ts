"use server";

import { Resend } from "resend";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import type { ViewerFeedback } from "@/types/supabase";

const publicKindSchema = z.enum(["dislike", "reply_request"]);

const submitSchema = z.object({
  kind: publicKindSchema,
  body: z
    .string()
    .trim()
    .min(1, "נא לכתוב משוב")
    .max(4000, "הטקסט ארוך מדי"),
  videoId: z.string().uuid().optional(),
  videoTitle: z.string().trim().max(500).optional(),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email("אימייל לא תקין").max(200).optional().or(z.literal("")),
  wantReply: z.boolean().optional().default(false),
});

export type SubmitViewerFeedbackInput = z.infer<typeof submitSchema>;

export type SubmitViewerFeedbackResult =
  | { ok: true; whatsappHref: string }
  | { ok: false; error: string };

export type StudioFeedbackActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function feedbackNotifyEmail(): string | null {
  return (
    process.env.RESEND_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    null
  );
}

function buildFeedbackWhatsAppText(input: {
  kind: string;
  body: string;
  videoTitle?: string;
  name?: string;
  phone?: string;
  email?: string;
  wantReply: boolean;
}): string {
  const kindLabel =
    input.kind === "reply_request"
      ? "בקשת תשובה"
      : input.kind === "dislike"
        ? "לא אהבתי"
        : input.kind;
  const lines = [
    "משוב מ-nevermind.co.il",
    `סוג: ${kindLabel}`,
  ];
  if (input.videoTitle?.trim()) {
    lines.push(`סרטון: ${input.videoTitle.trim()}`);
  }
  if (input.name?.trim()) lines.push(`שם: ${input.name.trim()}`);
  if (input.phone?.trim()) lines.push(`טלפון: ${input.phone.trim()}`);
  if (input.email?.trim()) lines.push(`אימייל: ${input.email.trim()}`);
  lines.push("", input.body.trim());
  if (input.wantReply) {
    lines.push("", "מבקש/ת תשובה.");
  }
  return lines.join("\n");
}

async function notifyFeedbackEmail(input: {
  kind: string;
  body: string;
  videoTitle?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  wantReply: boolean;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = feedbackNotifyEmail();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>";
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    const kindLabel =
      input.kind === "reply_request" ? "בקשת תשובה" : "משוב שלילי";
    await resend.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: input.email?.trim() || undefined,
      subject: input.videoTitle
        ? `${kindLabel}: ${input.videoTitle.slice(0, 60)}`
        : `${kindLabel} מ-nevermind.co.il`,
      text: buildFeedbackWhatsAppText({
        kind: input.kind,
        body: input.body,
        videoTitle: input.videoTitle ?? undefined,
        name: input.name ?? undefined,
        phone: input.phone ?? undefined,
        email: input.email ?? undefined,
        wantReply: input.wantReply,
      }),
    });
  } catch {
    // Never block public submit on email failure.
  }
}

/**
 * Public: submit viewer feedback (dislike or reply request).
 */
export async function submitViewerFeedback(
  input: SubmitViewerFeedbackInput,
): Promise<SubmitViewerFeedbackResult> {
  const parsed = submitSchema.safeParse({
    ...input,
    email: input.email === "" ? undefined : input.email,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "הפרטים לא תקינים.",
    };
  }

  const {
    kind,
    body,
    videoId,
    videoTitle,
    name,
    phone,
    email,
    wantReply,
  } = parsed.data;

  const shouldNotify = wantReply || kind === "reply_request";

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("viewer_feedback").insert({
      kind,
      video_id: videoId ?? null,
      video_title: videoTitle?.trim() || null,
      body,
      author_name: name?.trim() || null,
      contact_phone: phone?.trim() || null,
      contact_email: email?.trim() || null,
      want_reply: shouldNotify,
      status: "open",
    });

    if (error) {
      return { ok: false, error: "שמירת המשוב נכשלה. נסו שוב." };
    }

    if (shouldNotify) {
      await notifyFeedbackEmail({
        kind,
        body,
        videoTitle: videoTitle ?? null,
        name: name ?? null,
        phone: phone ?? null,
        email: email ?? null,
        wantReply: shouldNotify,
      });
    }

    const whatsappHref = buildWhatsAppHref(
      buildFeedbackWhatsAppText({
        kind,
        body,
        videoTitle,
        name,
        phone,
        email,
        wantReply: shouldNotify,
      }),
    );

    return { ok: true, whatsappHref };
  } catch {
    return { ok: false, error: "שגיאת שרת. נסו שוב מאוחר יותר." };
  }
}

/**
 * Studio-only: list recent viewer feedback.
 */
export async function listStudioViewerFeedback(
  limit = 40,
): Promise<ViewerFeedback[]> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return [];

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("viewer_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Studio-only: update feedback ticket status.
 */
export async function updateViewerFeedbackStatus(input: {
  id: string;
  status: "open" | "replied" | "closed";
}): Promise<StudioFeedbackActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return { ok: false, error: "הסטודיו נעול." };

  const id = input.id.trim();
  if (!id) return { ok: false, error: "מזהה חסר." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("viewer_feedback")
      .update({ status: input.status })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "עודכן." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
