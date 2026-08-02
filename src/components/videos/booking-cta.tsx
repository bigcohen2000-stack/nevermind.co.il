"use client";

import { SmsContactButton } from "@/components/contact/sms-contact-button";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type BookingCtaProps = {
  /** Display label in the CTA copy (concept or title). */
  topic: string;
  /** Prefill for WhatsApp/SMS (usually the video title). */
  context?: string;
};

/**
 * Scheduling CTA under the watch player.
 * Phone-first: WhatsApp primary, SMS for kosher phones. No email form.
 */
export function BookingCta({ topic, context }: BookingCtaProps) {
  const titleId = "booking-cta-title";
  const bookingContext = (context ?? topic).trim();
  const message = [
    "היי יקיר, הגעתי מדף צפייה באתר.",
    `נושא: ${bookingContext}`,
    "אשמח לתאם שיחה.",
  ].join("\n");

  return (
    <aside
      className="border border-action/40 bg-paper p-6 sm:p-8"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="text-xs font-medium tracking-wide text-action">
        תיאום שיחה
      </p>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground sm:text-lg">
        אם תרצה לדבר יותר על רעיונות נוספים בנושא{" "}
        <span className="font-semibold">{topic}</span>, שלח הודעה בטלפון. וואטסאפ
        או SMS רגיל (גם לטלפון כשר).
      </p>
      <div className="mt-6 flex flex-wrap items-start gap-3">
        <a
          href={buildWhatsAppHref(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          וואטסאפ
        </a>
        <SmsContactButton message={message} />
      </div>
    </aside>
  );
}
