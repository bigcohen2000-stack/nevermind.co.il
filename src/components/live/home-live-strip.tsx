import Link from "next/link";
import { Radio } from "lucide-react";

import { LiveExplorePanel } from "@/components/live/live-explore-panel";
import type { LivePublicStatus } from "@/lib/live/status";

type HomeLiveStripProps = {
  status: LivePublicStatus;
};

function LiveRecBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      aria-label={active ? "שידור חי פעיל" : "שידור חי"}
    >
      <span
        className={
          active
            ? "relative inline-flex size-2.5 shrink-0"
            : "inline-flex size-2.5 shrink-0"
        }
        aria-hidden="true"
      >
        {active ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-action/70" />
        ) : null}
        <span
          className={
            active
              ? "relative inline-flex size-2.5 rounded-full bg-action"
              : "inline-flex size-2.5 rounded-full bg-action/40"
          }
        />
      </span>
      <span
        className={
          active
            ? "text-[0.7rem] font-semibold tracking-[0.14em] text-action"
            : "text-[0.7rem] font-semibold tracking-[0.14em] text-foreground/45"
        }
      >
        REC
      </span>
    </span>
  );
}

/**
 * Homepage LIVE band: podcast stream status + explore panel.
 * Never includes the YouTube URL.
 */
export function HomeLiveStrip({ status }: HomeLiveStripProps) {
  return (
    <aside
      aria-label="שידור חי ממפגשי הפודקאסט"
      className="border-b border-foreground/10 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {status.isLive ? (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5">
            <LiveRecBadge active />
            <div className="min-w-0">
              <p className="text-sm font-medium sm:text-base">
                שידור חי ממפגש הפודקאסט. עכשיו.
              </p>
              {status.topic ? (
                <p className="mt-1 text-sm text-foreground/65">{status.topic}</p>
              ) : null}
            </div>
            <Link href="/live" className="btn btn-primary text-sm">
              <Radio className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
              לכניסה לשידור
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <LiveRecBadge active={false} />
            <p className="text-sm font-medium tracking-tight sm:text-base">
              LIVE ממפגשי הפודקאסט
            </p>
            <p className="max-w-md text-sm leading-relaxed text-foreground/60">
              צופים בשידור מהמפגשים שלנו באתר, או מזמינים כיסא באולפן במודיעין.
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-foreground/10 pt-8">
          <LiveExplorePanel density="home" />
        </div>
      </div>
    </aside>
  );
}
