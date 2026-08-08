import { CalendarClock, Gift } from "lucide-react";
import Link from "next/link";

import {
  buildClubRenewalMessage,
  CLUB_LAST_DAY_BONUS_MONTHS,
  formatClubExpiryDate,
  formatClubExpiryHeadline,
  type ClubExpiryState,
} from "@/lib/club/expiry";
import { ClubRenewalRequestMark } from "@/components/layout/club-renewal-request-mark";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ClubExpiryBannerProps = {
  state: ClubExpiryState;
  /** Club display name, used only to prefill the renewal message. */
  displayName?: string | null;
  /**
   * ISO timestamp when the member already marked that a request was sent on
   * WhatsApp. Null means the mark button is still open.
   */
  renewalRequestedAt?: string | null;
};

/**
 * Slim strip above the header for club members whose membership has an end date.
 * Renewal is manual: the CTA opens WhatsApp with a prefilled request.
 * No checkout runs on the site.
 */
export function ClubExpiryBanner({
  state,
  displayName = null,
  renewalRequestedAt = null,
}: ClubExpiryBannerProps) {
  const headline = formatClubExpiryHeadline(state);
  const dateLabel = formatClubExpiryDate(state.expiresAt);
  const renewalHref = buildWhatsAppHref(
    buildClubRenewalMessage(state, displayName),
  );
  const Icon = state.finalDay ? Gift : CalendarClock;

  return (
    <aside
      role="region"
      aria-label="תוקף החברות במועדון"
      className={cn(
        "border-b text-foreground",
        state.finalDay
          ? "border-action/45 bg-action/[0.10]"
          : "border-action/30 bg-action/[0.05]",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
            <Icon
              className="size-4 shrink-0 text-action"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            {headline}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted sm:text-sm">
            {state.finalDay ? (
              <>
                {state.expired ? "ההטבה עדיין תקפה" : "הטבת יום אחרון"}: חודש
                בתשלום ועוד {CLUB_LAST_DAY_BONUS_MONTHS} חודשים מתנה. שולחים
                בקשה, יקיר מאריך את התאריך ידנית. אין תשלום באתר.
              </>
            ) : (
              <>
                {dateLabel ? `תאריך סיום: ${dateLabel}. ` : ""}
                החידוש נעשה מול יקיר בוואטסאפ. שולחים בקשה, התאריך מוארך ידנית.
                אין תשלום באתר.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={renewalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center bg-action px-3 text-xs font-semibold text-white no-underline transition hover:bg-action/90 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            {state.finalDay
              ? state.expired
                ? "לבקש חידוש עם ההטבה"
                : "לבקש את הטבת היום האחרון"
              : "לבקש חידוש חברות"}
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-9 items-center justify-center border border-foreground/20 px-3 text-xs text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            יצירת קשר
          </Link>
          <ClubRenewalRequestMark requestedAt={renewalRequestedAt} />
        </div>
      </div>
    </aside>
  );
}

export default ClubExpiryBanner;
