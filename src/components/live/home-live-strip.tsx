import Link from "next/link";
import { CalendarDays, Radio } from "lucide-react";
import { Suspense } from "react";

import { LiveExplorePanel } from "@/components/live/live-explore-panel";
import { LiveRecBadge } from "@/components/live/live-rec-badge";
import { InfoTip } from "@/components/ui/info-tip";
import { getLivePublicStatus } from "@/lib/live/status";

function HomeLiveStripSkeleton() {
  return (
    <aside
      aria-busy="true"
      aria-label="טוען שידור חי"
      className="border-b border-foreground/10 bg-background"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto h-16 max-w-md animate-pulse bg-foreground/5" />
        <div className="mt-8 border-t border-foreground/10 pt-8">
          <div className="h-40 animate-pulse bg-foreground/5" />
        </div>
      </div>
    </aside>
  );
}

async function HomeLiveStripInner() {
  const status = await getLivePublicStatus();

  return (
    <aside
      aria-label="שידור חי ממפגשי הפודקאסט"
      className="border-b border-foreground/10 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {status.isLive ? (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5">
            <LiveRecBadge active tipTone="light" />
            <div className="min-w-0">
              <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium sm:text-base">
                <Radio
                  className="size-4 shrink-0 text-action"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                שידור חי ממפגש הפודקאסט. עכשיו.
              </p>
              {status.topic ? (
                <p className="mt-1 text-sm text-foreground/65">{status.topic}</p>
              ) : null}
            </div>
            <Link
              href="/live"
              className="btn btn-primary text-sm"
              aria-label="מעבר לכניסה לשידור החי"
            >
              <Radio className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
              לכניסה לשידור
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <LiveRecBadge active={false} tipTone="light" />
            <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium tracking-tight sm:text-base">
              <Radio
                className="size-4 shrink-0 text-action"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              LIVE ממפגשי הפודקאסט
              <InfoTip label="מה קורה בשידור חי">
                צופים מהאתר בזמן אמת, או מצטרפים באולפן במודיעין / עם מיקרופון
                בקבוצה. הקישור נחשף רק כשהשידור פעיל.
              </InfoTip>
            </p>
            <p className="max-w-md text-sm leading-relaxed text-foreground/60">
              צופים בשידור מהמפגשים שלנו באתר, או מזמינים כיסא באולפן במודיעין.
            </p>
            <Link
              href="/live"
              className="btn btn-secondary mt-2 text-sm"
              aria-label="מעבר לעמוד השידור החי והלוח"
            >
              <CalendarDays
                className="size-3.5"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              לוח והצטרפות
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-foreground/10 pt-8">
          <LiveExplorePanel density="home" />
        </div>
      </div>
    </aside>
  );
}

/**
 * Homepage LIVE band: streams independently so the hero can paint first.
 */
export function HomeLiveStrip() {
  return (
    <Suspense fallback={<HomeLiveStripSkeleton />}>
      <HomeLiveStripInner />
    </Suspense>
  );
}
