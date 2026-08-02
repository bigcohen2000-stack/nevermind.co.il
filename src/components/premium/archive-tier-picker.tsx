"use client";

import { useState } from "react";

import {
  DEFAULT_ACCESS_FRAME_ID,
  ACCESS_FRAME_ROWS,
  type AccessFrameRow,
} from "@/lib/premium/access-gate-copy";
import { cn } from "@/lib/utils";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type ArchiveTierPickerProps = {
  /** Called when a WhatsApp / SMS link is activated. */
  onRequest?: () => void;
  /** Compact = denser grid for modals. */
  density?: "default" | "compact";
  className?: string;
};

/**
 * Selectable archive pricing tiers (Hebrew). Default: שנתי.
 * WhatsApp CTA carries the exact selected frame + price.
 */
export function ArchiveTierPicker({
  onRequest,
  density = "default",
  className,
}: ArchiveTierPickerProps) {
  const [selectedId, setSelectedId] = useState(DEFAULT_ACCESS_FRAME_ID);
  const selected: AccessFrameRow =
    ACCESS_FRAME_ROWS.find((row) => row.id === selectedId) ??
    ACCESS_FRAME_ROWS.find((row) => row.id === DEFAULT_ACCESS_FRAME_ID) ??
    ACCESS_FRAME_ROWS[0];

  const href = buildWhatsAppHref(selected.whatsappText);

  return (
    <div className={cn("text-start", className)} dir="rtl">
      <p className="text-xs font-medium tracking-wide text-muted">
        בחרו מסגרת הרשאה
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        מחירים לפני מע&quot;מ. אין סליקה באתר.
      </p>

      <ul
        className={cn(
          "mt-4 grid gap-2",
          density === "compact"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        )}
        role="listbox"
        aria-label="מסגרות הרשאה למאגר"
      >
        {ACCESS_FRAME_ROWS.map((row) => {
          const active = row.id === selected.id;
          const isDefault = row.id === DEFAULT_ACCESS_FRAME_ID;
          return (
            <li key={row.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => setSelectedId(row.id)}
                className={cn(
                  "flex w-full flex-col rounded-none border px-3 py-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                  active
                    ? "border-action bg-action/5"
                    : "border-foreground/15 bg-background hover:border-foreground/30",
                  density === "compact" ? "min-h-[4.5rem]" : "min-h-[5rem]",
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold tracking-tight">
                    {row.frame}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {row.price}
                  </span>
                </span>
                <span className="mt-1 text-xs text-muted">{row.validity}</span>
                {isDefault ? (
                  <span className="mt-1 text-[11px] text-action">מסלול יעד</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-none bg-[#D42B2B] px-4 text-sm font-semibold text-[#FAFAF8] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
        onClick={() => onRequest?.()}
      >
        בקשת מסגרת {selected.frame} ({selected.price})
      </a>
    </div>
  );
}
