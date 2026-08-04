/**
 * Hebrew WhatsApp / ops message templates for Studio (plain keyboard punctuation).
 */

import { LIVE_PAGE_URL } from "@/lib/live/schedule";

const PROFILE_URL = "https://nevermind.co.il/profile";
const MEMBERS_URL = "https://nevermind.co.il/members";

function formatHebrewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      dateStyle: "long",
    });
  } catch {
    return iso;
  }
}

function formatHebrewDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("he-IL", {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Club capabilities for WhatsApp paste (Studio copy). */
function clubBenefitsLines(): string[] {
  return [
    "מה פתוח בחשבון:",
    "• מאגר סרטונים לא רשומים: צפייה מלאה בסרטונים חסומים ובשיחות ללא פילטר.",
    "• פיד פודקאסט פרטי (RSS): האזנה באודיו בלבד בדרכים (אפל פודקאסט, ספוטיפיי וכו').",
    "• 4 רמות פירוק: סינון ממוקד לפי עומק (פירוק ראשוני, אין-הבדל, ללא פילטר, ארכיון השברים).",
    "• חיפוש תמלילים מלא: סריקת מילים ומושגים מתוך השיחות בעברית.",
    '• מדדי חקירה: הצגת "עומק הצלילה", "נקודות היפוך" וענן תגיות לצד הווידאו.',
    "• החוקר המצטיין: שאלות פתוחות שעברו מסנן לוגי לצד התוכן.",
  ];
}

/**
 * Full WhatsApp paste: login link and/or password, how to enter, opened capabilities.
 */
export function clubAccessGranted(input: {
  name: string;
  password?: string;
  magicUrl?: string;
  /** Include capability list. Default true. */
  includeBenefits?: boolean;
}): string {
  const name = input.name.trim();
  const includeBenefits = input.includeBenefits !== false;
  const lines: string[] = [];

  if (name && name !== "שלום" && name !== "חבר/ת") {
    lines.push(`שלום ${name},`, "");
  }

  lines.push("🔑 הגישה למועדון אושרה ופעילה.");

  if (input.magicUrl?.trim()) {
    lines.push(
      "",
      "כניסה מהירה (קישור אישי):",
      input.magicUrl.trim(),
      "",
      "פותחים מהטלפון. אם נשאל טלפון, מזינים את המספר המורשה שלך.",
    );
  }

  if (input.password?.trim()) {
    lines.push(
      "",
      "שלבי כניסה:",
      "",
      `נכנסים לנתיב: ${MEMBERS_URL}`,
      "",
      "מזינים את מספר הטלפון המורשה שלך.",
      "",
      `מזינים את הסיסמה: ${input.password.trim()}`,
    );
  }

  if (!input.magicUrl?.trim() && !input.password?.trim()) {
    lines.push(
      "",
      "שלבי כניסה:",
      "",
      `נכנסים לנתיב: ${MEMBERS_URL}`,
      "",
      "מזינים את מספר הטלפון המורשה שלך.",
      "",
      "מזינים את הסיסמה או פותחים את הקישור האישי שנשלח בנפרד.",
    );
  }

  if (includeBenefits) {
    lines.push("", ...clubBenefitsLines());
  }

  lines.push(
    "",
    "דגש אבטחה: הגישה היא אישית ומזוהה. אין להעביר את הסיסמה או הקישור לגורם נוסף.",
    "",
    "לשאלות או בירור - אפשר להשיב ישירות להודעה זו.",
    "",
    "תפוגת הגישה שלך ואפשרויות מופיעות בעמוד האישי שלך",
    PROFILE_URL,
  );

  return lines.join("\n");
}

/** Short login-only guide (no password/link yet). */
export function clubLoginGuide(input: { name: string }): string {
  const name = input.name.trim();
  const lines: string[] = [];

  if (name && name !== "שלום" && name !== "חבר/ת") {
    lines.push(`שלום ${name},`, "");
  }

  lines.push(
    "📋 הדרכת כניסה למועדון NeverMinde:",
    "",
    "אפשרות 1: קישור אישי (מהיר)",
    "פתיחה ישירה של הקישור האישי שאשלח לך מיד (מומלץ בטלפון).",
    "",
    "אפשרות 2: כניסה ידנית",
    "",
    `נכנסים לנתיב: ${MEMBERS_URL}`,
    "",
    "מזינים את מספר הטלפון המורשה + הסיסמה שאשלח לך.",
    "",
    "לאחר ההתחברות נפתחים:",
    "• מאגר הסרטונים הלא-רשומים בצפייה מלאה",
    "• מנגנון חיפוש התמלילים המלא",
    "• פיד פודקאסט פרטי (RSS להאזנה באודיו בלבד)",
    "",
    "אם משהו לא עובד או לשאלה - אפשר להשיב ישירות להודעה זו.",
  );

  return lines.join("\n");
}

export function singleVideoFollowUp(input: {
  title: string;
  videoId: string;
}): string {
  const title = input.title.trim() || "הסרטון";
  const id = input.videoId.trim();
  return [
    "שלום,",
    "",
    `ביקשת גישה לסרטון: ${title}.`,
    "",
    `קישור: https://nevermind.co.il/watch/${id}`,
    "",
    "אם צריך עזרה בכניסה - אפשר להשיב להודעה זו.",
  ].join("\n");
}

export function expiryReminder(input: {
  name: string;
  expiresAt: string;
}): string {
  const name = input.name.trim();
  const when = formatHebrewDate(input.expiresAt);
  const lines: string[] = [];

  if (name && name !== "שלום" && name !== "חבר/ת") {
    lines.push(`שלום ${name},`, "");
  }

  lines.push(
    "⏰ תזכורת גישה למועדון",
    "",
    `תוקף הגישה למועדון מסתיים ב-${when}.`,
    "",
    "לחידוש - אפשר להשיב ישירות להודעה זו ונעדכן.",
    "",
    "פרטי התוקף והאפשרויות גם בעמוד האישי:",
    PROFILE_URL,
    "",
    `כניסה למועדון: ${MEMBERS_URL}`,
  );

  return lines.join("\n");
}

/** Announce live to a WhatsApp group or individual. */
export function liveNowAnnounce(input: {
  topic?: string;
  /** Softer wording for one person. Default false = group blast. */
  individual?: boolean;
}): string {
  const topic = input.topic?.trim();
  const greeting = input.individual ? "שלום," : "שלום לכולם,";
  const lines = [
    greeting,
    "",
    "🔴 יש עכשיו שידור חי ב-NeverMinde.",
  ];
  if (topic) {
    lines.push(`נושא: ${topic}`);
  }
  lines.push(
    "",
    `כניסה: ${LIVE_PAGE_URL}`,
    "",
    "נרשמים בחינם, מאשרים גיל 18+, ונכנסים.",
  );
  return lines.join("\n");
}

/** Reminder before a scheduled slot (not necessarily live yet). */
export function liveUpcomingAnnounce(input: {
  whenLabel: string;
  topic?: string;
}): string {
  const lines = [
    "📅 תזכורת שידור חי - NeverMinde",
    "",
    `מתי: ${input.whenLabel.trim()}`,
  ];
  if (input.topic?.trim()) {
    lines.push(`נושא: ${input.topic.trim()}`);
  }
  lines.push("", `קישור: ${LIVE_PAGE_URL}`);
  return lines.join("\n");
}

export type MeetingOfferId = "oneoff" | "extended" | "library" | "custom";

export type MeetingInviteInput = {
  name: string;
  phone?: string;
  email?: string;
  /** Offer title, e.g. ייעוץ נקודתי */
  track: string;
  /** Display price before VAT */
  priceBeforeVat: string;
  /** ISO local datetime string from datetime-local input */
  startsAt: string;
  durationMinutes: number;
  locationNote?: string;
  /** Optional bank / Bit / payment URL note from Yakir */
  paymentDetails?: string;
  notes?: string;
};

/** WhatsApp: reservation + payment according to price list. */
export function meetingReservationPayment(input: MeetingInviteInput): string {
  const name = input.name.trim() || "שלום";
  const when = input.startsAt
    ? formatHebrewDateTime(input.startsAt)
    : "יתואם";
  const lines = [
    `שלום ${name},`,
    "",
    "הזמנה לשיריון פגישה ב-NeverMinde:",
    "",
    `מסלול: ${input.track.trim()}`,
    `מתי: ${when}`,
    `משך: כ-${input.durationMinutes} דקות`,
    `מחיר לפי מחירון: ${input.priceBeforeVat.trim()} לפני מע"מ`,
  ];
  if (input.locationNote?.trim()) {
    lines.push(`מיקום / אופן: ${input.locationNote.trim()}`);
  }
  lines.push(
    "",
    "לשיריון המקום נשלחים פרטי תשלום.",
    "אחרי אישור התשלום נשלח אישור סופי.",
  );
  if (input.paymentDetails?.trim()) {
    lines.push("", "פרטי תשלום:", input.paymentDetails.trim());
  } else {
    lines.push(
      "",
      "פרטי תשלום: אשלח בהודעה הבאה או בקישור נפרד אחרי אישור.",
    );
  }
  if (input.notes?.trim()) {
    lines.push("", `הערה: ${input.notes.trim()}`);
  }
  lines.push("", VAT_LINE, "", "לשאלות - אפשר להשיב להודעה זו.");
  return lines.join("\n");
}

const VAT_LINE = 'המחיר לפני מע"מ. מע"מ יתווסף בחשבונית כחוק.';

export function formatMeetingWhen(iso: string): string {
  return formatHebrewDateTime(iso);
}
