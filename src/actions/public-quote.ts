"use server";

import { Resend } from "resend";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  canApproveQuote,
  formatQuotePriceIls,
  getQuoteByToken,
  quotePublicUrl,
} from "@/lib/studio/quotes";
import type { StudioQuote } from "@/types/supabase";

export type PublicQuoteActionResult =
  | { ok: true; quote: StudioQuote; message?: string }
  | { ok: false; error: string };

function notifyEmail(): string | null {
  return (
    process.env.RESEND_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    null
  );
}

async function notifyQuoteApproved(quote: StudioQuote): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = notifyEmail();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>";
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    const publicUrl = quotePublicUrl(quote.public_token);
    const lines = [
      "הצעת מחיר אושרה",
      "",
      `שם: ${quote.customer_name}`,
      quote.customer_phone ? `טלפון: ${quote.customer_phone}` : "",
      quote.customer_email ? `אימייל: ${quote.customer_email}` : "",
      `מוצר: ${quote.product_label}`,
      `מחיר: ${formatQuotePriceIls(Number(quote.price_ils))}`,
      "",
      publicUrl,
    ].filter(Boolean);

    await resend.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: quote.customer_email?.trim() || undefined,
      subject: `הצעה אושרה: ${quote.customer_name || quote.product_label}`,
      text: lines.join("\n"),
    });
  } catch {
    // Never block approval on email failure.
  }
}

export async function approveQuote(
  token: string,
): Promise<PublicQuoteActionResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "קישור לא תקין." };
  }

  const quote = await getQuoteByToken(trimmed);
  if (!quote) {
    return { ok: false, error: "ההצעה לא נמצאה." };
  }
  if (!canApproveQuote(quote)) {
    if (quote.status === "approved" || quote.status === "payment_sent") {
      return { ok: false, error: "ההצעה כבר אושרה." };
    }
    if (quote.status === "paid") {
      return { ok: false, error: "ההצעה כבר שולמה." };
    }
    return { ok: false, error: "לא ניתן לאשר את ההצעה." };
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from("studio_quotes")
      .update({
        status: "approved",
        approved_at: now,
        updated_at: now,
      })
      .eq("public_token", trimmed)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "אישור ההצעה נכשל.",
      };
    }

    const updated = data as StudioQuote;
    await notifyQuoteApproved(updated);

    return {
      ok: true,
      quote: updated,
      message: "ההצעה אושרה. קישור תשלום יישלח בקרוב.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
