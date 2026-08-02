import {
  ARCHIVE_PRICING_ROWS,
  getArchivePricingById,
} from "@/lib/content/offers";
import type { StudioQuote } from "@/types/supabase";

export type QuoteProductKind =
  | "archive"
  | "single_video"
  | "meeting"
  | "custom";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "approved"
  | "payment_sent"
  | "paid"
  | "expired"
  | "cancelled";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "טיוטה",
  sent: "נשלח",
  approved: "אושר",
  payment_sent: "קישור תשלום",
  paid: "שולם",
  expired: "פג תוקף",
  cancelled: "בוטל",
};

export const QUOTE_PRODUCT_KIND_LABELS: Record<QuoteProductKind, string> = {
  archive: "מאגר / מסגרת",
  single_video: "סרטון בודד",
  meeting: "פגישה",
  custom: "מותאם",
};

/** Strip currency and parse ILS from strings like '1,250 ש"ח'. */
export function parseArchivePriceIls(price: string): number {
  const digits = price.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function formatQuotePriceIls(amount: number): string {
  return `${amount.toLocaleString("he-IL")} ש"ח`;
}

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://nevermind.co.il";
}

export function quotePublicUrl(token: string): string {
  return `${siteOrigin()}/q/${token}`;
}

export function buildArchiveQuoteFields(archiveId: string): {
  productLabel: string;
  productRef: string;
  priceIls: number;
  validityLabel: string;
} | null {
  const row = getArchivePricingById(archiveId);
  if (!row) return null;
  return {
    productLabel: `מאגר: ${row.frame}`,
    productRef: row.id,
    priceIls: parseArchivePriceIls(row.price),
    validityLabel: row.validity,
  };
}

export function isQuoteExpired(quote: StudioQuote): boolean {
  if (quote.status === "expired") return true;
  if (quote.expires_at && new Date(quote.expires_at).getTime() < Date.now()) {
    return true;
  }
  return false;
}

export function canApproveQuote(quote: StudioQuote): boolean {
  if (isQuoteExpired(quote)) return false;
  return quote.status === "draft" || quote.status === "sent";
}

export { ARCHIVE_PRICING_ROWS };
