/**
 * Hebrew WhatsApp / ops message templates for Studio (plain keyboard punctuation).
 */

import { CLUB_ACCESS_BENEFITS } from "@/lib/content/access-layers";
import { LIVE_PAGE_URL } from "@/lib/live/schedule";

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

function clubBenefitsLines(): string[] {
  return [
    "מה נפתח לך:",
    ...CLUB_ACCESS_BENEFITS.slice(0, 6).map(
      (b) => `- ${b.title}: ${b.body}`,
    ),
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
  const name = input.name.trim() || "שלום";
  const includeBenefits = input.includeBenefits !== false;
  const lines = [
    `שלום ${name},`,
    "",
    "הגישה למועדון NeverMinde פתוחה.",
  ];

  if (input.magicUrl?.trim()) {
    lines.push(
      "",
      "כניסה מהירה (קישור אישי, לא להעברה):",
      input.magicUrl.trim(),
      "",
      "איך זה עובד:",
      "1. לחץ על הקישור מהטלפון.",
      "2. תיכנס אוטומטית למועדון.",
      "3. אם נשאל טלפון, הזן את המספר שלך.",
    );
  }

  if (input.password?.trim()) {
    lines.push(
      "",
      "כניסה עם סיסמה:",
      "1. היכנס ל: https://nevermind.co.il/members",
      "2. הזן מספר טלפון + הסיסמה למטה.",
      `סיסמה: ${input.password.trim()}`,
    );
  }

  if (!input.magicUrl?.trim() && !input.password?.trim()) {
    lines.push(
      "",
      "איך להתחבר:",
      "1. היכנס ל: https://nevermind.co.il/members",
      "2. הזן את מספר הטלפון שלך.",
      "3. אם קיבלת סיסמה או קישור בנפרד, השתמש בהם.",
    );
  }

  if (includeBenefits) {
    lines.push("", ...clubBenefitsLines());
  }

  lines.push(
    "",
    "הגישה אישית. אל תעביר את הסיסמה או הקישור.",
    "",
    "שאלות? כתוב כאן.",
  );

  return lines.join("\n");
}

/** Short login-only guide (no password/link yet). */
export function clubLoginGuide(input: { name: string }): string {
  const name = input.name.trim() || "שלום";
  return [
    `שלום ${name},`,
    "",
    "הדרכה קצרה לכניסה למועדון NeverMinde:",
    "",
    "אפשרות א: קישור אישי שאשלח לך. פתח אותו בטלפון.",
    "אפשרות ב: https://nevermind.co.il/members עם טלפון + סיסמה שאשלח.",
    "",
    "אחרי כניסה נפתחים מאגר הסרטונים, חיפוש מלא, ופיד פודקאסט פרטי.",
    "",
    "כתוב כאן אם משהו לא עובד.",
  ].join("\n");
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
    "אם צריך עזרה בכניסה, כתוב כאן.",
  ].join("\n");
}

export function expiryReminder(input: {
  name: string;
  expiresAt: string;
}): string {
  const name = input.name.trim() || "שלום";
  const when = formatHebrewDate(input.expiresAt);
  return [
    `שלום ${name},`,
    "",
    `תוקף הגישה למועדון מסתיים ב-${when}.`,
    "",
    "לחידוש, כתוב כאן ונעדכן.",
  ].join("\n");
}

/** Announce live to a WhatsApp group or individual. */
export function liveNowAnnounce(input: {
  topic?: string;
  /** Softer wording for one person. Default false = group blast. */
  individual?: boolean;
}): string {
  const topic = input.topic?.trim();
  const greeting = input.individual
    ? "שלום,"
    : "שלום לכולם,";
  const lines = [
    greeting,
    "",
    input.individual
      ? "יש עכשיו שידור חי ב-NeverMinde."
      : "יש עכשיו שידור חי ב-NeverMinde.",
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
    "תזכורת שידור חי - NeverMinde",
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
      "פרטי תשלום: אשלח בהודעה הבאה / בקישור נפרד אחרי אישור.",
    );
  }
  if (input.notes?.trim()) {
    lines.push("", `הערה: ${input.notes.trim()}`);
  }
  lines.push("", VAT_LINE, "", "שאלות? כתוב כאן.");
  return lines.join("\n");
}

const VAT_LINE = 'המחיר לפני מע"מ. מע"מ יתווסף בחשבונית כחוק.';

export function formatMeetingWhen(iso: string): string {
  return formatHebrewDateTime(iso);
}
