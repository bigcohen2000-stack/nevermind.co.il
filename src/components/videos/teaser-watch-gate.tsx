"use client";

import { useState, type ReactNode } from "react";

import { GatedLock } from "@/components/videos/gated-lock";
import { WatchPlayer } from "@/components/videos/watch-player";

/** Safety cap if a teaser upload is longer than intended. */
export const CLUB_TEASER_SECONDS = 120;

type TeaserWatchGateProps = {
  /** Dedicated public teaser clip id only. Never the full archive id. */
  teaserYoutubeId: string;
  title: string;
  thumbnailUrl?: string | null;
  /** Opaque thumb for lock overlay (never raw YouTube in lock chrome). */
  lockThumbSrc?: string | null;
  videoId: string;
  returnPath?: string;
  /** RSC banner from the watch page Server Component. */
  gateBanner?: ReactNode;
};

/**
 * Non-members: play the dedicated short teaser clip, then the club gate.
 * The full archive YouTube id must never reach this component.
 */
export function TeaserWatchGate({
  teaserYoutubeId,
  title,
  thumbnailUrl,
  lockThumbSrc,
  videoId,
  returnPath,
  gateBanner,
}: TeaserWatchGateProps) {
  const [gated, setGated] = useState(false);

  if (gated) {
    return (
      <div className="w-full">
        <p className="mb-3 text-sm text-foreground/80">
          הטעימה הסתיימה. להמשך החקירה צריך גישת מועדון. אפשר לבדוק איתי
          התאמה בוואטסאפ ולבחור משך גישה.
        </p>
        <GatedLock
          title={title}
          thumbSrc={lockThumbSrc}
          videoId={videoId}
          returnPath={returnPath}
          hasTeaser
          gateBanner={gateBanner}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-sm text-muted">
        טעימה: קליפ קצר נפרד. אחריו הסרטון נעצר. קודם בוחרים משך מנוי, ואז
        עוברים לוואטסאפ.
      </p>
      <WatchPlayer
        youtubeId={teaserYoutubeId}
        title={title}
        thumbnailUrl={thumbnailUrl}
        previewEndSeconds={CLUB_TEASER_SECONDS}
        onPreviewEnd={() => setGated(true)}
        onEnded={() => setGated(true)}
      />
    </div>
  );
}
