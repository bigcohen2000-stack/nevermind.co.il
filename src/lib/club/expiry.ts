/**
 * Club membership expiry helpers for the renewal banner.
 * Pure date math and copy: no Supabase, safe on client and server.
 * Source of truth is club_members.expires_at (fallback: profiles.access_expires_at).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start showing the renewal notice this many days before the end date. */
export const CLUB_EXPIRY_NOTICE_DAYS = 14;

/** Bonus months added on top of a paid month when renewing on the last day. */
export const CLUB_LAST_DAY_BONUS_MONTHS = 2;

export type ClubExpiryState = {
  /** ISO end date, as stored in the database. */
  expiresAt: string;
  /** Whole days left, rounded up. 0 once the end date passed. */
  daysLeft: number;
  expired: boolean;
  /** Last day of the membership: the bonus renewal offer is available. */
  finalDay: boolean;
  /** Inside the notice window, so the banner should render. */
  showNotice: boolean;
};

/**
 * Build the banner state from a raw expiry value.
 * Returns null for open ended memberships and unparsable dates.
 */
export function resolveClubExpiryState(
  expiresAt: string | null | undefined,
  now: number = Date.now(),
): ClubExpiryState | null {
  const raw = expiresAt?.trim();
  if (!raw) return null;

  const endMs = new Date(raw).getTime();
  if (!Number.isFinite(endMs)) return null;

  const msLeft = endMs - now;
  const expired = msLeft <= 0;
  const daysLeft = expired ? 0 : Math.max(1, Math.ceil(msLeft / DAY_MS));

  return {
    expiresAt: raw,
    daysLeft,
    expired,
    finalDay: expired || daysLeft <= 1,
    showNotice: expired || daysLeft <= CLUB_EXPIRY_NOTICE_DAYS,
  };
}

export function formatClubExpiryDate(expiresAt: string): string {
  const date = new Date(expiresAt);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", { dateStyle: "medium" });
}

/** Dry status line: no hype, just the fact. */
export function formatClubExpiryHeadline(state: ClubExpiryState): string {
  if (state.expired) return "החברות במועדון הסתיימה.";
  if (state.daysLeft <= 1) return "החברות במועדון מסתיימת היום.";
  if (state.daysLeft === 2) return "החברות במועדון מסתיימת מחר.";
  return `החברות במועדון מסתיימת בעוד ${state.daysLeft} ימים.`;
}

/** WhatsApp prefill for the manual renewal flow. */
export function buildClubRenewalMessage(
  state: ClubExpiryState,
  displayName?: string | null,
): string {
  const name = displayName?.trim();
  const who = name
    ? `אני ${name}, חבר מועדון באתר.`
    : "אני חבר מועדון באתר.";

  if (state.expired) {
    return `היי יקיר, ${who} החברות שלי הסתיימה. אשמח לחדש עם ההטבה: חודש בתשלום ועוד ${CLUB_LAST_DAY_BONUS_MONTHS} חודשים מתנה.`;
  }

  if (state.finalDay) {
    return `היי יקיר, ${who} זה היום האחרון של החברות שלי. אשמח לחדש עם הטבת היום האחרון: חודש בתשלום ועוד ${CLUB_LAST_DAY_BONUS_MONTHS} חודשים מתנה.`;
  }

  const dateLabel = formatClubExpiryDate(state.expiresAt);
  const when = dateLabel ? ` בתאריך ${dateLabel}` : "";
  return `היי יקיר, ${who} החברות שלי מסתיימת${when}. אשמח לחדש.`;
}
