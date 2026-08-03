/**
 * Public copy for /videos. Factual, plain punctuation.
 */

export const VIDEOS_HIGHLIGHTS = [
  {
    id: "search",
    icon: "search" as const,
    title: "חיפוש לפי מושג",
    body: "כותרת, מושג או שאלה. אחר כך סינון ומיון בספרייה.",
  },
  {
    id: "open",
    icon: "play" as const,
    title: "סרטונים פתוחים",
    body: "צפייה מלאה בלי כניסה. טיזר קצר גם לסרטוני מועדון.",
  },
  {
    id: "club",
    icon: "lock" as const,
    title: "מאגר מועדון",
    body: "סרטונים חסומים מסומנים בתג. נפתחים אחרי כניסה.",
  },
  {
    id: "levels",
    icon: "layers" as const,
    title: "רמות פירוק",
    body: "אפשר לסנן לפי עומק: מפירוק ראשוני עד ארכיון השברים.",
  },
] as const;

export const VIDEOS_ACCESS_ROWS = [
  {
    feature: "צפייה בסרטונים פתוחים",
    free: true,
    club: true,
  },
  {
    feature: "טיזר 2 דקות לסרטון מועדון",
    free: true,
    club: true,
  },
  {
    feature: "מאגר חסום מלא",
    free: false,
    club: true,
  },
  {
    feature: "סינון לפי רמות פירוק",
    free: false,
    club: true,
  },
  {
    feature: "חיפוש בתמלילי מאגר",
    free: false,
    club: true,
  },
  {
    feature: "פיד פודקאסט פרטי",
    free: false,
    club: true,
  },
] as const;

export const VIDEOS_FAQ = [
  {
    q: "מה פתוח בלי מועדון?",
    a: "סרטונים ציבוריים במלואם. במועדון: טיזר של כשתי דקות, ואז נדרשת גישה.",
  },
  {
    q: "איך מסננים?",
    a: "הכול / פתוחים / מועדון. מיון לפי חדש, ישן, כותרת או אורך. אפשר גם לפי מושג או רמת פירוק.",
  },
  {
    q: "איך נכנסים למאגר?",
    a: "שיחת התאמה, ואז קישור או סיסמה. אין סליקה באתר. מסגרות מחיר גלויות במסלולים.",
  },
] as const;
