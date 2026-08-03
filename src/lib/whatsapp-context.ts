import { buildWhatsAppHref } from "@/lib/whatsapp";

/**
 * Path-aware WhatsApp prefill for footer / float CTAs.
 * Keeps the visitor context in the message so Yakir sees the entry page.
 */

export type WhatsAppContextInput = {
  pathname: string;
  /** Optional title when on /watch or /articles. */
  topic?: string;
};

export function getContextualWhatsAppText(input: WhatsAppContextInput): string {
  const path = (input.pathname || "/").split("?")[0] || "/";
  const topic = input.topic?.trim();

  if (path.startsWith("/watch")) {
    return topic
      ? `היי יקיר, ראיתי את הסרטון "${topic}" באתר. אשמח לתאם שיחה.`
      : "היי יקיר, הגעתי מעמוד צפייה באתר. אשמח לתאם שיחה.";
  }

  if (path.startsWith("/paths") || path.startsWith("/members")) {
    return "היי יקיר, הגעתי מעמוד המסלולים / המועדון. אשמח לבדיקת התאמה.";
  }

  if (path.startsWith("/live")) {
    return "היי יקיר, הגעתי מעמוד השידור החי. אשמח פרטים על מפגשים.";
  }

  if (path.startsWith("/booking")) {
    return "היי יקיר, הגעתי מעמוד התיאום באתר. אשמח להמשיך תיאום.";
  }

  if (path.startsWith("/articles")) {
    return topic
      ? `היי יקיר, קראתי את המאמר "${topic}" באתר. אשמח לתאם שיחה.`
      : "היי יקיר, הגעתי ממאמר באתר. אשמח לתאם שיחה.";
  }

  if (path.startsWith("/search") || path.startsWith("/concepts")) {
    return "היי יקיר, הגעתי מחיפוש / מושגים באתר. אשמח לתאם שיחה.";
  }

  if (path.startsWith("/contact")) {
    return "היי יקיר, הגעתי מעמוד יצירת הקשר באתר.";
  }

  return "היי יקיר, הגעתי מאתר nevermind.co.il. אשמח לתאם שיחה.";
}

export function getContextualWhatsAppHref(input: WhatsAppContextInput): string {
  return buildWhatsAppHref(getContextualWhatsAppText(input));
}
