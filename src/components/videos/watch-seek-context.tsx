"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { WatchPlayerHandle } from "@/components/videos/watch-player";
import { formatTimestampParam } from "@/lib/videos/timestamp";

type WatchSeekContextValue = {
  registerPlayer: (handle: WatchPlayerHandle | null) => void;
  seekTo: (seconds: number) => void;
};

const WatchSeekContext = createContext<WatchSeekContextValue | null>(null);

export function WatchSeekProvider({ children }: { children: ReactNode }) {
  const handleRef = useRef<WatchPlayerHandle | null>(null);

  const registerPlayer = useCallback((handle: WatchPlayerHandle | null) => {
    handleRef.current = handle;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const t = Math.max(0, Math.floor(seconds));
    handleRef.current?.seekTo(t);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("t", formatTimestampParam(t));
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const value = useMemo(
    () => ({ registerPlayer, seekTo }),
    [registerPlayer, seekTo],
  );

  return (
    <WatchSeekContext.Provider value={value}>
      {children}
    </WatchSeekContext.Provider>
  );
}

export function useWatchSeek() {
  return useContext(WatchSeekContext);
}
