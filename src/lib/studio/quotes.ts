import "server-only";

import { randomBytes } from "crypto";

import {
  formatQuotePriceIls,
  type QuoteProductKind,
  type QuoteStatus,
} from "@/lib/studio/quotes-shared";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudioQuote } from "@/types/supabase";

export type CreateStudioQuoteInput = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  productKind: QuoteProductKind;
  productLabel: string;
  productRef?: string;
  priceIls: number;
  validityLabel?: string;
  body?: string;
  leadSource?: string;
  leadRef?: string;
  expiresAt?: string | null;
  status?: QuoteStatus;
};

export {
  ARCHIVE_PRICING_ROWS,
  buildArchiveQuoteFields,
  canApproveQuote,
  formatQuotePriceIls,
  isQuoteExpired,
  parseArchivePriceIls,
  quotePublicUrl,
  QUOTE_PRODUCT_KIND_LABELS,
  QUOTE_STATUS_LABELS,
  type QuoteProductKind,
  type QuoteStatus,
} from "@/lib/studio/quotes-shared";

export function generateQuoteToken(): string {
  return randomBytes(24).toString("base64url");
}

export function buildStudioQuoteRow(
  input: CreateStudioQuoteInput,
  token = generateQuoteToken(),
): DatabaseStudioQuoteInsert {
  const now = new Date().toISOString();
  return {
    public_token: token,
    status: input.status ?? "sent",
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone?.trim() || null,
    customer_email: input.customerEmail?.trim() || null,
    product_kind: input.productKind,
    product_label: input.productLabel.trim(),
    product_ref: input.productRef?.trim() || null,
    price_ils: input.priceIls,
    currency: "ILS",
    validity_label: input.validityLabel?.trim() || null,
    body: input.body?.trim() ?? "",
    lead_source: input.leadSource?.trim() || null,
    lead_ref: input.leadRef?.trim() || null,
    expires_at: input.expiresAt ?? null,
    updated_at: now,
  };
}

type DatabaseStudioQuoteInsert =
  import("@/types/supabase").Database["public"]["Tables"]["studio_quotes"]["Insert"];

export async function listStudioQuotes(limit = 100): Promise<StudioQuote[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("studio_quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as StudioQuote[];
  } catch {
    return [];
  }
}

export async function getQuoteByToken(
  token: string,
): Promise<StudioQuote | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("studio_quotes")
      .select("*")
      .eq("public_token", trimmed)
      .maybeSingle();

    if (error || !data) return null;
    return data as StudioQuote;
  } catch {
    return null;
  }
}

export function buildQuoteWhatsAppText(
  quote: StudioQuote,
  publicUrl: string,
): string {
  const lines = [
    "הצעת מחיר מאת השם לא משנה",
    "",
    quote.customer_name.trim()
      ? `שלום ${quote.customer_name.trim()},`
      : "שלום,",
    "",
    `מוצר: ${quote.product_label}`,
    `מחיר: ${formatQuotePriceIls(Number(quote.price_ils))} (לפני מע"מ)`,
  ];
  if (quote.validity_label?.trim()) {
    lines.push(`תוקף גישה: ${quote.validity_label.trim()}`);
  }
  if (quote.body.trim()) {
    lines.push("", quote.body.trim());
  }
  lines.push(
    "",
    "לצפייה ואישור ההצעה:",
    publicUrl,
    "",
    "אחרי אישור תקבל קישור לתשלום.",
  );
  return lines.join("\n");
}

export function buildQuotePaymentWhatsAppText(
  quote: StudioQuote,
  publicUrl: string,
): string {
  const lines = [
    "קישור תשלום: השם לא משנה",
    "",
    quote.customer_name.trim()
      ? `שלום ${quote.customer_name.trim()},`
      : "שלום,",
    "",
    `מוצר: ${quote.product_label}`,
    `סכום: ${formatQuotePriceIls(Number(quote.price_ils))} (לפני מע"מ)`,
  ];
  if (quote.payment_url?.trim()) {
    lines.push("", "לתשלום:", quote.payment_url.trim());
  }
  lines.push("", "פרטי ההצעה:", publicUrl);
  return lines.join("\n");
}
