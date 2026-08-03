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
  activeSinceTip: string;
  libraryHoursMin: number;
  libraryHoursLabel: string;
  libraryHoursTip: string;
  libraryVideosApprox: number;
  libraryVideosLabel: string;
  libraryVideosTip: string;
  investigationLevels: number;
  investigationLevelsTip: string;
  conceptsExploredMin: number;
  conceptsExploredLabel: string;
  conceptsExploredTip: string;
  communityLabel: string;
  communityBody: string;
  communityTip: string;
};

export const MEMBERS_STATIC_PROOF: MembersStaticProof = {
  channelSubscribersApprox: 725,
  youtubeViewsMin: 205_000,
  activeSinceYear: 2021,
  activeSinceLabel: "העלאות משמעותיות במתכונת הנוכחית מ-2021",
  activeSinceTip:
    "שנת ההתחלה של המתכונת הנוכחית של החקירה ביוטיוב ובמאגר. לא תאריך הקמת הערוץ הראשון.",
  libraryHoursMin: 150,
  libraryHoursLabel: "כ-150+ שעות חקירה ושיחות עומק במאגר",
  libraryHoursTip:
    "סכום משכי הסרטונים במאגר (פתוחים ולא רשומים). אומדן ידני, לא מונה צפיות בזמן אמת.",
  libraryVideosApprox: 300,
  libraryVideosLabel: "כ-300 סרטוני ארכיון (פתוחים ולא רשומים)",
  libraryVideosTip:
    "כולל סרטונים פתוחים וסרטוני מועדון. המספר המדויק באתר מופיע למטה בספירה החיה.",
  investigationLevels: 4,
  investigationLevelsTip:
    "ארבע רמות עומק בחקירה: בסיס, העמקה, שיחות עומק, והפירוק הגולמי למועדון.",
  conceptsExploredMin: 50,
  conceptsExploredLabel:
    "מעל 50 מושגי יסוד (זמן, פחד, בחירה, אמת) עברו חקירה יסודית בספרייה",
  conceptsExploredTip:
    "מושגים שחזרו בסרטונים ובמאמרים. מדריך המושגים באתר מציג את האינדקס החי.",
  communityLabel: "קהילה סגורה של חוקרי אמת",
  communityBody:
    "האיכות והעומק של הדיון חשובים מהכמות. מספר החברים לא מוצג בפומבי.",
  communityTip:
    "אין מונה מנויים פומבי. הכניסה אחרי בדיקת התאמה. המטרה היא חקירה, לא קהל.",
};

/** Ordered Level 1-4 cards for /members. */
export const MEMBERS_INVESTIGATION_LEVELS = BREAKDOWN_LEVELS.map((id) => ({
  id,
  level: BREAKDOWN_LEVEL_NUMBERS[id],
  title: BREAKDOWN_LEVEL_LABELS[id],
  body: BREAKDOWN_LEVEL_BLURBS[id],
}));
