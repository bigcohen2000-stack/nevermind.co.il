"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ContextualBookingModal } from "@/components/booking/contextual-booking-modal";
import { WatchBookingNudge } from "@/components/videos/watch-booking-nudge";

type WatchConversionContextValue = {
  openBooking: () => void;
  videoTitle: string;
};

const WatchConversionContext =
  createContext<WatchConversionContextValue | null>(null);

type WatchConversionProviderProps = {
  videoTitle: string;
  /** Show the delayed bottom nudge (public visitors). */
  showNudge: boolean;
  children: ReactNode;
};

/**
 * Shared booking modal + open API for talk strip and watch nudge.
 */
export function WatchConversionProvider({
  videoTitle,
  showNudge,
  children,
}: WatchConversionProviderProps) {
  const [open, setOpen] = useState(false);
  const openBooking = useCallback(() => setOpen(true), []);
  const value = useMemo(
    () => ({ openBooking, videoTitle }),
    [openBooking, videoTitle],
  );

  return (
    <WatchConversionContext.Provider value={value}>
      {children}
      <ContextualBookingModal
        context={videoTitle}
        source="watch-modal"
        open={open}
        onOpenChange={setOpen}
        showTrigger={false}
        triggerLabel="לתיאום שיחה"
      />
      {showNudge ? <WatchBookingNudge /> : null}
    </WatchConversionContext.Provider>
  );
}

export function useWatchConversion(): WatchConversionContextValue {
  const ctx = useContext(WatchConversionContext);
  if (!ctx) {
    throw new Error(
      "useWatchConversion must be used within WatchConversionProvider",
    );
  }
  return ctx;
}
