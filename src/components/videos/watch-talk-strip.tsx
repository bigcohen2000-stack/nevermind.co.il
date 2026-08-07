"use client";

import { buildWhatsAppHref } from "@/lib/whatsapp";

import { useWatchConversion } from "@/components/videos/watch-conversion-provider";

type WatchTalkStripProps = {
  topic: string;
};

/**
 * Always-visible talk CTA under the player.
 * Opens the contextual booking modal. WhatsApp remains a secondary path.
 */
export function WatchTalkStrip({ topic }: WatchTalkStripProps) {
  const { openBooking, videoTitle } = useWatchConversion();
  const titleId = "watch-talk-strip-title";
  const shortTopic = topic.trim() || videoTitle;
  const waMessage = [
    "היי יקיר, הגעתי מדף צפייה באתר.",
    `נושא: ${videoTitle}`,
    "אשמח לתאם שיחה.",
  ].join("\n");

  return (
    <aside
      id="talk"
      aria-labelledby={titleId}
      className="scroll-mt-24 border border-action/35 bg-paper px-4 py-4 sm:px-5 sm:py-5"
    >
      <p
        id={titleId}
        className="text-base font-semibold tracking-tight text-foreground sm:text-lg"
        data-ai-hint="key-claim"
      >
        אפשר לפרק את המנגנון הזה בשיחה קצרה.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        זה לא טיפול. זה פירוק לוגי של{" "}
        <span className="font-medium text-foreground/80">{shortTopic}</span>.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openBooking}
          className="btn btn-primary text-sm"
        >
          לתיאום שיחה
        </button>
        <a
          href={buildWhatsAppHref(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary text-sm"
        >
          וואטסאפ
        </a>
      </div>
    </aside>
  );
}
