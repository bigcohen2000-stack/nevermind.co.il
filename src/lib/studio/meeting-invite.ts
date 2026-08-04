/**
 * Meeting invite helpers: ICS download + print-to-PDF HTML (no PDF library).
 */

import type { MeetingInviteInput } from "@/lib/studio/whatsapp-templates";
import { formatMeetingWhen } from "@/lib/studio/whatsapp-templates";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** UTC stamp for ICS (YYYYMMDDTHHMMSSZ). */
function toIcsUtc(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildMeetingIcs(input: MeetingInviteInput): string {
  const start = new Date(input.startsAt);
  const end = new Date(
    start.getTime() + Math.max(15, input.durationMinutes) * 60_000,
  );
  const uid = `meeting-${start.getTime()}@nevermind.co.il`;
  const summary = `NeverMinde: ${input.track}`;
  const descriptionParts = [
    `עם: ${input.name}`,
    `מחיר: ${input.priceBeforeVat} לפני מע"מ`,
  ];
  if (input.locationNote?.trim()) {
    descriptionParts.push(`מיקום: ${input.locationNote.trim()}`);
  }
  if (input.notes?.trim()) {
    descriptionParts.push(`הערה: ${input.notes.trim()}`);
  }
  descriptionParts.push("nevermind.co.il");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NeverMinde//Studio//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadMeetingIcs(input: MeetingInviteInput): void {
  const blob = new Blob([buildMeetingIcs(input)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neverminde-meeting-${input.startsAt.slice(0, 10)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Opens a print window. User chooses "Save as PDF" in the print dialog. */
export function openMeetingInvitePrint(input: MeetingInviteInput): void {
  const when = input.startsAt ? formatMeetingWhen(input.startsAt) : "-";
  const safe = (v: string) =>
    v
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>הזמנה - ${safe(input.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fafaf8; margin: 0; padding: 2rem; }
    .card { max-width: 36rem; margin: 0 auto; border: 1px solid #d4d4d8; background: #fff; padding: 2rem; }
    h1 { font-size: 1.35rem; margin: 0 0 0.25rem; }
    .muted { color: #71717a; font-size: 0.85rem; }
    dl { margin: 1.5rem 0 0; }
    dt { font-size: 0.75rem; color: #71717a; margin-top: 0.85rem; }
    dd { margin: 0.2rem 0 0; font-size: 1rem; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 1rem; }
    @media print { body { background: #fff; padding: 0; } .card { border: none; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print muted" style="text-align:center;margin-bottom:1rem">
    הדפסה או שמירה כ-PDF: Ctrl+P / Cmd+P
  </p>
  <div class="card">
    <p class="muted">NeverMinde. השם לא משנה</p>
    <h1>הזמנה לשיריון פגישה</h1>
    <dl>
      <dt>שם</dt><dd>${safe(input.name)}</dd>
      ${input.phone ? `<dt>טלפון</dt><dd dir="ltr">${safe(input.phone)}</dd>` : ""}
      ${input.email ? `<dt>אימייל</dt><dd dir="ltr">${safe(input.email)}</dd>` : ""}
      <dt>מסלול</dt><dd>${safe(input.track)}</dd>
      <dt>תאריך ושעה</dt><dd>${safe(when)}</dd>
      <dt>משך</dt><dd>כ-${input.durationMinutes} דקות</dd>
      <dt>מחיר (לפני מע"מ)</dt><dd>${safe(input.priceBeforeVat)}</dd>
      ${input.locationNote ? `<dt>מיקום / אופן</dt><dd>${safe(input.locationNote)}</dd>` : ""}
      ${input.paymentDetails ? `<dt>פרטי תשלום לשיריון</dt><dd>${safe(input.paymentDetails)}</dd>` : ""}
      ${input.notes ? `<dt>הערות</dt><dd>${safe(input.notes)}</dd>` : ""}
    </dl>
    <div class="footer">
      המחיר לפני מע"מ. מע"מ יתווסף בחשבונית כחוק.<br />
      אין סליקה אוטומטית באתר. שיריון אחרי אישור תשלום.<br />
      nevermind.co.il
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
