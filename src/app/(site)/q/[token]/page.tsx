import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuoteApproveButton } from "@/components/quotes/quote-approve-button";
import {
  canApproveQuote,
  formatQuotePriceIls,
  getQuoteByToken,
  isQuoteExpired,
  QUOTE_PRODUCT_KIND_LABELS,
  QUOTE_STATUS_LABELS,
} from "@/lib/studio/quotes";

export const dynamic = "force-dynamic";

type QuotePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  return {
    title: quote
      ? `הצעת מחיר: ${quote.product_label}`
      : "הצעת מחיר",
    robots: { index: false, follow: false },
  };
}

export default async function PublicQuotePage({ params }: QuotePageProps) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  if (!quote) {
    notFound();
  }

  const expired = isQuoteExpired(quote);
  const showApprove = canApproveQuote(quote);
  const showPayment =
    !expired &&
    (quote.status === "approved" || quote.status === "payment_sent") &&
    Boolean(quote.payment_url?.trim());
  const isPaid = quote.status === "paid";
  const isCancelled = quote.status === "cancelled";

  const statusLabel =
    QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS] ??
    quote.status;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-xs font-medium tracking-wide text-action">
        הצעת מחיר מאת השם לא משנה
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {quote.product_label}
      </h1>

      {quote.customer_name.trim() ? (
        <p className="mt-2 text-muted">
          עבור {quote.customer_name.trim()}
        </p>
      ) : null}

      <dl className="mt-10 space-y-4 border-y border-foreground/10 py-8">
        <div>
          <dt className="text-xs text-muted">סוג</dt>
          <dd className="mt-1 text-foreground">
            {QUOTE_PRODUCT_KIND_LABELS[
              quote.product_kind as keyof typeof QUOTE_PRODUCT_KIND_LABELS
            ] ?? quote.product_kind}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">מחיר (לפני מע"מ)</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {formatQuotePriceIls(Number(quote.price_ils))}
          </dd>
        </div>
        {quote.validity_label?.trim() ? (
          <div>
            <dt className="text-xs text-muted">תוקף / משך</dt>
            <dd className="mt-1">{quote.validity_label}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-muted">סטטוס</dt>
          <dd className="mt-1">{statusLabel}</dd>
        </div>
      </dl>

      {quote.body.trim() ? (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted">פרטים</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {quote.body}
          </p>
        </div>
      ) : null}

      {isPaid ? (
        <div className="mt-10 border border-foreground/15 bg-paper p-6">
          <p className="text-lg font-semibold">תודה. התשלום התקבל.</p>
          <p className="mt-2 text-sm text-muted">
            ניצור קשר בהמשך לגבי הגישה או הפגישה.
          </p>
        </div>
      ) : null}

      {isCancelled ? (
        <p className="mt-10 text-sm text-muted">ההצעה בוטלה.</p>
      ) : null}

      {expired && !isPaid && !isCancelled ? (
        <p className="mt-10 text-sm text-muted">תוקף ההצעה הסתיים.</p>
      ) : null}

      {showApprove ? (
        <div className="mt-10">
          <p className="text-sm text-muted">
            אחרי אישור תקבל קישור לתשלום.
          </p>
          <QuoteApproveButton token={quote.public_token} />
        </div>
      ) : null}

      {!showApprove &&
      !isPaid &&
      !isCancelled &&
      !expired &&
      quote.status === "approved" &&
      !quote.payment_url?.trim() ? (
        <p className="mt-10 text-sm text-muted">
          ההצעה אושרה. קישור תשלום יישלח בקרוב.
        </p>
      ) : null}

      {showPayment && quote.payment_url ? (
        <div className="mt-10">
          <a
            href={quote.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            מעבר לתשלום
          </a>
        </div>
      ) : null}

      <p className="mt-16 text-sm text-muted">
        שאלה?{" "}
        <Link href="/contact" className="link-arrow">
          יצירת קשר
        </Link>
      </p>
    </main>
  );
}
