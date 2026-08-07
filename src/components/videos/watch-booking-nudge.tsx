"use client";

import { useEffect, useState } from "react";

import { useFabBarContribution } from "@/components/layout/use-fab-bar-contribution";
import { useWatchConversion } from "@/components/videos/watch-conversion-provider";

const STORAGE_KEY = "nm_watch_booking_nudge_seen";
/** Wait until the visitor has had time to get value from the video. */
const SHOW_AFTER_MS = 45_000;

/**
 * One-shot bottom banner after ~45s on watch (not on mount).
 * Opens the contextual booking modal instead of /booking.
 * On mobile publishes height into --nm-fab-bar so WhatsApp / a11y sit above it.
 */
export function WatchBookingNudge() {
  const { openBooking } = useWatchConversion();
  const [visible, setVisible] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
  const contribute = visible && !isMdUp;
  const barRef = useFabBarContribution<HTMLDivElement>("nudge", contribute);

  useEffect(() => {
    let cancelled = false;

    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode: still show once after delay */
    }

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(true);
    }, SHOW_AFTER_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-sm md:bottom-4 md:inset-x-auto md:start-4 md:max-w-md md:border md:pb-3"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 md:mx-0">
        <p className="text-sm leading-relaxed text-foreground/80">
          רוצה לפרק את זה בשיחה קצרה?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary text-sm"
            onClick={() => {
              setVisible(false);
              openBooking();
            }}
          >
            לתיאום
          </button>
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={() => setVisible(false)}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
