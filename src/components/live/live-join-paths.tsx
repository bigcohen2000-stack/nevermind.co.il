import Link from "next/link";
import {
  CalendarPlus,
  Clock3,
  Headphones,
  MapPin,
  Mic,
  UserRound,
} from "lucide-react";

import {
  LIVE_MODIIN_SEAT,
  LIVE_OPEN_MIC,
} from "@/lib/content/offers";
import {
  LIVE_CALENDAR_PATH,
  LIVE_SCHEDULE_SLOTS,
} from "@/lib/live/schedule";
import { buildWhatsAppHref } from "@/lib/whatsapp";

/**
 * Conversion block: personal studio seat vs group open-mic podcast live.
 */
export function LiveJoinPaths() {
  const openMicHref = buildWhatsAppHref(LIVE_OPEN_MIC.whatsappText);
  const modiinHref = buildWhatsAppHref(LIVE_MODIIN_SEAT.whatsappText);

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
        שני מסלולים להצטרף למפגש הפודקאסט. אישי באולפן, או קבוצתי עם מיקרופון.
        נדרשת שיחת התאמה. אין סליקה באתר.
      </p>

      <ul className="grid gap-4 lg:grid-cols-2">
        <li className="border border-action/35 bg-background p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-action">
            <MapPin className="size-3.5" aria-hidden />
            אישי
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            {LIVE_MODIIN_SEAT.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            {LIVE_MODIIN_SEAT.body}
          </p>
          <p className="mt-2 text-sm text-muted">
            {LIVE_MODIIN_SEAT.priceBeforeVat} לפני מע&quot;מ.
          </p>
          <a
            href={modiinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-5 inline-flex w-full text-sm"
          >
            <MapPin className="size-3.5" aria-hidden />
            {LIVE_MODIIN_SEAT.ctaLabel}
          </a>
        </li>

        <li className="border border-foreground/15 bg-background p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-action">
            <Mic className="size-3.5" aria-hidden />
            קבוצתי
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            {LIVE_OPEN_MIC.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            {LIVE_OPEN_MIC.body}
          </p>
          <p className="mt-2 text-sm text-muted">
            {LIVE_OPEN_MIC.priceBeforeVat} לפני מע&quot;מ. חובה הרשמה באתר.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a
              href={openMicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex w-full text-sm"
            >
              <Mic className="size-3.5" aria-hidden />
              {LIVE_OPEN_MIC.ctaLabel}
            </a>
            <Link href="/members" className="btn btn-secondary inline-flex w-full text-sm">
              <UserRound className="size-3.5" aria-hidden />
              קודם כניסה למועדון
            </Link>
          </div>
        </li>
      </ul>
    </div>
  );
}

/** Compact schedule list for accordion. */
export function LiveScheduleBlock() {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-foreground/80">
        <Clock3 className="size-4 text-action" aria-hidden />
        לוח קבוע. שעון ישראל.
      </p>
      <ul className="divide-y divide-foreground/10 border border-foreground/10">
        {LIVE_SCHEDULE_SLOTS.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <span className="font-medium">{slot.label}</span>
            <span className="tabular-nums text-foreground/65">
              {slot.timeLabel}
            </span>
          </li>
        ))}
      </ul>
      <a
        href={LIVE_CALENDAR_PATH}
        className="btn btn-secondary inline-flex text-sm"
        download="nevermind-live.ics"
      >
        <CalendarPlus className="size-3.5" aria-hidden />
        הוספה ליומן
      </a>
    </div>
  );
}

export function LiveWatchExplain() {
  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center border border-foreground/15 text-action"
        aria-hidden
      >
        <Headphones className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 space-y-2 text-sm leading-relaxed text-foreground/80">
        <p>
          צופים בשידור מהאתר בלבד. כשהלייב פעיל: הרשמה, אישור 18+, ואז קישור.
        </p>
        <p className="text-muted">
          הקלטות קודמות מהשידורים הלא רשומים נפתחות לחברי מועדון. לא מוצגות
          כאן לציבור.
        </p>
      </div>
    </div>
  );
}
