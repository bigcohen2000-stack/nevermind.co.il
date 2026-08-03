"use client";

import { useEffect, useState } from "react";
import { MessageCircleWarning } from "lucide-react";

import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "nm-beta-banner-dismissed-v1";

const REPORT_WHATSAPP_TEXT =
  "היי יקיר. דיווח מהאתר בהרצה:\n\nראיתי תקלה / יש לי הצעת שיפור:\n";

/**
 * Top strip: site is in soft launch. Invite bug reports and improvement notes.
 */
export function SiteBetaBanner() {
  const [dismissed, setDismissed] = useState(true);
  const reportHref = buildWhatsAppHref(REPORT_WHATSAPP_TEXT);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="האתר בהרצה"
      className="border-b border-action/40 bg-action text-[#FAFAF8]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        <p className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
          <span className="font-semibold tracking-tight">האתר בהרצה.</span>{" "}
          <span className="text-[#FAFAF8]/90">
            ראיתם תקלה או רוצים לשפר משהו? זה הזמן לדווח.
          </span>
        </p>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <a
            href={reportHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-none",
              "border border-[#FAFAF8]/35 bg-[#FAFAF8] px-3 text-xs font-semibold text-action",
              "transition hover:bg-[#FAFAF8]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            )}
          >
            <MessageCircleWarning
              className="size-3.5"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            דיווח או שיפור
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-9 min-w-9 items-center justify-center text-[#FAFAF8]/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="סגירת באנר הרצה"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
