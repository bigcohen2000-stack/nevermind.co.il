"use client";

import { Link2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  UpNextOverlay,
  type UpNextVideo,
} from "@/components/videos/up-next-overlay";
import {
  WatchPlayer,
  type WatchPlayerHandle,
} from "@/components/videos/watch-player";
import { useWatchSeek } from "@/components/videos/watch-seek-context";
import { formatTimestampParam } from "@/lib/videos/timestamp";

type WatchPlayerWithShareProps = {
  youtubeId: string;
  startSeconds?: number;
  title?: string;
  thumbnailUrl?: string | null;
  isAuthenticated?: boolean;
  /** Next concept-related video for the Smart Up Next overlay. */
  nextUp?: UpNextVideo | null;
  /** Hide share / start-time chrome (e.g. Focus Mode). */
  hideToolbar?: boolean;
  /** Extra callback when the YouTube player reaches ENDED. */
  onEnded?: () => void;
};

export function WatchPlayerWithShare({
  youtubeId,
  startSeconds = 0,
  title,
  thumbnailUrl,
  isAuthenticated,
  nextUp = null,
  hideToolbar = false,
  onEnded,
}: WatchPlayerWithShareProps) {
  const playerRef = useRef<WatchPlayerHandle | null>(null);
  const seekCtx = useWatchSeek();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [endedForId, setEndedForId] = useState<string | null>(null);

  const setPlayerRef = useCallback(
    (handle: WatchPlayerHandle | null) => {
      playerRef.current = handle;
      seekCtx?.registerPlayer(handle);
    },
    [seekCtx],
  );

  useEffect(() => {
    return () => {
      seekCtx?.registerPlayer(null);
    };
  }, [seekCtx]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function onShare() {
    setBusy(true);
    try {
      const seconds = Math.max(
        0,
        Math.floor(playerRef.current?.getCurrentTime() ?? startSeconds ?? 0),
      );
      const t = formatTimestampParam(seconds);
      const url = new URL(`/watch/${youtubeId}`, window.location.origin);
      url.searchParams.set("t", t);

      await navigator.clipboard.writeText(url.toString());
      setToast("הקישור הועתק.");
    } catch {
      setToast("לא ניתן להעתיק את הקישור.");
    } finally {
      setBusy(false);
    }
  }

  const showUpNext = Boolean(nextUp) && endedForId === youtubeId;

  return (
    <div>
      <div className="relative">
        <WatchPlayer
          ref={setPlayerRef}
          youtubeId={youtubeId}
          startSeconds={startSeconds}
          title={title}
          thumbnailUrl={thumbnailUrl}
          isAuthenticated={isAuthenticated}
          onEnded={() => {
            if (nextUp) setEndedForId(youtubeId);
            onEnded?.();
          }}
        />
        {showUpNext && nextUp ? (
          <UpNextOverlay
            next={nextUp}
            onCancel={() => setEndedForId(null)}
          />
        ) : null}
      </div>

      {!hideToolbar ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onShare}
            disabled={busy}
            className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 text-sm text-foreground transition hover:border-action hover:text-action disabled:cursor-wait disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
            שיתוף מהזמן הנוכחי
          </button>
          {startSeconds > 0 ? (
            <p className="text-sm text-muted">
              מתחיל ב-
              {Math.floor(startSeconds / 60)}:
              {String(startSeconds % 60).padStart(2, "0")}
            </p>
          ) : null}
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 start-6 z-50 max-w-sm border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground shadow-[var(--shadow-soft)]"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
