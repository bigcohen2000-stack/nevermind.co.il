/**
 * Static factual proof for /members (and reusable fact strips).
 * Manual snapshot. Do not call YouTube API for these.
 * Prefer depth metrics (hours, archive size, concepts) over vanity subscribers.
 */

import {
  BREAKDOWN_LEVELS,
  BREAKDOWN_LEVEL_BLURBS,
  BREAKDOWN_LEVEL_LABELS,
  BREAKDOWN_LEVEL_NUMBERS,
} from "@/lib/videos/investigation";

export type MembersStaticProof = {
  /** Kept for internal/editorial use. Not shown as a primary vanity metric. */
  channelSubscribersApprox: number;
  youtubeViewsMin: number;
  activeSinceYear: number;
  activeSinceLabel: string;
  libraryHoursMin: number;
  libraryHoursLabel: string;
  libraryVideosApprox: number;
  libraryVideosLabel: string;
  investigationLevels: number;
  conceptsExploredMin: number;
  conceptsExploredLabel: string;
  communityLabel: string;
  communityBody: string;
};

export const MEMBERS_STATIC_PROOF: MembersStaticProof = {
  channelSubscribersApprox: 725,
  youtubeViewsMin: 205_000,
  activeSinceYear: 2021,
  activeSinceLabel: "העלאות משמעותיות במתכונת הנוכחית מ-2021",
  libraryHoursMin: 150,
  libraryHoursLabel: "כ-150+ שעות חקירה ושיחות עומק במאגר",
  libraryVideosApprox: 300,
  libraryVideosLabel: "כ-300 סרטוני ארכיון (פתוחים ולא רשומים)",
  investigationLevels: 4,
  conceptsExploredMin: 50,
  conceptsExploredLabel:
    "מעל 50 מושגי יסוד (זמן, פחד, בחירה, אמת) עברו חקירה יסודית בספרייה",
  communityLabel: "קהילה סגורה של חוקרי אמת",
  communityBody:
    "האיכות והעומק של הדיון חשובים מהכמות. מספר החברים לא מוצג בפומבי.",
};

/** Ordered Level 1-4 cards for /members. */
export const MEMBERS_INVESTIGATION_LEVELS = BREAKDOWN_LEVELS.map((id) => ({
  id,
  level: BREAKDOWN_LEVEL_NUMBERS[id],
  title: BREAKDOWN_LEVEL_LABELS[id],
  body: BREAKDOWN_LEVEL_BLURBS[id],
}));
