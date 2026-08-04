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
    body: "לפחות 10 תווים (עדיף מילה ארוכה + מספרים מסיסמה קצרה ומסובכת).",
  },
  {
    id: "pw-rotate",
    title: "החלפה",
    body: "בעדכון סיסמה משותפת, יש לשלוח הודעה חדשה לחברים הפעילים (העוגיות הישנות יפוגו בכניסה הבאה).",
  },
  {
    id: "pw-channel",
    title: "אופן שליחה",
    body: "קישור אישי (טוקן) מיועד למשתמש יחיד. סיסמה משותפת מיועדת לקבוצה מוכרת בלבד. אין לפרסם בקבוצה פתוחה.",
  },
  {
    id: "pw-reuse",
    title: "הפרדה",
    body: "אין למחזר סיסמאות אישיות (מייל/בנק). הסיסמה המשותפת מיועדת אך ורק לנתיב /members.",
  },
];

export const PUBLISH_OPS_TIPS: StudioOpsTip[] = [
  {
    id: "pub-title",
    title: "כותרת יבשה",
    body: "ציון המנגנון או השאלה בלבד. ללא דרמה, ללא סופרלטיבים וללא הבטחות.",
  },
  {
    id: "pub-teaser",
    title: "טעימה",
    body: "לסרטון חסום יש להגדיר טעימה קצרה לפני הפרסום.",
  },
  {
    id: "pub-search",
    title: "אימות חיפוש",
    body: "לאחר ייבוא, יש לבדוק את המונח המרכזי ב-/search. אם מופיעות 0 תוצאות למונח נפוץ, יש להוסיפו למילון המושגים.",
  },
  {
    id: "pub-announce",
    title: "הודעת עדכון",
    body: "תבנית קצרה שכוללת מה חדש + קישור יחיד (ללא רשימות ארוכות).",
  },
];

export const UPDATE_OPS_TIPS: StudioOpsTip[] = [
  {
    id: "upd-banner",
    title: "באנר המערכת",
    body: "מופעל בדף הבית/הנעילה רק כשיש הודעה אחת ממוקדת. יש לכבות באנרים ישנים.",
  },
  {
    id: "upd-live",
    title: "שידור חי",
    body: "התחלת שידור בסטודיו, הדבקת הודעה ייעודית ל-/live, סיום השידור במערכת בסיום.",
  },
  {
    id: "upd-capacity",
    title: "קיבולת",
    body: "במקרה של חוסר מקומות, יש לעדכן CAPACITY_STATUS ב-offers (או בבאנר) לפני שליחת ההזמנות.",
  },
  {
    id: "upd-leads",
    title: "ניהול לידים",
    body: "עדכון סטטוס ביום הפנייה. ליד ללא מעקב נשכח. יש לבצע ייצוא CSV שבועי.",
  },
];

export const QUICK_ANNOUNCE_TEMPLATES: {
  id: string;
  label: string;
  text: string;
}[] = [
  {
    id: "new-video",
    label: "סרטון חדש",
    text: [
      "עדכון קצר מ-NeverMinde:",
      "",
      "סרטון חדש עלה למאגר.",
      "לצפייה: https://nevermind.co.il/videos",
      "",
      "לשאלות או בירור - אפשר להשיב להודעה זו.",
    ].join("\n"),
  },
  {
    id: "new-article",
    label: "מאמר חדש",
    text: [
      "עדכון מ-NeverMinde:",
      "",
      "פורסם מאמר חדש במאגר.",
      "לקריאה: https://nevermind.co.il/articles",
      "",
      "קריאה אנליטית. ללא דרמה.",
    ].join("\n"),
  },
  {
    id: "password-rotated",
    label: "החלפת סיסמה",
    text: [
      "עדכון גישה:",
      "",
      "סיסמת המועדון הוחלפה.",
      "אשלח את הסיסמה החדשה בהודעה נפרדת, או קישור כניסה אישי.",
      "",
      "https://nevermind.co.il/members",
      "",
      "לשאלות - אפשר להשיב להודעה זו.",
    ].join("\n"),
  },
];

export function getAnnounceTemplate(id: string): string | null {
  return QUICK_ANNOUNCE_TEMPLATES.find((t) => t.id === id)?.text ?? null;
}
