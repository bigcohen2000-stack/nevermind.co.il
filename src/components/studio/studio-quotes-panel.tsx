"use client";

import { useMemo, useState, useTransition } from "react";

import {
  createQuote,
  setQuotePaymentUrl,
  setQuoteStatus,
} from "@/actions/studio-quotes";
import {
  ARCHIVE_PRICING_ROWS,
  buildArchiveQuoteFields,
  formatQuotePriceIls,
  parseArchivePriceIls,
  QUOTE_PRODUCT_KIND_LABELS,
  QUOTE_STATUS_LABELS,
  quotePublicUrl,
  type QuoteProductKind,
} from "@/lib/studio/quotes-shared";
import { GENERIC_ADD_TIPS, QUOTE_WRITING_TIPS } from "@/lib/studio/writing-tips";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import type { StudioQuote } from "@/types/supabase";

type StudioQuotesPanelProps = {
  initialQuotes: StudioQuote[];
};

const PRODUCT_KINDS: QuoteProductKind[] = [
  "archive",
  "single_video",
  "meeting",
  "custom",
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function QuoteRow({
  quote,
  onHint,
}: {
  quote: StudioQuote;
  onHint: (msg: string) => void;
}) {
  const [paymentUrl, setPaymentUrl] = useState(quote.payment_url ?? "");
  const [pending, startTransition] = useTransition();
  const publicUrl = quotePublicUrl(quote.public_token);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-50">
            {quote.customer_name || "ללא שם"}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {quote.product_label}
            {", "}
            {formatQuotePriceIls(Number(quote.price_ils))}
          </p>
          {(quote.customer_phone || quote.customer_email) && (
            <p className="mt-1 text-xs text-zinc-500">
              {[quote.customer_phone, quote.customer_email]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="text-end">
          <p className="text-xs font-medium text-zinc-300">
            {QUOTE_STATUS_LABELS[
              quote.status as keyof typeof QUOTE_STATUS_LABELS
            ] ?? quote.status}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">
            {formatDateTime(quote.created_at)}
          </p>
        </div>
      </header>

      {quote.body.trim() ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {quote.body}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            void copyText(publicUrl).then((ok) =>
              onHint(ok ? "הקישור הועתק." : "העתקה נכשלה."),
            );
          }}
          className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500"
        >
          העתק קישור
        </button>
        <a
          href={buildWhatsAppHref(
            [
              "הצעת מחיר מאת השם לא משנה",
              "",
              publicUrl,
            ].join("\n"),
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500"
        >
          וואטסאפ הצעה
        </a>
      </div>

      <div className="mt-6 space-y-3 border-t border-zinc-800 pt-5">
        <p className="text-xs text-zinc-500">
          קישור תשלום: הדבקה ידנית (חשבונית ירוקה / סליקה יחוברו בנפרד אחרי
          אישור).
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={paymentUrl}
            onChange={(e) => setPaymentUrl(e.target.value)}
            placeholder="https://..."
            dir="ltr"
            className="min-w-[12rem] flex-1 border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
          />
          <button
            type="button"
            disabled={pending || !paymentUrl.trim()}
            onClick={() => {
              startTransition(async () => {
                const result = await setQuotePaymentUrl(quote.id, paymentUrl);
                if (!result.ok) {
                  onHint(result.error);
                  return;
                }
                onHint(result.message ?? "נשמר.");
                if (result.whatsappText) {
                  await copyText(result.whatsappText);
                  onHint("קישור תשלום נשמר. הודעת וואטסאפ הועתקה.");
                }
              });
            }}
            className="border border-zinc-600 px-3 py-2 text-xs text-zinc-200 transition hover:border-zinc-400 disabled:opacity-50"
          >
            שמור קישור
          </button>
        </div>
        {quote.payment_url ? (
          <div className="flex flex-wrap gap-2">
            <a
              href={buildWhatsAppHref(
                [
                  "קישור תשלום: השם לא משנה",
                  "",
                  quote.payment_url,
                  "",
                  publicUrl,
                ].join("\n"),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500"
            >
              וואטסאפ תשלום
            </a>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || quote.status === "paid"}
          onClick={() => {
            startTransition(async () => {
              const result = await setQuoteStatus(quote.id, "paid");
              onHint(
                result.ok
                  ? "סומן כשולם."
                  : result.error,
              );
            });
          }}
          className="border border-emerald-900/60 px-3 py-1.5 text-xs text-emerald-300 transition hover:border-emerald-700 disabled:opacity-50"
        >
          סמן שולם
        </button>
        <button
          type="button"
          disabled={pending || quote.status === "cancelled"}
          onClick={() => {
            startTransition(async () => {
              const result = await setQuoteStatus(quote.id, "cancelled");
              onHint(
                result.ok
                  ? "ההצעה בוטלה."
                  : result.error,
              );
            });
          }}
          className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 disabled:opacity-50"
        >
          בטל
        </button>
      </div>
    </article>
  );
}

export function StudioQuotesPanel({ initialQuotes }: StudioQuotesPanelProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productKind, setProductKind] =
    useState<QuoteProductKind>("archive");
  const [archiveId, setArchiveId] = useState(ARCHIVE_PRICING_ROWS[2]?.id ?? "yearly");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoRef, setVideoRef] = useState("");
  const [meetingLabel, setMeetingLabel] = useState("פגישת התאמה");
  const [customLabel, setCustomLabel] = useState("");
  const [priceIls, setPriceIls] = useState(
    String(parseArchivePriceIls(ARCHIVE_PRICING_ROWS[2]?.price ?? "1250")),
  );
  const [validityLabel, setValidityLabel] = useState(
    ARCHIVE_PRICING_ROWS[2]?.validity ?? "",
  );
  const [body, setBody] = useState("");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdWa, setCreatedWa] = useState<string | null>(null);

  const archiveFields = useMemo(
    () => buildArchiveQuoteFields(archiveId),
    [archiveId],
  );

  function applyArchiveSelection(id: string) {
    setArchiveId(id);
    const fields = buildArchiveQuoteFields(id);
    if (fields) {
      setPriceIls(String(fields.priceIls));
      setValidityLabel(fields.validityLabel);
    }
  }

  function buildProductPayload(): {
    productLabel: string;
    productRef?: string;
  } | null {
    if (productKind === "archive") {
      if (!archiveFields) return null;
      return {
        productLabel: archiveFields.productLabel,
        productRef: archiveFields.productRef,
      };
    }
    if (productKind === "single_video") {
      const title = videoTitle.trim();
      if (!title) return null;
      return {
        productLabel: `סרטון: ${title}`,
        productRef: videoRef.trim() || undefined,
      };
    }
    if (productKind === "meeting") {
      const label = meetingLabel.trim();
      if (!label) return null;
      return { productLabel: label };
    }
    const label = customLabel.trim();
    if (!label) return null;
    return { productLabel: label };
  }

  function handleCreate() {
    const product = buildProductPayload();
    const parsedPrice = Number.parseFloat(priceIls);
    if (!product) {
      setHint("חסרים פרטי מוצר.");
      return;
    }
    if (!customerName.trim()) {
      setHint("חסר שם לקוח.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setHint("מחיר לא תקין.");
      return;
    }

    startTransition(async () => {
      const result = await createQuote({
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        productKind,
        productLabel: product.productLabel,
        productRef: product.productRef,
        priceIls: parsedPrice,
        validityLabel: validityLabel || undefined,
        body,
        status: "sent",
      });

      if (!result.ok) {
        setHint(result.error);
        return;
      }

      if (result.quote) {
        setQuotes((prev) => [result.quote!, ...prev]);
      }
      setCreatedUrl(result.publicUrl ?? null);
      setCreatedWa(result.whatsappText ?? null);
      setHint("ההצעה נוצרה.");
    });
  }

  return (
    <div className="space-y-10">
      {hint ? (
        <p className="text-sm text-zinc-400" role="status">
          {hint}
        </p>
      ) : null}

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">
          איך כותבים הצעה
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pe-5 text-sm text-zinc-400">
          {QUOTE_WRITING_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-zinc-500">
          {GENERIC_ADD_TIPS[0]} {GENERIC_ADD_TIPS[3]}
        </p>
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">הצעה חדשה</h2>
        <p className="mt-1 text-sm text-zinc-400">
          יוצרים קישור ציבורי ללקוח. אחרי אישור, מדביקים קישור תשלום ידנית.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-400">שם</span>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">טלפון</span>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              dir="ltr"
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">אימייל</span>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              dir="ltr"
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-400">סוג מוצר</span>
            <select
              value={productKind}
              onChange={(e) =>
                setProductKind(e.target.value as QuoteProductKind)
              }
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            >
              {PRODUCT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {QUOTE_PRODUCT_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>

          {productKind === "archive" ? (
            <label className="block text-sm">
              <span className="text-zinc-400">מסגרת מאגר</span>
              <select
                value={archiveId}
                onChange={(e) => applyArchiveSelection(e.target.value)}
                className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
              >
                {ARCHIVE_PRICING_ROWS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.frame} ({row.price})
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {productKind === "single_video" ? (
            <>
              <label className="block text-sm sm:col-span-2">
                <span className="text-zinc-400">כותרת סרטון</span>
                <input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-zinc-400">מזהה (UUID / YouTube, אופציונלי)</span>
                <input
                  value={videoRef}
                  onChange={(e) => setVideoRef(e.target.value)}
                  dir="ltr"
                  className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                />
              </label>
            </>
          ) : null}

          {productKind === "meeting" ? (
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">תיאור פגישה</span>
              <input
                value={meetingLabel}
                onChange={(e) => setMeetingLabel(e.target.value)}
                className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
          ) : null}

          {productKind === "custom" ? (
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">תיאור מותאם</span>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-400">מחיר (ש&quot;ח, לפני מע&quot;מ)</span>
            <input
              value={priceIls}
              onChange={(e) => setPriceIls(e.target.value)}
              dir="ltr"
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">תוקף / משך</span>
            <input
              value={validityLabel}
              onChange={(e) => setValidityLabel(e.target.value)}
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">הערות ללקוח</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={handleCreate}
          className="mt-6 border border-zinc-500 px-4 py-2 text-sm text-zinc-100 transition hover:border-zinc-300 disabled:opacity-50"
        >
          {pending ? "שומר..." : "צור הצעה"}
        </button>

        {createdUrl ? (
          <div className="mt-6 space-y-2 border-t border-zinc-800 pt-5">
            <p className="text-xs text-zinc-500">קישור ציבורי</p>
            <p className="break-all font-mono text-xs text-zinc-300" dir="ltr">
              {createdUrl}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void copyText(createdUrl).then((ok) =>
                    setHint(ok ? "הקישור הועתק." : "העתקה נכשלה."),
                  );
                }}
                className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
              >
                העתק קישור
              </button>
              {createdWa ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      void copyText(createdWa).then((ok) =>
                        setHint(ok ? "הודעת וואטסאפ הועתקה." : "העתקה נכשלה."),
                      );
                    }}
                    className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    העתק וואטסאפ
                  </button>
                  <a
                    href={buildWhatsAppHref(createdWa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    פתח וואטסאפ
                  </a>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-100">
          הצעות ({quotes.length})
        </h2>
        <div className="mt-4 space-y-4">
          {quotes.length === 0 ? (
            <p className="text-sm text-zinc-500">אין הצעות עדיין.</p>
          ) : (
            quotes.map((quote) => (
              <QuoteRow key={quote.id} quote={quote} onHint={setHint} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
