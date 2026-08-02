"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";

import { saveVideoProgress } from "@/actions/video-progress";
import { recordWatchStart } from "@/actions/watch-history";
import {
  getLocalVideoProgress,
  saveLocalVideoProgress,
} from "@/lib/videos/progress-local";
import { cn } from "@/lib/utils";

export type WatchPlayerHandle = {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
};

type WatchPlayerProps = {
  youtubeId: string;
  startSeconds?: number;
  title?: string;
  thumbnailUrl?: string | null;
  /** When true, also persist progress to Supabase for the signed-in user. */
  isAuthenticated?: boolean;
  /** Fires when the YouTube player reaches the ENDED state. */
  onEnded?: () => void;
  /**
   * Club teaser: pause and fire onPreviewEnd when playback reaches this second.
   * Default unset = full video.
   */
  previewEndSeconds?: number;
  onPreviewEnd?: () => void;
};

type YtPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  pauseVideo: () => void;
};

type YtNamespace = {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YtPlayer }) => void;
        onStateChange?: (event: { data: number; target: YtPlayer }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SAVE_EVERY_MS = 10_000;
let ytApiPromise: Promise<void> | null = null;

function loadYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector("script[data-nm-youtube-api]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.nmYoutubeApi = "1";
      document.body.appendChild(script);
    }
    if (window.YT?.Player) resolve();
  });

  return ytApiPromise;
}

/**
 * YouTube IFrame API player with throttled progress persistence
 * (localStorage always, Supabase when authenticated).
 */
export const WatchPlayer = forwardRef<WatchPlayerHandle, WatchPlayerProps>(
  function WatchPlayer(
    {
      youtubeId,
      startSeconds = 0,
      title = "נגן YouTube",
      thumbnailUrl = null,
      isAuthenticated = false,
      onEnded,
      previewEndSeconds,
      onPreviewEnd,
    },
    ref,
  ) {
    const reactId = useId().replace(/:/g, "");
    const elementId = `nm-yt-${reactId}`;
    const playerRef = useRef<YtPlayer | null>(null);
    const lastSavedAtRef = useRef(0);
    const historyRecordedRef = useRef(false);
    const previewFiredRef = useRef(false);
    const onEndedRef = useRef(onEnded);
    onEndedRef.current = onEnded;
    const onPreviewEndRef = useRef(onPreviewEnd);
    onPreviewEndRef.current = onPreviewEnd;
    const previewEndRef = useRef(previewEndSeconds);
    previewEndRef.current = previewEndSeconds;
    const metaRef = useRef({ title, thumbnailUrl, isAuthenticated });
    metaRef.current = { title, thumbnailUrl, isAuthenticated };

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => {
        try {
          return playerRef.current?.getCurrentTime() ?? 0;
        } catch {
          return 0;
        }
      },
      seekTo: (seconds: number) => {
        try {
          playerRef.current?.seekTo(Math.max(0, seconds), true);
        } catch {
          /* player not ready */
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      let pollId: number | undefined;
      historyRecordedRef.current = false;
      previewFiredRef.current = false;

      const firePreviewEnd = (player: YtPlayer) => {
        if (previewFiredRef.current) return;
        const limit = previewEndRef.current;
        if (limit == null || limit <= 0) return;
        let current = 0;
        try {
          current = player.getCurrentTime() || 0;
        } catch {
          return;
        }
        if (current < limit) return;
        previewFiredRef.current = true;
        try {
          player.pauseVideo();
          player.seekTo(limit, true);
        } catch {
          /* ignore */
        }
        onPreviewEndRef.current?.();
      };

      const persist = (force = false) => {
        const player = playerRef.current;
        if (!player) return;
        const now = Date.now();
        if (!force && now - lastSavedAtRef.current < SAVE_EVERY_MS) return;

        let current = 0;
        let duration: number | null = null;
        try {
          current = player.getCurrentTime() || 0;
          duration = player.getDuration() || null;
        } catch {
          return;
        }

        lastSavedAtRef.current = now;
        const meta = metaRef.current;

        saveLocalVideoProgress({
          youtubeId,
          progressSeconds: current,
          durationSeconds: duration,
          title: meta.title,
          thumbnailUrl: meta.thumbnailUrl,
        });

        if (meta.isAuthenticated) {
          void saveVideoProgress({
            youtubeId,
            progressSeconds: current,
            durationSeconds: duration,
          });
        }
      };

      const markWatchStart = () => {
        if (historyRecordedRef.current) return;
        if (!metaRef.current.isAuthenticated) return;
        historyRecordedRef.current = true;
        void recordWatchStart(youtubeId);
      };

      const mount = async () => {
        await loadYoutubeApi();
        if (cancelled || !window.YT?.Player) return;

        const urlStart = Math.max(0, Math.floor(startSeconds));
        const limit = previewEndRef.current;
        const cappedStart =
          limit != null && limit > 0
            ? Math.min(urlStart, Math.max(0, limit - 1))
            : urlStart;
        const local = getLocalVideoProgress(youtubeId);
        const resumeAt =
          cappedStart > 0
            ? cappedStart
            : local &&
                local.progressSeconds > 5 &&
                (limit == null || local.progressSeconds < limit)
              ? local.progressSeconds
              : 0;

        playerRef.current = new window.YT.Player(elementId, {
          videoId: youtubeId,
          width: "100%",
          height: "100%",
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            hl: "he",
            start: resumeAt > 0 ? Math.floor(resumeAt) : 0,
            ...(limit != null && limit > 0 ? { end: Math.floor(limit) } : {}),
          },
          events: {
            onReady: (event) => {
              if (resumeAt > 0) {
                event.target.seekTo(resumeAt, true);
              }
            },
            onStateChange: (event) => {
              const state = window.YT?.PlayerState;
              if (!state) return;
              if (event.data === state.PLAYING) {
                markWatchStart();
                firePreviewEnd(event.target);
              }
              if (event.data === state.PAUSED || event.data === state.ENDED) {
                persist(true);
                firePreviewEnd(event.target);
              }
              if (event.data === state.ENDED) {
                if (limit != null && limit > 0) {
                  // Short dedicated teaser clips end before the safety cap.
                  if (!previewFiredRef.current) {
                    previewFiredRef.current = true;
                    onPreviewEndRef.current?.();
                  }
                } else {
                  onEndedRef.current?.();
                }
              }
            },
          },
        });

        pollId = window.setInterval(() => {
          const player = playerRef.current;
          const playing = window.YT?.PlayerState?.PLAYING;
          if (!player || playing == null) return;
          try {
            if (player.getPlayerState() === playing) {
              persist(false);
              firePreviewEnd(player);
            }
          } catch {
            /* player may be mid-destroy */
          }
        }, Math.min(SAVE_EVERY_MS, 1000));
      };

      void mount();

      return () => {
        cancelled = true;
        if (pollId) window.clearInterval(pollId);
        persist(true);
        try {
          playerRef.current?.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      };
    }, [elementId, startSeconds, youtubeId, previewEndSeconds]);

    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-ink",
          "border border-foreground/15 [[data-focus-mode=true]_&]:border-transparent",
        )}
      >
        <div
          id={elementId}
          className="absolute inset-0 h-full w-full"
          title={title}
        />
      </div>
    );
  },
);
