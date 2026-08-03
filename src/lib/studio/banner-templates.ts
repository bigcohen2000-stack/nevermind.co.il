/**
 * Banner drafting templates + writing tips for Studio (plain keyboard punctuation).
 */

import type { BannerSlot } from "@/lib/studio/banners-shared";
import { SLOT_LABELS } from "@/lib/studio/banners-shared";

export type BannerDraft = {
  id: string;
  slot: BannerSlot;
  /** Short label in the template picker. */
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Why this draft exists. */
  tip: string;
};

export const BANNER_WRITING_TIPS: string[] = [
  "כותרת אחת קצרה. עובדה או פעולה, לא דרמה.",
  "גוף: משפט אחד או שניים. מה נפתח, ומה הצעד הבא.",
  "כפתור: פועל ברור (למועדון, לשידור, לבקשת גישה).",
  "קישור פנימי עדיף: /members, /live, /paths, /contact.",
  "באנר פעיל אחד לכל מיקום. השאר כבויים כמו טיוטות.",
  "בלי הבטחות ריפוי, בלי סימני קריאה מרובים, בלי אימוג'י.",
];

/** Ready drafts Yakir can load into the form or save as inactive. */
export const BANNER_DRAFTS: BannerDraft[] = [
  {
    id: "home-join-archive",
    slot: "home_join",
    label: "הצטרפות למאגר",
    title: "הצטרפות לחקירה",
    body: "מעל 150 שעות במאגר. ארבע רמות פירוק. בלי דרמה.",
    ctaLabel: "למועדון",
    ctaHref: "/members",
    tip: "טוב לדף הבית כשרוצים להוביל למועדון.",
  },
  {
    id: "home-join-paths",
    slot: "home_join",
    label: "מסלולים ומחירים",
    title: "מסלול או מסגרת גישה",
    body: "ייעוץ נקודתי, פגישה מורחבת, או הרשאה למאגר. מחירים לפני מע\"מ. אין סליקה באתר.",
    ctaLabel: "למסלולים",
    ctaHref: "/paths",
    tip: "כשרוצים להוביל למחירון לפני מועדון.",
  },
  {
    id: "home-join-contact",
    slot: "home_join",
    label: "שיחת התאמה",
    title: "שיחת התאמה קצרה",
    body: "כ-10 דקות. בדיקת התאמה טכנית ולוגית. לא ייעוץ.",
    ctaLabel: "ליצירת קשר",
    ctaHref: "/contact",
    tip: "כשיש עומס או כשרוצים לסנן לפני מחיר.",
  },
  {
    id: "members-login",
    slot: "members_hero",
    label: "כניסה למועדון",
    title: "כניסה למועדון",
    body: "מאגר החקירה פתוח לחברים. סיסמה או קישור אישי אחרי התאמה.",
    ctaLabel: "בקשת גישה",
    ctaHref: "/members#login",
    tip: "ברירת מחדל לעמוד המועדון.",
  },
  {
    id: "members-library",
    slot: "members_hero",
    label: "מה נפתח בפנים",
    title: "מה נפתח בפנים",
    body: "סרטונים לא רשומים, חיפוש תמלילים, ופיד פודקאסט פרטי.",
    ctaLabel: "למסגרות מחיר",
    ctaHref: "/paths#archive",
    tip: "כשרוצים להסביר ערך לפני כניסה.",
  },
  {
    id: "members-password-rotated",
    slot: "members_hero",
    label: "סיסמה הוחלפה",
    title: "סיסמה עודכנה",
    body: "אם הכניסה נכשלת, בקשו קישור אישי או סיסמה חדשה בוואטסאפ.",
    ctaLabel: "יצירת קשר",
    ctaHref: "/contact",
    tip: "להפעיל רק אחרי החלפת סיסמה משותפת.",
  },
  {
    id: "watch-gate-club",
    slot: "watch_gate",
    label: "נעילה: למועדון",
    title: "להמשיך בחקירה",
    body: "הסרטון המלא במועדון. אפשר לבקש מסגרת גישה או סרטון בודד.",
    ctaLabel: "למועדון",
    ctaHref: "/members",
    tip: "ברירת מחדל לנעילת צפייה.",
  },
  {
    id: "watch-gate-single",
    slot: "watch_gate",
    label: "נעילה: סרטון בודד",
    title: "סרטון בודד",
    body: "אפשר לבקש גישה לסרטון הזה בלבד. התיאום ידני, בלי סליקה באתר.",
    ctaLabel: "בקשת סרטון",
    ctaHref: "/contact",
    tip: "כשרוצים לדחוף בקשת סרטון בודד.",
  },
  {
    id: "watch-gate-paths",
    slot: "watch_gate",
    label: "נעילה: מחירון",
    title: "מסגרת גישה",
    body: "יומי, שבועי, חודשי או שנתי. מחיר לפני מע\"מ. אישור ידני אחרי התאמה.",
    ctaLabel: "למחירון",
    ctaHref: "/paths",
    tip: "כשרוצים מחיר ברור ליד הנעילה.",
  },
  {
    id: "live-now",
    slot: "live",
    label: "שידור פעיל",
    title: "יש שידור חי עכשיו",
    body: "כניסה דרך /live אחרי הרשמה חינם ואישור גיל 18+.",
    ctaLabel: "לשידור",
    ctaHref: "/live",
    tip: "להפעיל כשהשידור באמת פעיל בסטודיו.",
  },
  {
    id: "live-schedule",
    slot: "live",
    label: "לוח שידורים",
    title: "שידור חי מהאין",
    body: "שלישי וחמישי 20:00, מוצאי שבת 22:00 (שעון ישראל). כניסה ב-/live.",
    ctaLabel: "לפרטים",
    ctaHref: "/live",
    tip: "ברירת מחדל כשאין שידור פעיל.",
  },
  {
    id: "live-open-mic",
    slot: "live",
    label: "מיקרופון פתוח",
    title: "מיקרופון פתוח בשידור",
    body: "אפשר לבקש מקום לשאלה בשידור. התיאום ידני.",
    ctaLabel: "בקשת מקום",
    ctaHref: "/contact",
    tip: "כשיש מקומות פתוחים לשאלות בשידור.",
  },
  {
    id: "custom-capacity-open",
    slot: "custom",
    label: "קיבולת פתוחה",
    title: "יש מקומות לתהליך",
    body: "שיחת התאמה קצרה לפני תיאום. מחירים לפני מע\"מ באתר.",
    ctaLabel: "ליצירת קשר",
    ctaHref: "/contact",
    tip: "מיקום מותאם. חברו אותו רק אם יש מקום בקוד שמציג custom.",
  },
  {
    id: "custom-waitlist",
    slot: "custom",
    label: "רשימת המתנה",
    title: "רשימת המתנה",
    body: "כרגע אין מקומות מיידיים. אפשר להשאיר פרטים ונחזור כשייפתח מקום.",
    ctaLabel: "השארת פרטים",
    ctaHref: "/contact",
    tip: "להפעיל כשאין קיבולת.",
  },
  {
    id: "custom-book",
    slot: "custom",
    label: "ספר בפגישה",
    title: "ספר בפגישה פרונטלית",
    body: "אהבה ב-20 עמודים. תוספת לפגישה פרונטלית. אין סליקה באתר.",
    ctaLabel: "לספרים",
    ctaHref: "/books",
    tip: "לקמפיין קצר על הספר.",
  },
];

export function draftsForSlot(slot: BannerSlot): BannerDraft[] {
  return BANNER_DRAFTS.filter((d) => d.slot === slot);
}

export function slotHint(slot: BannerSlot): string {
  return `מיקום: ${SLOT_LABELS[slot]}. באנר פעיל אחד בלבד למיקום הזה.`;
}

/** Extra one-line alternatives for a field (writing help while editing). */
export const BANNER_FIELD_SUGGESTIONS: Record<
  BannerSlot,
  { titles: string[]; bodies: string[]; ctas: string[] }
> = {
  home_join: {
    titles: [
      "הצטרפות לחקירה",
      "מאגר הסרטונים",
      "שיחת התאמה קצרה",
    ],
    bodies: [
      "מעל 150 שעות. ארבע רמות. בלי דרמה.",
      "הרשאה ידנית אחרי התאמה. אין סליקה באתר.",
      "מתחילים משיחת התאמה של כ-10 דקות.",
    ],
    ctas: ["למועדון", "למסלולים", "ליצירת קשר"],
  },
  members_hero: {
    titles: ["כניסה למועדון", "מה נפתח בפנים", "סיסמה עודכנה"],
    bodies: [
      "סיסמה או קישור אישי אחרי התאמה.",
      "סרטונים לא רשומים, חיפוש מלא, פיד פרטי.",
      "אם הכניסה נכשלת, בקשו קישור חדש בוואטסאפ.",
    ],
    ctas: ["בקשת גישה", "למחירון", "יצירת קשר"],
  },
  watch_gate: {
    titles: ["להמשיך בחקירה", "סרטון בודד", "מסגרת גישה"],
    bodies: [
      "הסרטון המלא במועדון.",
      "אפשר לבקש גישה לסרטון הזה בלבד.",
      "מסגרת יומית עד שנתית. אישור ידני.",
    ],
    ctas: ["למועדון", "בקשת סרטון", "למחירון"],
  },
  live: {
    titles: ["יש שידור חי עכשיו", "שידור חי מהאין", "מיקרופון פתוח"],
    bodies: [
      "כניסה ב-/live אחרי הרשמה ואישור גיל 18+.",
      "שלישי וחמישי 20:00, מוצאי שבת 22:00.",
      "אפשר לבקש מקום לשאלה בשידור.",
    ],
    ctas: ["לשידור", "לפרטים", "בקשת מקום"],
  },
  custom: {
    titles: ["יש מקומות", "רשימת המתנה", "ספר בפגישה"],
    bodies: [
      "שיחת התאמה לפני תיאום.",
      "אין מקומות מיידיים. אפשר להשאיר פרטים.",
      "ספר כתוספת לפגישה פרונטלית.",
    ],
    ctas: ["ליצירת קשר", "השארת פרטים", "לספרים"],
  },
};
