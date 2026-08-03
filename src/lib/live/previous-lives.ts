/**
 * Curated archive of previous LIVE sessions (unlisted / club recordings).
 * Edit this list to control what appears first on /live.
 *
 * youtubeId: 11-char YouTube id (same as Studio / sync).
 * label: optional short Hebrew label under the title.
 * airedAt: optional ISO date (YYYY-MM-DD) for sorting / display.
 */

export type PreviousLiveEntry = {
  youtubeId: string;
  label?: string;
  airedAt?: string;
};

/**
 * Fill this array with past LIVE recordings you want featured.
 * Example:
 * { youtubeId: "Ap_YtCBV4cI", label: "לייב: יחסים", airedAt: "2026-07-15" },
 *
 * Until you add entries, /live falls back to recent unlisted videos from the index.
 */
export const PREVIOUS_LIVES: PreviousLiveEntry[] = [
  // Add youtube ids here when you want a fixed archive order.
];

export const LIVE_ARCHIVE_PAGE_SIZE = 24;

export const LIVE_VOTE_NOTE =
  "הסרטון עם הכי הרבה לייקים עשוי להיבחר ללייב חינם לרשומים באתר. לא התחייבות. בחירה שלנו.";
