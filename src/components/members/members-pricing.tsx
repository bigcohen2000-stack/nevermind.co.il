"use client";

import { useState } from "react";

import { SmsContactButton } from "@/components/contact/sms-contact-button";
import {
  ARCHIVE_PRICING_ROWS,
  DEFAULT_ARCHIVE_PRICING_ID,
  NO_AUTO_CHECKOUT_NOTE,
  REFUND_POLICY_NOTE,
  VAT_FOOTER_NOTE,
  buildArchiveAccessWhatsAppText,
  type ArchivePricingRow,
} from "@/lib/content/offers";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type PeriodGroupId = "short" | "month" | "year" | "long";

type PeriodGroup = {
  id: PeriodGroupId;
  label: string;
  rowIds: string[];
};

const PERIOD_GROUPS: PeriodGroup[] = [
  { id: "short", label: "קצר", rowIds: ["daily", "weekly"] },
  { id: "month", label: "חודש", rowIds: ["monthly"] },
  { id: "year", label: "שנה", rowIds: ["yearly"] },
  {
    id: "long",
    label: "ארוך טווח",
    rowIds: ["bi-yearly", "5years", "lifetime"],
  },
];

function rowsForGroup(group: PeriodGroup): ArchivePricingRow[] {
  return ARCHIVE_PRICING_ROWS.filter((row) => group.rowIds.includes(row.id));
}

function PlanActions({ row }: { row: ArchivePricingRow }) {
  const msg = buildArchiveAccessWhatsAppText(row.frame, row.price);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <a
        href={buildWhatsAppHref(msg)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary w-full min-h-11 justify-center px-4 py-2 text-sm sm:w-auto"
      >
        וואטסאפ
      </a>
      <SmsContactButton
        message={msg}
        label="SMS רגיל"
        className="btn btn-secondary w-full min-h-11 justify-center px-4 py-2 text-sm sm:w-auto"
      />
    </div>
  );
}

/**
 * Period toggle + price list for club archive access.
 * Mobile: stacked cards. Desktop: table. No checkout.
 */
export function MembersPricing() {
  const [periodId, setPeriodId] = useState<PeriodGroupId>("year");
  const group =
    PERIOD_GROUPS.find((g) => g.id === periodId) ??
    PERIOD_GROUPS.find((g) => g.id === "year") ??
    PERIOD_GROUPS[0];
  const rows = rowsForGroup(group);

  return (
    <section
      aria-labelledby="members-pricing-title"
      className="bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
        <p className="text-xs font-medium tracking-wide text-action">
          מחירון מאגר
        </p>
        <h2
          id="members-pricing-title"
          className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
        >
          מחיר לפי תקופה.
        </h2>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          לפני מע&quot;מ. אין סליקה באתר. אחרי בחירת מסגרת, מבקשים גישה בוואטסאפ
          או ב-SMS רגיל, ובודקים התאמה בשיחה. כל מסגרת כוללת את מאגר המועדון
          ואת אפשרות לפיד פודקאסט פרטי. מה שנשאר חינם: סרטונים פתוחים, מאמרים,
          מושגים, ופיד RSS ציבורי.
        </p>

        <div
          className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          role="tablist"
          aria-label="בחירת תקופה"
        >
          {PERIOD_GROUPS.map((g) => {
            const active = g.id === periodId;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriodId(g.id)}
                className={
                  active
                    ? "btn btn-primary min-h-11 w-full justify-center px-3 py-2 text-sm sm:w-auto sm:px-4"
                    : "btn btn-secondary min-h-11 w-full justify-center px-3 py-2 text-sm sm:w-auto sm:px-4"
                }
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-8 space-y-4 md:hidden">
          {rows.map((row) => {
            const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
            return (
              <li
                key={row.id}
                className={cn(
                  "border bg-paper p-5",
                  highlighted
                    ? "border-action"
                    : "border-foreground/15",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {row.frame}
                    {highlighted ? (
                      <span className="ms-2 text-xs font-medium text-action">
                        מסלול יעד
                      </span>
                    ) : null}
                  </h3>
                  <p className="shrink-0 text-base font-semibold tabular-nums">
                    {row.price}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">תוקף: {row.validity}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {row.analysis}
                </p>
                <div className="mt-5">
                  <PlanActions row={row} />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop: table */}
        <div className="mt-10 hidden md:block">
          <table className="w-full border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-foreground/20 text-muted">
                <th className="py-3 pe-4 font-medium">מסגרת</th>
                <th className="py-3 pe-4 font-medium">תוקף</th>
                <th className="py-3 pe-4 font-medium">מחיר (לפני מע&quot;מ)</th>
                <th className="py-3 pe-4 font-medium">ניתוח</th>
                <th className="py-3 font-medium">פעולה</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "align-top",
                      highlighted
                        ? "border-b border-action/30 bg-action/5"
                        : "border-b border-foreground/10",
                    )}
                  >
                    <td className="py-4 pe-4 font-medium">
                      {row.frame}
                      {highlighted ? (
                        <span className="ms-2 text-xs font-medium text-action">
                          מסלול יעד
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 pe-4 text-foreground/80">
                      {row.validity}
                    </td>
                    <td className="py-4 pe-4 tabular-nums text-foreground/80">
                      {row.price}
                    </td>
                    <td className="max-w-xs py-4 pe-4 text-muted">
                      {row.analysis}
                    </td>
                    <td className="py-4">
                      <PlanActions row={row} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-8 max-w-3xl space-y-2 text-sm leading-relaxed text-muted">
          <li>{VAT_FOOTER_NOTE}</li>
          <li>{REFUND_POLICY_NOTE}</li>
          <li>{NO_AUTO_CHECKOUT_NOTE}</li>
        </ul>
      </div>
    </section>
  );
}
