"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import {
  buildQuotePaymentWhatsAppText,
  buildQuoteWhatsAppText,
  buildStudioQuoteRow,
  generateQuoteToken,
  quotePublicUrl,
  type CreateStudioQuoteInput,
  type QuoteStatus,
} from "@/lib/studio/quotes";
import type { StudioQuote } from "@/types/supabase";
import type { Database } from "@/types/supabase";

type StudioQuoteUpdate =
  Database["public"]["Tables"]["studio_quotes"]["Update"];

export type StudioQuoteActionResult =
  | {
      ok: true;
      quote?: StudioQuote;
      publicUrl?: string;
      whatsappText?: string;
      message?: string;
    }
  | { ok: false; error: string };

const VALID_STATUSES = new Set<QuoteStatus>([
  "draft",
  "sent",
  "approved",
  "payment_sent",
  "paid",
  "expired",
  "cancelled",
]);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export async function createQuote(
  input: CreateStudioQuoteInput,
): Promise<StudioQuoteActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const customerName = input.customerName.trim();
  const productLabel = input.productLabel.trim();
  if (!customerName) {
    return { ok: false, error: "חסר שם לקוח." };
  }
  if (!productLabel) {
    return { ok: false, error: "חסר תיאור מוצר." };
  }
  if (!Number.isFinite(input.priceIls) || input.priceIls < 0) {
    return { ok: false, error: "מחיר לא תקין." };
  }

  try {
    const token = generateQuoteToken();
    const row = buildStudioQuoteRow(input, token);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("studio_quotes")
      .insert(row)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "יצירת ההצעה נכשלה.",
      };
    }

    const quote = data as StudioQuote;
    const publicUrl = quotePublicUrl(quote.public_token);
    return {
      ok: true,
      quote,
      publicUrl,
      whatsappText: buildQuoteWhatsAppText(quote, publicUrl),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function updateQuote(
  id: string,
  patch: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    productLabel?: string;
    priceIls?: number;
    validityLabel?: string;
    body?: string;
  },
): Promise<StudioQuoteActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const quoteId = id.trim();
  if (!isUuid(quoteId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }

  const update: StudioQuoteUpdate = {
    updated_at: new Date().toISOString(),
  };
  if (patch.customerName !== undefined) {
    update.customer_name = patch.customerName.trim();
  }
  if (patch.customerPhone !== undefined) {
    update.customer_phone = patch.customerPhone.trim() || null;
  }
  if (patch.customerEmail !== undefined) {
    update.customer_email = patch.customerEmail.trim() || null;
  }
  if (patch.productLabel !== undefined) {
    update.product_label = patch.productLabel.trim();
  }
  if (patch.priceIls !== undefined) {
    if (!Number.isFinite(patch.priceIls) || patch.priceIls < 0) {
      return { ok: false, error: "מחיר לא תקין." };
    }
    update.price_ils = patch.priceIls;
  }
  if (patch.validityLabel !== undefined) {
    update.validity_label = patch.validityLabel.trim() || null;
  }
  if (patch.body !== undefined) {
    update.body = patch.body.trim();
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("studio_quotes")
      .update(update)
      .eq("id", quoteId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "עדכון ההצעה נכשל.",
      };
    }

    return { ok: true, quote: data as StudioQuote };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function setQuotePaymentUrl(
  id: string,
  paymentUrl: string,
): Promise<StudioQuoteActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const quoteId = id.trim();
  if (!isUuid(quoteId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }

  const url = paymentUrl.trim();
  if (!url) {
    return { ok: false, error: "חסר קישור תשלום." };
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from("studio_quotes")
      .update({
        payment_url: url,
        status: "payment_sent",
        updated_at: now,
      })
      .eq("id", quoteId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "שמירת קישור התשלום נכשלה.",
      };
    }

    const quote = data as StudioQuote;
    const publicUrl = quotePublicUrl(quote.public_token);
    return {
      ok: true,
      quote,
      publicUrl,
      whatsappText: buildQuotePaymentWhatsAppText(quote, publicUrl),
      message: "קישור התשלום נשמר.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function setQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<StudioQuoteActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const quoteId = id.trim();
  if (!isUuid(quoteId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }
  if (!VALID_STATUSES.has(status)) {
    return { ok: false, error: "סטטוס לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const patch: StudioQuoteUpdate = {
      status,
      updated_at: now,
    };
    if (status === "paid") {
      patch.paid_at = now;
    }
    if (status === "approved") {
      patch.approved_at = now;
    }

    const { data, error } = await admin
      .from("studio_quotes")
      .update(patch)
      .eq("id", quoteId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "עדכון הסטטוס נכשל.",
      };
    }

    return { ok: true, quote: data as StudioQuote };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
