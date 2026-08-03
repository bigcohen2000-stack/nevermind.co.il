/**
 * Time-of-day greeting in Israel timezone (plain punctuation).
 */

export type DayPart = "morning" | "noon" | "afternoon" | "evening" | "night";

export function israelHourNow(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  return Number.isFinite(hour) ? hour : 12;
}

export function dayPartFromHour(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 15) return "noon";
  if (hour >= 15 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

const GREETING_BY_PART: Record<DayPart, string> = {
  morning: "בוקר טוב",
  noon: "צהריים טובים",
  afternoon: "אחר צהריים טובים",
  evening: "ערב טוב",
  night: "לילה טוב",
};

/**
 * Friendly first-name-ish label from email local part (no PII expansion).
 */
export function displayNameFromEmail(email: string | null | undefined): string | null {
  if (!email?.trim()) return null;
  const local = email.split("@")[0]?.trim();
  if (!local) return null;
  const cleaned = local.replace(/[._+-]+/g, " ").trim();
  if (!cleaned) return null;
  const first = cleaned.split(/\s+/)[0];
  if (!first || first.length < 2) return cleaned.slice(0, 24);
  return first.slice(0, 24);
}

export function buildTimeGreeting(input: {
  name?: string | null;
  now?: Date;
}): string {
  const part = dayPartFromHour(israelHourNow(input.now));
  const base = GREETING_BY_PART[part];
  const name = input.name?.trim();
  if (name) return `${base}, ${name}.`;
  return `${base}.`;
}
