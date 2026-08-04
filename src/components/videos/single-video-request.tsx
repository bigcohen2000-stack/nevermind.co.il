"use client";

import { SmsContactButton } from "@/components/contact/sms-contact-button";
import { logSingleVideoLead } from "@/actions/single-video-leads";
import {
  buildSingleVideoSmsHref,
  buildSingleVideoWhatsAppHref,
  buildSingleVideoWhatsAppText,
  SINGLE_VIDEO_PRICE,
} from "@/lib/videos/single-access";

type SingleVideoRequestCtaProps = {
  title: string;
  videoId: string;
  /** Compact strip above a card vs fuller block on the lock page. */
  variant?: "card" | "lock";
};

function fireLogLead(videoId: string, videoTitle: string) {
  void logSingleVideoLead({ videoId, videoTitle }).catch(() => {
    // Fire-and-forget: WhatsApp still opens if logging fails.
  });
}

/**
 * Per-video paid unlock CTA. Prefills WhatsApp with title + internal id.
 * Logs a Studio lead before opening WhatsApp (best effort).
 */
export function SingleVideoRequestCta({
  title,
  videoId,
  variant = "card",
}: SingleVideoRequestCtaProps) {
  const input = { title, videoId };
  const href = buildSingleVideoWhatsAppHref(input);
  const smsText = buildSingleVideoWhatsAppText(input);

  const onRequestClick = () => {
    fireLogLead(videoId, title);
  };

  if (variant === "lock") {
    return (
      <div className="border border-foreground/15 bg-paper px-5 py-5 text-start">
        <p className="text-sm font-medium text-foreground">
          בקשת צפייה בסרטון הזה: {SINGLE_VIDEO_PRICE}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          שולחים בוואטסאפ. אחרי סליקה והתכתבות מקבלים קישור צפייה.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          אם תפרטו למה הסרטון מעניין ומה רוצים לחקור, אפשר לבדוק הוזלה.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm"
            onClick={onRequestClick}
          >
            בקשה בוואטסאפ: {SINGLE_VIDEO_PRICE}
          </a>
          <SmsContactButton
            message={smsText}
            label="SMS"
            className="btn btn-secondary text-sm"
            onBeforeOpen={onRequestClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-b-0 border-foreground/15 bg-paper px-3 py-2.5">
      <p className="text-xs leading-snug text-foreground/85">
        בקשת צפייה בסרטון הזה:{" "}
        <span className="font-semibold">{SINGLE_VIDEO_PRICE}</span>
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted">
        פירוט קצר למה זה מעניין יכול להוריד מחיר
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center bg-action px-2.5 text-xs font-medium text-background no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          onClick={onRequestClick}
        >
          בקשה בוואטסאפ
        </a>
        <a
          href={buildSingleVideoSmsHref(input)}
          className="inline-flex min-h-9 items-center border border-foreground/20 px-2.5 text-xs font-medium text-foreground no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          onClick={onRequestClick}
        >
          SMS
        </a>
      </div>
    </div>
  );
}
