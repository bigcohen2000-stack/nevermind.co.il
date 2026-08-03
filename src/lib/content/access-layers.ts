/**
 * Clear free vs club access layers. Factual, no drama.
 */

export type AccessBenefit = {
  title: string;
  body: string;
  tip: string;
};

/** What anyone gets without club payment or allowlist. */
export const FREE_ACCESS_BENEFITS: AccessBenefit[] = [
  {
    title: "סרטונים פתוחים",
    body: "צפייה מלאה בסרטונים הציבוריים. בלי כניסה למועדון.",
    tip: "אפשר להתחיל מכאן בלי תשלום ובלי סיסמה.",
  },
  {
    title: "טיזר 2 דקות למועדון",
    body: "בסרטונים חסומים אפשר לשמוע את שתי הדקות הראשונות בחינם. אחר כך נדרשת גישה.",
    tip: "טיזר קצר בלבד. לא הסרטון המלא של המועדון.",
  },
  {
    title: "מאמרים ומנגנונים",
    body: "כל המאמרים ומפת המנגנונים פתוחים לקריאה.",
    tip: "חקירה בכתב ומפת שלושת הצירים זמינים לכולם.",
  },
  {
    title: "מושגים וחיפוש",
    body: "מדריך מושגים, חיפוש, והשלמה בעברית על התוכן הציבורי.",
    tip: "החיפוש על תוכן מועדון נפתח אחרי כניסה.",
  },
  {
    title: "פודקאסט ציבורי",
    body: "פיד RSS ציבורי להרצאות הפתוחות. אפשר להוסיף באפליקציית האזנה.",
    tip: "זה לא הפיד הפרטי של המועדון.",
  },
  {
    title: "חשבון אתר (חינם)",
    body: "Google או קישור לאימייל. שומרים רשימה והיסטוריית צפייה. בלי סיסמה. זה לא פותח את מאגר המועדון.",
    tip: "חשבון האתר ומועדון הם שתי שכבות נפרדות.",
  },
];

/** What club membership unlocks after fit check. */
export const CLUB_ACCESS_BENEFITS: AccessBenefit[] = [
  {
    title: "מאגר סרטונים לא רשומים",
    body: "צפייה מלאה בסרטונים חסומים ובשיחות ללא פילטר. הכותרות גלויות גם לפני כניסה.",
    tip: "לא רשום ביוטיוב או חסום באתר. נפתח אחרי כניסת מועדון.",
  },
  {
    title: "פיד פודקאסט פרטי",
    body: "קישור RSS אישי ומאובטח. מאזינים למאגר בנהיגה או בהליכה באפל פודקאסט, ספוטיפיי או כל אפליקציה. אודיו בלבד.",
    tip: "קישור אישי. לא משתפים. אודיו בלבד בלי מסך.",
  },
  {
    title: "ארבע רמות פירוק",
    body: "סינון לפי עומק: פירוק ראשוני, אין-הבדל, ללא פילטר, ארכיון השברים.",
    tip: "אפשר לסנן בעמוד הווידאו לפי רמת העומק.",
  },
  {
    title: "חיפוש תמלילים מלא",
    body: "חיפוש במושגים ובתמלילים של סרטוני המועדון, כולל השלמה בעברית.",
    tip: "כולל תוכן שלא זמין למי שלא במועדון.",
  },
  {
    title: "מדדי חקירה וענן כתוביות",
    body: "עומק הצלילה, נקודות היפוך, ותגיות מהתמליל ליד הסרטון.",
    tip: "מופיעים ליד נגן הצפייה אחרי כניסה.",
  },
  {
    title: "החוקר המצטיין",
    body: "שאלות פתוחות שעברו מסנן לוגי ליד החקירה.",
    tip: "שאלות מהקהילה ליד הסרטון, לא צ'אט חי.",
  },
  {
    title: "חקירה קשורה",
    body: "סרטונים ומאמרים נוספים על אותו נושא, בלי להתחיל מאפס.",
    tip: "ממשיכים מאותו מושג בלי לחפש מאפס.",
  },
  {
    title: "כניסה אישית",
    body: "קישור בוואטסאפ או סיסמת מועדון. בלי סליקה באתר. אחרי שיחת התאמה.",
    tip: "אין תשלום אוטומטי באתר. הגישה נפתחת ידנית.",
  },
];

export const PRIVATE_PODCAST_WHATSAPP =
  "היי יקיר. אני חבר מועדון ומבקש קישור לפיד פודקאסט פרטי (RSS) להאזנה באפליקציה.";

/** Required acknowledgment before club login or access request. */
export const CLUB_JOIN_DISCLAIMER =
  "הכניסה לחקירה המלאה עלולה לפרק את המציאות כפי שאתה מכיר אותה. הצטרפות למועדון היא הסכמה להטיל ספק בכל מה שחשבת שהוא אמת.";

/** Two lines for editorial layout (same meaning as CLUB_JOIN_DISCLAIMER). */
export const CLUB_JOIN_DISCLAIMER_LINES = [
  "הכניסה לחקירה המלאה עלולה לפרק את המציאות כפי שאתה מכיר אותה.",
  "הצטרפות למועדון היא הסכמה להטיל ספק בכל מה שחשבת שהוא אמת.",
] as const;

/** Personal-use terms shown after entitled watch / profile. */
export const PERSONAL_USE_NOTICE = {
  title: "שימוש אישי בלבד",
  lines: [
    "הגישה למאגר אישית. אין להעביר סיסמה, קישור, או הקלטות.",
    "התוכן לחקירה עצמית. לא ייעוץ רפואי, משפטי, או טיפול.",
    "שיתוף ציבורי או מסחרי של חומר מהמאגר אסור בלי אישור מפורש.",
  ],
} as const;

export const PRIVATE_PODCAST_BANNER = {
  eyebrow: "הטבת מועדון",
  title: "פיד פודקאסט פרטי.",
  body: "קישור RSS אישי למאגר הלא-רשום. מאזינים בנהיגה או בהליכה, בלי מסך. באפל פודקאסט, ספוטיפיי, או כל אפליקציית האזנה.",
  freeNote: "הפיד הציבורי נשאר חינם להרצאות הפתוחות.",
  clubCta: "לפרטי המועדון",
  requestCta: "בקשת קישור פיד בוואטסאפ",
} as const;

/** Four hero facts on /paths and related boards. */
export const MEMBERSHIP_HIGHLIGHTS = [
  {
    id: "fit",
    icon: "shield" as const,
    title: "שיחת התאמה",
    body: "בודקים כיוון לפני שפותחים מאגר. אין סליקה באתר.",
  },
  {
    id: "whatsapp",
    icon: "phone" as const,
    title: "קישור או סיסמה",
    body: "אחרי התאמה מקבלים גישה בוואטסאפ. אישית למכשיר.",
  },
  {
    id: "library",
    icon: "library" as const,
    title: "מאגר מלא",
    body: "סרטונים לא רשומים, חיפוש בתמליל, וארבע רמות עומק.",
  },
  {
    id: "podcast",
    icon: "headphones" as const,
    title: "פיד פרטי",
    body: "RSS אישי להאזנה באפליקציה. אודיו בלבד, בלי מסך.",
  },
] as const;

export type MembershipCompareRow = {
  feature: string;
  free: boolean;
  club: boolean;
  note?: string;
  icon:
    | "play"
    | "timer"
    | "book"
    | "search"
    | "rss"
    | "user"
    | "lock"
    | "headphones"
    | "layers"
    | "fileSearch"
    | "gauge"
    | "message"
    | "pen"
    | "sparkles";
};

/** Free vs club comparison rows for the membership board. */
export const MEMBERSHIP_COMPARE_ROWS: MembershipCompareRow[] = [
  {
    feature: "סרטונים ציבוריים",
    free: true,
    club: true,
    icon: "play",
  },
  {
    feature: "טיזר 2 דקות למועדון",
    free: true,
    club: true,
    note: "טיזר בלבד למי שלא במועדון.",
    icon: "timer",
  },
  {
    feature: "מאמרים ומנגנונים",
    free: true,
    club: true,
    icon: "book",
  },
  {
    feature: "חיפוש על תוכן ציבורי",
    free: true,
    club: true,
    icon: "search",
  },
  {
    feature: "חשבון אתר (רשימה והיסטוריה)",
    free: true,
    club: true,
    note: "לא פותח את מאגר המועדון.",
    icon: "user",
  },
  {
    feature: "פיד פודקאסט ציבורי",
    free: true,
    club: true,
    icon: "rss",
  },
  {
    feature: "מאגר סרטונים לא רשומים",
    free: false,
    club: true,
    icon: "lock",
  },
  {
    feature: "פיד פודקאסט פרטי",
    free: false,
    club: true,
    icon: "headphones",
  },
  {
    feature: "ארבע רמות פירוק",
    free: false,
    club: true,
    icon: "layers",
  },
  {
    feature: "חיפוש בתמלילי מועדון",
    free: false,
    club: true,
    icon: "fileSearch",
  },
  {
    feature: "מדדי חקירה ליד הסרטון",
    free: false,
    club: true,
    icon: "gauge",
  },
  {
    feature: "החוקר המצטיין",
    free: false,
    club: true,
    icon: "message",
  },
];

/** Quick links after club entry. */
export const MEMBER_POST_LOGIN_OFFERS = [
  {
    id: "club-videos",
    title: "סרטוני מועדון",
    body: "המאגר הלא רשום. סינון לפי עומק או מושג.",
    href: "/videos?filter=club",
    cta: "למאגר",
  },
  {
    id: "search",
    title: "חיפוש במאגר",
    body: "כותרות, מושגים ותמלילים. כולל תוכן מועדון.",
    href: "/search",
    cta: "לחיפוש",
  },
  {
    id: "live",
    title: "שידור חי וארכיון",
    body: "לייב לרשומים. ארכיון לא רשום לחברים.",
    href: "/live",
    cta: "ללייב",
  },
  {
    id: "podcast",
    title: "פיד פודקאסט פרטי",
    body: "בקשת קישור RSS אישי להאזנה באפליקציה.",
    href: "/members#podcast",
    cta: "לפיד",
  },
  {
    id: "my-list",
    title: "הרשימה שלי",
    body: "שמירות והמשך צפייה בחשבון האתר.",
    href: "/my-list",
    cta: "לרשימה",
  },
  {
    id: "paths",
    title: "חידוש או שדרוג",
    body: "מסגרות מחיר גלויות. בלי סליקה באתר.",
    href: "/members#membership-prices",
    cta: "למחירים",
  },
] as const;
