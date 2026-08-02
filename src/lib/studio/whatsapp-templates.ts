/**
 * Hebrew WhatsApp message templates for club ops (plain punctuation).
 */

function formatHebrewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      dateStyle: "long",
    });
  } catch {
    return iso;
  }
}

export function clubAccessGranted(input: {
  name: string;
  password?: string;
  magicUrl?: string;
}): string {
  const name = input.name.trim() || "שלום";
  const lines = [
    `שלום ${name},`,
    "",
    "הגישה למועדון NeverMinde פתוחה.",
  ];

  if (input.password?.trim()) {
    lines.push("", `סיסמה: ${input.password.trim()}`);
  }
  if (input.magicUrl?.trim()) {
    lines.push("", `קישור כניסה: ${input.magicUrl.trim()}`);
  }

  lines.push(
    "",
    "הגישה אישית. אל תעבירו את הסיסמה או הקישור.",
    "",
    "nevermind.co.il/members",
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
    `ביקשתם גישה לסרטון: ${title}.`,
    "",
    `קישור: https://nevermind.co.il/watch/${id}`,
    "",
    "אם צריך עזרה בכניסה, כתבו כאן.",
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
    "לחידוש, כתבו כאן ונעדכן.",
  ].join("\n");
}
