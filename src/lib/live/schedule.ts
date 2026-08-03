/**
 * Fixed weekly LIVE schedule on nevermind.co.il (Israel time).
 * Tuesday 20:00, Thursday 20:00, Saturday night (מוצאי שבת) 22:00.
 */

export const LIVE_TIMEZONE = "Asia/Jerusalem";
export const LIVE_PAGE_URL = "https://nevermind.co.il/live";
export const LIVE_CALENDAR_PATH = "/api/live/calendar";

/** Session length used for calendar blocks (minutes). */
export const LIVE_DURATION_MINUTES = 90;

export type LiveScheduleSlot = {
  id: "tue" | "thu" | "sat";
  /** JS getDay(): 0=Sun … 6=Sat */
  weekday: 2 | 4 | 6;
  hour: number;
  minute: number;
  /** ICS RRULE BYDAY token */
  byDay: "TU" | "TH" | "SA";
  label: string;
  timeLabel: string;
};

export const LIVE_SCHEDULE_SLOTS: readonly LiveScheduleSlot[] = [
  {
    id: "tue",
    weekday: 2,
    hour: 20,
    minute: 0,
    byDay: "TU",
    label: "שלישי",
    timeLabel: "20:00",
  },
  {
    id: "thu",
    weekday: 4,
    hour: 20,
    minute: 0,
    byDay: "TH",
    label: "חמישי",
    timeLabel: "20:00",
  },
  {
    id: "sat",
    weekday: 6,
    hour: 22,
    minute: 0,
    byDay: "SA",
    label: "מוצאי שבת",
    timeLabel: "22:00",
  },
] as const;

export const LIVE_TOPIC_WHATSAPP_TEXT =
  "היי יקיר. יש לי נושא או שאלה ללייב הבא באתר:\n\n";

type JerusalemParts = {
  year: number;
  month: number;
  day: number;
  /** 0=Sun … 6=Sat */
  weekday: number;
  hour: number;
  minute: number;
};

function jerusalemParts(date: Date): JerusalemParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LIVE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/**
 * Convert a Jerusalem wall-clock local datetime to a UTC Date.
 * Uses iterative offset resolution (handles DST).
 */
export function jerusalemLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  for (let i = 0; i < 3; i += 1) {
    const jp = jerusalemParts(guess);
    const asUtcMs = Date.UTC(
      jp.year,
      jp.month - 1,
      jp.day,
      jp.hour,
      jp.minute,
      0,
    );
    const wantMs = Date.UTC(year, month - 1, day, hour, minute, 0);
    guess = new Date(guess.getTime() + (wantMs - asUtcMs));
  }

  return guess;
}

function addDaysYmd(
  year: number,
  month: number,
  day: number,
  add: number,
): { year: number; month: number; day: number } {
  const utc = new Date(Date.UTC(year, month - 1, day + add));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/** Next start (UTC Date) for a slot at or after `from`. */
export function nextOccurrenceForSlot(
  slot: LiveScheduleSlot,
  from: Date = new Date(),
): Date {
  const now = jerusalemParts(from);

  for (let add = 0; add <= 14; add += 1) {
    const ymd = addDaysYmd(now.year, now.month, now.day, add);
    const noon = jerusalemLocalToUtc(ymd.year, ymd.month, ymd.day, 12, 0);
    if (jerusalemParts(noon).weekday !== slot.weekday) continue;

    const start = jerusalemLocalToUtc(
      ymd.year,
      ymd.month,
      ymd.day,
      slot.hour,
      slot.minute,
    );
    if (start.getTime() >= from.getTime()) return start;
  }

  const ymd = addDaysYmd(now.year, now.month, now.day, 7);
  return jerusalemLocalToUtc(
    ymd.year,
    ymd.month,
    ymd.day,
    slot.hour,
    slot.minute,
  );
}

export function formatLiveSlotLine(slot: LiveScheduleSlot): string {
  return `${slot.label} · ${slot.timeLabel}`;
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function formatIcsLocal(date: Date): string {
  const p = jerusalemParts(date);
  const y = String(p.year);
  const m = String(p.month).padStart(2, "0");
  const d = String(p.day).padStart(2, "0");
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}00`;
}

/** Full .ics calendar with weekly RRULEs for all LIVE slots. */
export function buildLiveCalendarIcs(from: Date = new Date()): string {
  const stamp = formatIcsUtc(new Date());
  const description = icsEscape(
    "שידור חי באתר NeverMinde (השם לא משנה). הכניסה רק דרך nevermind.co.il/live אחרי הרשמה.",
  );

  const events = LIVE_SCHEDULE_SLOTS.map((slot) => {
    const start = nextOccurrenceForSlot(slot, from);
    const uid = `live-${slot.id}@nevermind.co.il`;
    const summary = icsEscape(`שידור חי · ${slot.label} · NeverMinde`);

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${LIVE_TIMEZONE}:${formatIcsLocal(start)}`,
      `DURATION:PT${LIVE_DURATION_MINUTES}M`,
      `RRULE:FREQ=WEEKLY;BYDAY=${slot.byDay}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `URL:${LIVE_PAGE_URL}`,
      `LOCATION:${LIVE_PAGE_URL}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NeverMinde//LIVE//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:שידור חי · NeverMinde",
    `X-WR-TIMEZONE:${LIVE_TIMEZONE}`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
