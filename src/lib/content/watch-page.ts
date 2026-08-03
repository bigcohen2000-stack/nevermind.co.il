/**
 * Watch page guide copy. Plain punctuation, factual.
 */

export const WATCH_PUBLIC_HIGHLIGHTS = [
  {
    id: "play",
    icon: "play" as const,
    title: "צפייה מלאה",
    body: "הסרטון הפתוח זמין כאן בלי כניסה למועדון.",
  },
  {
    id: "facts",
    icon: "sparkles" as const,
    title: "תובנות ליד הסרטון",
    body: "עובדות פתוחות. תמליל מלא אחרי חשבון אתר חינם.",
  },
  {
    id: "related",
    icon: "layers" as const,
    title: "המשך חקירה",
    body: "סרטונים קשורים, מאמרים, ומושגים מאותו ציר.",
  },
  {
    id: "club",
    icon: "lock" as const,
    title: "מאגר מועדון",
    body: "סרטונים חסומים, רמות פירוק, ופיד פרטי אחרי התאמה.",
  },
] as const;

export const WATCH_MEMBER_HIGHLIGHTS = [
  {
    id: "archive",
    icon: "lock" as const,
    title: "מאגר פתוח",
    body: "צפייה מלאה בסרטוני מועדון במכשיר הזה.",
  },
  {
    id: "levels",
    icon: "layers" as const,
    title: "רמות ומושגים",
    body: "מדדי חקירה, קפיצה לזמן במושג, והמשך קשור.",
  },
  {
    id: "reply",
    icon: "pen" as const,
    title: "תגובה: השם לא משנה",
    body: "כתיבה ישירה ליד הסרטון. לחברי מועדון.",
  },
  {
    id: "personal",
    icon: "shield" as const,
    title: "שימוש אישי",
    body: "הגישה אישית. אסור לשתף קישור או להעביר לאחרים.",
  },
] as const;

export const WATCH_LOCKED_HIGHLIGHTS = [
  {
    id: "teaser",
    icon: "play" as const,
    title: "טיזר קצר",
    body: "כשתי דקות בחינם כשיש טעימה. לא הסרטון המלא.",
  },
  {
    id: "full",
    icon: "lock" as const,
    title: "הסרטון המלא במועדון",
    body: "נפתח אחרי שיחת התאמה וקישור או סיסמה.",
  },
  {
    id: "price",
    icon: "library" as const,
    title: "מסגרות מחיר גלויות",
    body: "במסלולים ובמועדון. אין סליקה באתר.",
  },
  {
    id: "single",
    icon: "timer" as const,
    title: "סרטון בודד",
    body: "אפשר לבקש פתיחה לסרטון אחד לחלון קצר.",
  },
] as const;

export const WATCH_LOCKED_FAQ = [
  {
    q: "למה הסרטון נעול?",
    a: "זה חלק ממאגר המועדון. הכותרת גלויה. הצפייה המלאה אחרי כניסה.",
  },
  {
    q: "מה אפשר לעשות עכשיו?",
    a: "לראות טיזר אם יש, לבקש סרטון בודד, או שיחת התאמה למועדון.",
  },
  {
    q: "איפה רואים מחירים?",
    a: "מסגרות המחיר גלויות בעמוד המסלולים ובעמוד המועדון.",
  },
] as const;
