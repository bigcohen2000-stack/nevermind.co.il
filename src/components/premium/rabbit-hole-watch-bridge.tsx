"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import {
  getGatedBonusVideos,
  type GatedBonusVideo,
} from "@/actions/premium";
import { DeepRabbitHole } from "@/components/premium/deep-rabbit-hole";
import { FocusAwareWatchPlayer } from "@/components/videos/focus-aware-watch-player";
import type { UpNextVideo } from "@/components/videos/up-next-overlay";
import {
  FREE_WATCH_THRESHOLD,
  hasReachedFreeWatchLimit,
  recordLocalWatchedVideo,
  wasAccessGateDismissedRecently,
} from "@/lib/premium/watch-count-local";

type Props = {
  youtubeId: string;
  videoUuid: string;
  conceptIds: string[];
  startSeconds?: number;
  title?: string;
  thumbnailUrl?: string | null;
  isAuthenticated?: boolean;
  isPremium: boolean;
  nextUp?: UpNextVideo | null;
};

/**
 * Watch-page bridge for *unlocked* videos only.
 * Mount exclusively from the server watch page after entitlement check.
 * Closing Deep Rabbit Hole (X / Escape / overlay) only dismisses marketing.
 * It must never sit on top of a members-only player as the sole gate.
 */
export function RabbitHoleWatchBridge({
  youtubeId,
  videoUuid,
  conceptIds,
  startSeconds,
  title,
  thumbnailUrl,
  isAuthenticated,
  isPremium,
  nextUp,
}: Props) {
  const [freeOpen, setFreeOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [bonusVideos, setBonusVideos] = useState<GatedBonusVideo[]>([]);
  const [, startTransition] = useTransition();

  const maybeOpenFree = useCallback(() => {
    if (isPremium) return;
    if (wasAccessGateDismissedRecently()) return;
    if (hasReachedFreeWatchLimit(FREE_WATCH_THRESHOLD)) {
      setFreeOpen(true);
    }
  }, [isPremium]);

  useEffect(() => {
    const count = recordLocalWatchedVideo(youtubeId);
    if (!isPremium && count >= FREE_WATCH_THRESHOLD) {
      // Soft delay so the player mounts first.
      const t = window.setTimeout(() => maybeOpenFree(), 1200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [youtubeId, isPremium, maybeOpenFree]);

  const onEnded = useCallback(() => {
    if (!isPremium) {
      recordLocalWatchedVideo(youtubeId);
      maybeOpenFree();
      return;
    }

    startTransition(async () => {
      const videos = await getGatedBonusVideos(videoUuid, conceptIds, 2);
      if (videos.length === 0) return;
      setBonusVideos(videos);
      setPremiumOpen(true);
    });
  }, [isPremium, youtubeId, videoUuid, conceptIds, maybeOpenFree]);

  return (
    <>
      <FocusAwareWatchPlayer
        youtubeId={youtubeId}
        startSeconds={startSeconds}
        title={title}
        thumbnailUrl={thumbnailUrl}
        isAuthenticated={isAuthenticated}
        nextUp={nextUp}
        onEnded={onEnded}
      />

      {!isPremium ? (
        <DeepRabbitHole
          mode="free"
          open={freeOpen}
          onOpenChange={setFreeOpen}
        />
      ) : (
        <DeepRabbitHole
          mode="premium"
          open={premiumOpen}
          onOpenChange={setPremiumOpen}
          videos={bonusVideos}
        />
      )}
    </>
  );
}
