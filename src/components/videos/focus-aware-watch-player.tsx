"use client";

import { WatchPlayerWithShare } from "@/components/videos/watch-player-with-share";
import { useFocusMode } from "@/components/videos/focus-mode-context";
import type { UpNextVideo } from "@/components/videos/up-next-overlay";

type Props = {
  youtubeId: string;
  startSeconds?: number;
  title?: string;
  thumbnailUrl?: string | null;
  isAuthenticated?: boolean;
  nextUp?: UpNextVideo | null;
  onEnded?: () => void;
};

export function FocusAwareWatchPlayer({ onEnded, ...props }: Props) {
  const { focusMode } = useFocusMode();
  return (
    <WatchPlayerWithShare
      {...props}
      hideToolbar={focusMode}
      onEnded={onEnded}
    />
  );
}
