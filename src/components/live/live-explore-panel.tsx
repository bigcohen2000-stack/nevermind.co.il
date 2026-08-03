import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarPlus,
  Clock3,
  Headphones,
  MapPin,
  MessageCircleQuestion,
  Mic,
  Radio,
  UserRound,
} from "lucide-react";

import {
  LIVE_MODIIN_SEAT,
  LIVE_OPEN_MIC,
} from "@/lib/content/offers";
import {
  LIVE_CALENDAR_PATH,
  LIVE_SCHEDULE_SLOTS,
  LIVE_TOPIC_WHATSAPP_TEXT,
} from "@/lib/live/schedule";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type LiveExplorePanelProps = {
  /** Compact on homepage strip. Full on /live. */
  density?: "home" | "page";
  className?: string;
};

function SectionHeading({
  id,
  icon: Icon,
  children,
}: {
  id: string;
  icon: LucideIcon;
  children: string;
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted"
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
      {children}
    </h2>
  );
}

/**
 * Shared LIVE explainer: podcast stream, schedule, topic CTA, Modiin seat, open mic.
 */
export function LiveExplorePanel({
  density = "home",
  className,
}: LiveExplorePanelProps) {
  const topicHref = buildWhatsAppHref(LIVE_TOPIC_WHATSAPP_TEXT);
  const openMicHref = buildWhatsAppHref(LIVE_OPEN_MIC.whatsappText);
  const modiinHref = buildWhatsAppHref(LIVE_MODIIN_SEAT.whatsappText);
  const isPage = density === "page";

  return (
    <div className={cn("text-start", className)}>
      <div
        className={cn(
          "border border-foreground/12 bg-paper/40 p-5 sm:p-6",
          isPage && "bg-transparent",
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center border border-foreground/15 text-action"
            aria-hidden="true"
          >
            <Headphones className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight sm:text-base">
              שידור חי ממפגשי הפודקאסט
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              רואים מהמפגשים שלנו בזמן אמת, מתוך האתר בלבד. אפשר לצפות אונליין
              אחרי הרשמה, או להזמין כיסא באולפן במודיעין.
            </p>
          </div>
        </div>

        <nav
          aria-label="ניווט שידור חי"
          className="mt-5 flex flex-wrap gap-2"
        >
          {isPage ? (
            <a href="#live-now" className="btn btn-primary text-sm">
              <Radio
                className="size-3.5"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              לשידור או ללוח
            </a>
          ) : (
            <Link href="/live" className="btn btn-primary text-sm">
              <Radio
                className="size-3.5"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              לצפייה בלייב
            </Link>
          )}
          <a
            href={modiinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            <MapPin className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
            הזמנת כיסא במודיעין
          </a>
          <Link href="/members" className="btn btn-secondary text-sm">
            <UserRound
              className="size-3.5"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            למסגרת חודשית
          </Link>
        </nav>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <section
          aria-labelledby="live-schedule-title"
          className="border border-foreground/10 p-4 sm:p-5"
        >
          <SectionHeading id="live-schedule-title" icon={Clock3}>
            מתי
          </SectionHeading>
          <ul className="mt-4 divide-y divide-foreground/10">
            {LIVE_SCHEDULE_SLOTS.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground/90">
                  {slot.label}
                </span>
                <span className="tabular-nums text-foreground/65">
                  {slot.timeLabel}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={LIVE_CALENDAR_PATH}
            className="btn btn-secondary mt-4 inline-flex w-full text-sm sm:w-auto"
            download="nevermind-live.ics"
          >
            <CalendarPlus
              className="size-3.5"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            הוספה ליומן
          </a>
          <p className="mt-2 text-xs leading-relaxed text-foreground/50">
            תזכורת לטלפון או ליומן. שעון ישראל.
          </p>
        </section>

        <section
          aria-labelledby="live-topic-title"
          className="border border-foreground/10 p-4 sm:p-5"
        >
          <SectionHeading id="live-topic-title" icon={MessageCircleQuestion}>
            ללייב הבא
          </SectionHeading>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            מה הנושא שמעניין אתכם, או השאלה שתרצו שתהיה בלייב הבא של הפודקאסט?
          </p>
          <a
            href={topicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4 inline-flex w-full text-sm sm:w-auto"
          >
            <MessageCircleQuestion
              className="size-3.5"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            שליחת נושא או שאלה
          </a>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="live-modiin-title"
          className="border border-foreground/12 p-4 sm:p-5"
        >
          <SectionHeading id="live-modiin-title" icon={MapPin}>
            באולפן
          </SectionHeading>
          <h3 className="mt-3 text-base font-semibold tracking-tight">
            {LIVE_MODIIN_SEAT.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            {LIVE_MODIIN_SEAT.body}
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            {LIVE_MODIIN_SEAT.priceBeforeVat} לפני מע&quot;מ.
          </p>
          <a
            href={modiinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4 inline-flex w-full text-sm"
          >
            <MapPin className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
            {LIVE_MODIIN_SEAT.ctaLabel}
          </a>
        </section>

        <section
          aria-labelledby="live-open-mic-title"
          className="border border-foreground/12 p-4 sm:p-5"
        >
          <SectionHeading id="live-open-mic-title" icon={Mic}>
            מיקרופון
          </SectionHeading>
          <h3 className="mt-3 text-base font-semibold tracking-tight">
            {LIVE_OPEN_MIC.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            {LIVE_OPEN_MIC.body}
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            {LIVE_OPEN_MIC.priceBeforeVat} לפני מע&quot;מ. חובה הרשמה באתר.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={openMicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex w-full text-sm"
            >
              <Mic className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
              {LIVE_OPEN_MIC.ctaLabel}
            </a>
            {isPage ? (
              <a
                href="#live-auth"
                className="btn btn-secondary inline-flex w-full text-sm"
              >
                <UserRound
                  className="size-3.5"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                להרשמה לשידור
              </a>
            ) : (
              <Link
                href="/live"
                className="btn btn-secondary inline-flex w-full text-sm"
              >
                <UserRound
                  className="size-3.5"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                להרשמה לשידור
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
