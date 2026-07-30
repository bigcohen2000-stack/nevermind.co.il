/**
 * Operational offers synced from the live nevermind.co.il landing.
 * No prices in this stage — format + WhatsApp presets only.
 */

export type PathId = "weekly" | "oneoff" | "podcast" | "group" | "unsure";

export interface PathOffer {
  id: PathId;
  title: string;
  body: string;
  tags: string[];
  /** Prefill text for a direct WhatsApp CTA on this path. */
  whatsappText: string;
  /** Optional external link (e.g. YouTube for podcast). */
  externalHref?: string;
  externalLabel?: string;
}

export type ContentKind = "book" | "article" | "course" | "podcast";
export type ContentStatus = "writing" | "soon" | "building" | "available";

export interface ContentItem {
  id: string;
  title: string;
  kind: ContentKind;
  status: ContentStatus;
  statusLabel: string;
  whatsappText: string;
  externalHref?: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const PATH_OFFERS: PathOffer[] = [
  {
    id: "weekly",
    title: "ליווי שבועי",
    body: "פגישה קבועה אחת לשבוע. מפרקים יחד אירועים, תגובות ודפוסים, ומיישרים את השכל עם המציאות.",
    tags: ["שבועי", "שעה", "קבוע"],
    whatsappText:
      "היי יקיר, אני רוצה לבדוק לגבי הליווי השבועי. איך זה עובד מבחינת זמנים ואיפה נפגשים בדרך כלל (מרכז, בית קפה או זום)?",
  },
  {
    id: "oneoff",
    title: "ייעוץ נקודתי",
    body: "נתקעת במשהו ספציפי. שיחה אחת, שעה אחת. מפרקים את הסיטואציה עד שנשאר רק ההיגיון.",
    tags: ["חד פעמי", "שעה", "ממוקד"],
    whatsappText:
      "היי יקיר, יש לי סיטואציה נקודתית שאני רוצה לפרק. מתי יש לך שעה פנויה השבוע ואיך הכי נוח לעשות את זה?",
  },
  {
    id: "podcast",
    title: "פודקאסט מרפסת",
    body: "שיחות על החיים, על השכל, ועל הפער ביניהם. כל פרק מפרק מנגנון אחד שניתן ליישם אחרי ההאזנה.",
    tags: ["חינם", "האזנה", "שבועי"],
    whatsappText:
      "היי יקיר, אשמח לקבל עדכונים על פרקים חדשים של הפודקאסט.",
    externalHref: "https://www.youtube.com/@NeverMind-il",
    externalLabel: "לערוץ ביוטיוב",
  },
  {
    id: "group",
    title: "קבוצת למידה",
    body: "ללמוד את השיטה עם עוד אנשים. מפגש קבוצתי שמפרק מנגנונים יחד.",
    tags: ["קבוצתי", "דו שבועי", "אינטימי"],
    whatsappText:
      "היי יקיר, מעניין אותי להצטרף לקבוצת הלמידה. מתי נפתחת קבוצה חדשה, איפה המפגשים מתקיימים וכמה זמן כל מפגש?",
  },
];

/** Interest options for the contact form (includes unsure). */
export const CONTACT_INTERESTS: { id: PathId; label: string }[] = [
  { id: "weekly", label: "ליווי שבועי" },
  { id: "oneoff", label: "ייעוץ נקודתי (שיחה אחת)" },
  { id: "podcast", label: "פודקאסט מרפסת" },
  { id: "group", label: "קבוצת למידה" },
  { id: "unsure", label: "עדיין לא בטוח - בוא נדבר" },
];

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "love-20-pages",
    title: "אהבה ב-20 עמודים",
    kind: "book",
    status: "writing",
    statusLabel: "ספר · בכתיבה",
    whatsappText: "היי יקיר, מתי הספר אהבה ב-20 עמודים יהיה זמין?",
  },
  {
    id: "what-is-ego",
    title: "מהו אגו?",
    kind: "article",
    status: "soon",
    statusLabel: "מאמר · יעלה בקרוב",
    whatsappText: "היי יקיר, מתי המאמר על האגו יעלה?",
  },
  {
    id: "pure-love",
    title: "מהי אהבה טהורה?",
    kind: "article",
    status: "soon",
    statusLabel: "מאמר · יעלה בקרוב",
    whatsappText: "היי יקיר, אני רוצה לשאול משהו על אהבה טהורה.",
  },
  {
    id: "divorce-or-stay",
    title: "האם להתגרש או להישאר?",
    kind: "article",
    status: "soon",
    statusLabel: "מאמר · יעלה בקרוב",
    whatsappText: "היי יקיר, אני רוצה לבדוק משהו לגבי האם להתגרש.",
  },
  {
    id: "manners-respect",
    title: "מה זה נימוס? מה זה כבוד?",
    kind: "article",
    status: "soon",
    statusLabel: "מאמר · יעלה בקרוב",
    whatsappText: "היי יקיר, מתי המאמר על נימוס וכבוד יהיה זמין?",
  },
  {
    id: "fact-vs-interpretation",
    title: "איך להבדיל בין עובדה לפירוש?",
    kind: "article",
    status: "soon",
    statusLabel: "מאמר · יעלה בקרוב",
    whatsappText: "היי יקיר, אני רוצה לדבר על ההבדל בין עובדה לפירוש.",
  },
  {
    id: "basic-good-bad",
    title: "רמה בסיסית — טוב ורע נפרדים באמת",
    kind: "course",
    status: "building",
    statusLabel: "תוכן בבניה",
    whatsappText: "היי יקיר, אני רוצה לשמוע על הקורס רמה בסיסית.",
  },
  {
    id: "advanced-beyond-mind",
    title: "רמה מתקדמת — מעבר לשכל",
    kind: "course",
    status: "building",
    statusLabel: "תוכן בבניה",
    whatsappText: "היי יקיר, רציתי לשאול על הרמה המתקדמת.",
  },
  {
    id: "anxiety-course",
    title: "חרדה — ללמוד לפחד נכון",
    kind: "course",
    status: "building",
    statusLabel: "תוכן בבניה",
    whatsappText: "היי יקיר, מעניין אותי הקורס על חרדה.",
  },
  {
    id: "relationships-course",
    title: "זוגיות ואהבה",
    kind: "course",
    status: "building",
    statusLabel: "תוכן בבניה",
    whatsappText: "היי יקיר, מעניין אותי הקורס על זוגיות.",
  },
  {
    id: "podcast-mirpeset",
    title: "פודקאסט מרפסת",
    kind: "podcast",
    status: "available",
    statusLabel: "זמין להאזנה",
    whatsappText:
      "היי יקיר, אשמח לקבל עדכונים על פרקים חדשים של הפודקאסט.",
    externalHref: "https://www.youtube.com/@NeverMind-il",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "שיחת היכרות",
    body: "10 דקות בטלפון. בודקים אם זה מתאים לך, ולא להפך. בלי התחייבות.",
  },
  {
    index: "02",
    title: "פירוק ראשון",
    body: "בפגישה הראשונה מפרקים מנגנון אחד שיושב לך. רואים איך זה עובד. מחליטים אם להמשיך.",
  },
  {
    index: "03",
    title: "יישור עם המציאות",
    body: "אם ממשיכים, כל פגישה מיישרת עוד פער בין מה שאתה חושב לבין מה שבאמת קורה.",
  },
];

export const CONTACT_FAQ: FaqItem[] = [
  {
    question: "איך החקירה הזו עובדת?",
    answer:
      "לוגיקה טהורה ושכל ישר. פריקה של מה שהתרגלת לחשוב, ויישור השכל עם מה שקורה במציאות. אל תאמין לי. תבדוק בעצמך.",
  },
  {
    question: "מה ההבדל בין ליווי שבועי לייעוץ נקודתי?",
    answer:
      "ליווי שבועי הוא תהליך עקבי של פגישות קבועות. ייעוץ נקודתי הוא שיחה חד-פעמית של שעה לפירוק סיטואציה ספציפית.",
  },
  {
    question: "האם הפודקאסט מרפסת חינמי?",
    answer:
      "כן. הפודקאסט זמין להאזנה חופשית. כל פרק מפרק מנגנון אחד. זו דרך לבדוק אם הכיוון מדבר אליך לפני שמתחייבים.",
  },
  {
    question: "איפה נפגשים?",
    answer:
      "אפשר בזום, אפשר פנים אל פנים במרכז הארץ, ואפשר בשיחת טלפון. מה שנוח לך.",
  },
];

export function getPathById(id: string): PathOffer | undefined {
  return PATH_OFFERS.find((p) => p.id === id);
}

export function buildLeadWhatsAppText(input: {
  name: string;
  phone: string;
  interestLabel: string;
  message?: string;
}): string {
  const lines = [
    "היי יקיר, הגעתי מהאתר.",
    `שם: ${input.name.trim()}`,
    `טלפון: ${input.phone.trim()}`,
    `מעניין אותי: ${input.interestLabel}`,
  ];
  const msg = input.message?.trim();
  if (msg) {
    lines.push(`מה קורה: ${msg}`);
  }
  lines.push("מתי נוח לך שנדבר?");
  return lines.join("\n");
}
