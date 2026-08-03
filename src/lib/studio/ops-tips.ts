/**
 * Lightweight Studio ops tips: passwords, publishing, updates (plain punctuation).
 */

export type StudioOpsTip = {
  id: string;
  title: string;
  body: string;
};

export const PASSWORD_OPS_TIPS: StudioOpsTip[] = [
  {
    id: "pw-length",
    title: "אורך",
    body: "לפחות 10 תווים. עדיף מילה ארוכה + מספרים מאשר סיסמה קצרה ומסובכת.",
  },
  {
    id: "pw-rotate",
    title: "החלפה",
    body: "כשמחליפים סיסמה משותפת, שלחו הודעה חדשה לחברים הפעילים. עוגיות ישנות נופלות בכניסה הבאה.",
  },
  {
    id: "pw-channel",
    title: "איך שולחים",
    body: "עדיף קישור אישי (טוקן) לבודד. סיסמה משותפת לקבוצה קטנה שכבר מכירים. לא לפרסם בקבוצה פתוחה.",
  },
  {
    id: "pw-reuse",
    title: "אל תמחזר",
    body: "אל תשתמש בסיסמת אימייל או בנק. הסיסמה המשותפת היא רק ל-/members.",
  },
];

export const PUBLISH_OPS_TIPS: StudioOpsTip[] = [
  {
    id: "pub-title",
    title: "כותרת יבשה",
    body: "כותרת שמציינת את המנגנון או השאלה. בלי דרמה ובלי הבטחות ריפוי.",
  },
  {
    id: "pub-teaser",
    title: "טעימה",
    body: "לסרטון חסום: הגדר טעימה קצרה לפני פרסום. בלי טעימה הכניסה מרגישה קרה.",
  },
  {
    id: "pub-search",
    title: "חיפוש",
    body: "אחרי ייבוא, חפש מושג מרכזי ב-/search. אם 0 תוצאות למונח נפוץ, הוסף אותו למושגים.",
  },
  {
    id: "pub-announce",
    title: "הודעת עדכון",
    body: "תבנית קצרה: מה חדש + קישור אחד. לא רשימת תכונות ארוכה.",
  },
];

export const UPDATE_OPS_TIPS: StudioOpsTip[] = [
  {
    id: "upd-banner",
    title: "באנר",
    body: "באנר לדף הבית או לנעילה רק כשיש הודעה אחת ברורה. כבה באנרים ישנים.",
  },
  {
    id: "upd-live",
    title: "שידור",
    body: "התחל שידור בסטודיו, העתק הודעת קבוצה ל-/live, סיים שידור אחרי הסיום.",
  },
  {
    id: "upd-capacity",
    title: "קיבולת",
    body: "אם אין מקומות, עדכן CAPACITY_STATUS ב-offers (או באנר) לפני שמפרסמים הזמנות.",
  },
  {
    id: "upd-leads",
    title: "לידים",
    body: "סמן סטטוס באותו יום. ליד פתוח בלי מעקב נשכח. CSV לייצוא שבועי.",
  },
];

export const QUICK_ANNOUNCE_TEMPLATES: { id: string; label: string; text: string }[] =
  [
    {
      id: "new-video",
      label: "סרטון חדש",
      text: [
        "עדכון קצר מ-NeverMinde:",
        "",
        "יש סרטון חדש במאגר.",
        "כניסה: https://nevermind.co.il/videos",
        "",
        "שאלות? כתבו כאן.",
      ].join("\n"),
    },
    {
      id: "new-article",
      label: "מאמר חדש",
      text: [
        "עדכון קצר:",
        "",
        "פורסם מאמר חדש.",
        "https://nevermind.co.il/articles",
        "",
        "קריאה שקטה. בלי דרמה.",
      ].join("\n"),
    },
    {
      id: "password-rotated",
      label: "סיסמה הוחלפה",
      text: [
        "שלום,",
        "",
        "סיסמת המועדון הוחלפה.",
        "אשלח לך את הסיסמה החדשה בהודעה נפרדת, או קישור כניסה אישי.",
        "",
        "https://nevermind.co.il/members",
      ].join("\n"),
    },
  ];
