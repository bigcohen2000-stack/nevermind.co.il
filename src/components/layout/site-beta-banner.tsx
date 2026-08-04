"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleWarning, X } from "lucide-react";

import { useFabBarContribution } from "@/components/layout/use-fab-bar-contribution";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const BETA_BANNER_DISMISS_KEY = "nm-beta-banner-dismissed-v1";

const REPORT_WHATSAPP_TEXT =
  "היי יקיר. דיווח מהאתר בהרצה:\n\nנתקלתי בטעות / תקלה בעמוד:\n(כתבו מה ראיתם)\n\n";

const BETA_VISIBLE_EVENT = "nm-beta-banner-visibility";

/**
 * Bottom soft-launch strip: invite bug / mistake reports.
 * Fixed above the fold bottom so mobile users can report without digging.
 * Publishes height into --nm-fab-bar for WhatsApp / a11y clearance.
 */
export function SiteBetaBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [ready, setReady] = useState(false);
  const reportHref = buildWhatsAppHref(REPORT_WHATSAPP_TEXT);
  const showing = ready && !dismissed;
  const barRef = useFabBarContribution<HTMLDivElement>("beta", showing);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(BETA_BANNER_DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!showing) {
      delete document.documentElement.dataset.nmBetaBar;
      window.dispatchEvent(new Event(BETA_VISIBLE_EVENT));
      return;
    }
    document.documentElement.dataset.nmBetaBar = "1";
    window.dispatchEvent(new Event(BETA_VISIBLE_EVENT));
    return () => {
      delete document.documentElement.dataset.nmBetaBar;
      window.dispatchEvent(new Event(BETA_VISIBLE_EVENT));
    };
  }, [showing]);

  function dismiss() {
    try {
      window.localStorage.setItem(BETA_BANNER_DISMISS_KEY, "1");
      window.dispatchEvent(new Event("nm-beta-banner-dismiss"));
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (!showing) return null;

  return (
    <>
      {/* Reserve space so footer / last content stay above the fixed bar. */}
      <div className="h-20 sm:h-16" aria-hidden="true" />
      <div
        ref={barRef}
        role="region"
        aria-label="האתר בהרצה. דיווח על טעות"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[55]",
          "border-t border-action/50 bg-action text-[#FAFAF8]",
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3">
          <p className="min-w-0 text-xs leading-snug sm:text-sm">
            <span className="font-semibold tracking-tight">האתר בהרצה.</span>{" "}
            <span className="text-[#FAFAF8]/90">
              נתקלתם בטעות או בתקלה? דווחו בקצרה. עוזרים לנו לתקן.
            </span>
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={reportHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 sm:flex-none",
                "border border-[#FAFAF8]/35 bg-[#FAFAF8] px-4 text-sm font-semibold text-action",
                "transition hover:bg-[#FAFAF8]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              )}
            >
              <MessageCircleWarning
                className="size-4"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              דיווח על טעות
            </a>
            <Link
              href="/contact?from=beta-banner"
              className={cn(
                "inline-flex min-h-11 items-center justify-center px-3 text-sm",
                "border border-[#FAFAF8]/35 text-[#FAFAF8]",
                "transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              )}
            >
              כתיבה
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#FAFAF8]/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="סגירת באנר הרצה"
            >
              <X className="size-4" aria-hidden strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * True when the beta bottom bar is actually mounted (not merely undismissed in storage).
 * Club members never mount the banner, so this stays false for them.
 */
export function useBetaBannerVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      setVisible(document.documentElement.dataset.nmBetaBar === "1");
    };
    sync();
    window.addEventListener(BETA_VISIBLE_EVENT, sync);
    window.addEventListener("nm-beta-banner-dismiss", sync);
    return () => {
      window.removeEventListener(BETA_VISIBLE_EVENT, sync);
      window.removeEventListener("nm-beta-banner-dismiss", sync);
    };
  }, []);

  return visible;
}
