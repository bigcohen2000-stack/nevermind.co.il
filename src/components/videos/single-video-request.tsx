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
      <div className="mt-8 border border-foreground/15 bg-paper px-5 py-5 text-start">
        <p className="text-sm font-medium text-foreground">
          <span aria-hidden="true">🔒 </span>
          בקשת צפייה בסרטון הזה ספציפית: {SINGLE_VIDEO_PRICE}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          <span aria-hidden="true">💬 </span>
          כותבים בוואטסאפ איזה סרטון רוצים. אחרי סליקה והתכתבות שולחים קישור
          צפייה.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <span aria-hidden="true">✨ </span>
          אם תפרטו למה הסרטון מעניין אתכם ומה אתם רוצים לחקור, אוכל להציע
          הוזלה. זה מראה נכונות אמיתית.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm"
            onClick={onRequestClick}
          >
            בקשת הסרטון הזה ב־{SINGLE_VIDEO_PRICE}
          </a>
          <SmsContactButton
            message={smsText}
            label="SMS רגיל"
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
        <span aria-hidden="true">🔒 </span>
        בקש צפייה בסרטון הזה ספציפי:{" "}
        <span className="font-semibold">{SINGLE_VIDEO_PRICE}</span>
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted">
        <span aria-hidden="true">✨ </span>
        פירוט למה זה מעניין יכול להוריד מחיר
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center bg-action px-2.5 text-xs font-medium text-background no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          onClick={onRequestClick}
        >
          <span aria-hidden="true">💬 </span>
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
