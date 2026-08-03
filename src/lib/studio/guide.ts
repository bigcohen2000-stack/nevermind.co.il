/**
 * Hebrew Studio ops guide copy (plain keyboard punctuation only).
 */

export type StudioGuideSection = {
  id: string;
  title: string;
  what: string;
  canDo: string;
  where: string;
};

export const STUDIO_GUIDE_SECTIONS: StudioGuideSection[] = [
  {
    id: "entry",
    title: "כניסה",
    what: "שער מוסתר + סיסמת Studio. אופציונלי Cloudflare Access למייל שלך בלבד.",
    canDo: "לשמור סימנייה ל-gate, להזין סוד, לנעול בסיום.",
    where: "סימנייה: /nm-ops (או STUDIO_GATE_SLUG). לא מופיע בניווט הציבורי.",
  },
  {
    id: "ingestion",
    title: "סרטונים",
    what: "ספרייה, סנכרון YouTube, ייבוא, שידור חי, טעימות, סיסמת מועדון, חברים וקישורים.",
    canDo: "לסנכרן ספרייה, לייבא סרטון, לסמן מועדון, להגדיר טעימה, להנפיק קישורי כניסה ו-RSS.",
    where: "/studio",
  },
  {
    id: "analytics",
    title: "חיפושים",
    what: "אנליטיקס של שאילתות חיפוש באתר.",
    canDo: "לראות מה חיפשו, איכות תוצאות, נקודות עיוורות.",
    where: "/studio/analytics",
  },
  {
    id: "leads",
    title: "לידים",
    what: "פניות מסרטון בודד ולידים לפני פגישה.",
    canDo: "לעקוב אחרי פניות ולסמן טיפול.",
    where: "/studio/leads",
  },
  {
    id: "quotes",
    title: "הצעות",
    what: "קישורי הצעות מחיר.",
    canDo: "ליצור, לערוך, לכבות קישור.",
    where: "/studio/quotes",
  },
  {
    id: "banners",
    title: "באנרים",
    what: "באנרי אתר (סטטוס / הודעות).",
    canDo: "ליצור, לערוך, להפעיל או לכבות.",
    where: "/studio/banners",
  },
  {
    id: "comments",
    title: "תגובות",
    what: "תגובות לב לתצוגת החוקר המצטיין.",
    canDo: "לאשר, לערוך, להסיר תגובות מוצגות.",
    where: "/studio/comments",
  },
  {
    id: "users",
    title: "משתמשים",
    what: "התחברויות אתר, נוכחות, גישת וידאו, תיעוד פגישות.",
    canDo: "להעניק או לסיים גישת וידאו, לראות מי מחובר, לתעד פגישה.",
    where: "/studio/users",
  },
  {
    id: "layers",
    title: "שכבות גישה",
    what: "חשבון Google או אימייל = אזור אישי. מועדון = שכבה נפרדת. Studio = רק אתה.",
    canDo: "משתמש רגיל לא רואה Studio. מועדון לא ניתן אוטומטית לכל נרשם.",
    where: "/profile ו-/my-list למשתמשים. /members למועדון.",
  },
];
