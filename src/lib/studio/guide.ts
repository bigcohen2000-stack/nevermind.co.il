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
    what: "ספרייה, סנכרון YouTube, ייבוא, שידור חי, טעימות, סיסמת מועדון, חברים, קישורי כניסה, ועזרה לניהול.",
    canDo:
      "לסנכרן, לייבא, להכריז שידור בוואטסאפ, להנפיק קישור כניסה עם יכולות, להעתיק תבניות עדכון.",
    where: "/studio",
  },
  {
    id: "analytics",
    title: "חיפושים",
    what: "אנליטיקס של שאילתות חיפוש באתר (טבלת search_analytics).",
    canDo: "לראות מה חיפשו, 0 תוצאות, דיסלייקים, לייצא CSV, לפתוח חיפוש באתר.",
    where: "/studio/analytics",
  },
  {
    id: "leads",
    title: "לידים",
    what: "פניות יצירת קשר (booking_leads), לידים לפני פגישה, ולידי סרטון בודד.",
    canDo:
      "לעקוב, לסמן סטטוס, לייצא CSV, וואטסאפ, PDF הזמנה, יומן .ics, הודעת שיריון לפי מחירון.",
    where:
      "/studio/leads. טבלת booking_leads וסטטוס pre_meeting דורשים מיגרציה 33 ב-Supabase.",
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
    what: "הודעות באתר לפי מיקום: בית, מועדון, נעילת צפייה, שידור, מותאם.",
    canDo:
      "לטעון תבניות מוכנות, לקבל הצעות כתיבה, לשמור טיוטות כבויות, להפעיל באנר אחד לכל מיקום.",
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
    what: "התחברויות אתר, נוכחות, גישת וידאו, תאריכי הרשמה/תפוגה/פגישה, ואישור V מהמשתמש.",
    canDo:
      "לסנן בטבלאות, לקבוע פגישה + קישור אישור, לייצא CSV, לראות סטטוס Vercel/CF/GitHub מקריאה בלבד.",
    where: "/studio/users. מיגרציה 34 לאישור פגישות.",
  },
  {
    id: "layers",
    title: "שכבות גישה",
    what: "חשבון Google או אימייל = אזור אישי. מועדון = שכבה נפרדת. Studio = רק אתה.",
    canDo: "משתמש רגיל לא רואה Studio. מועדון לא ניתן אוטומטית לכל נרשם.",
    where: "/profile ו-/my-list למשתמשים. /members למועדון.",
  },
];
