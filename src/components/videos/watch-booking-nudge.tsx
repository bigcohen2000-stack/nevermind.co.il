"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nm_watch_booking_nudge_seen";

/**
 * One-shot bottom banner after first watch visit in the session.
 * Stored in sessionStorage so it does not repeat in the same browser visit.
 */
export function WatchBookingNudge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(true);
    } catch {
      /* private mode */
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-background/95 px-4 py-3 shadow-float backdrop-blur-sm md:bottom-4 md:inset-x-auto md:start-4 md:max-w-md md:border"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 md:mx-0">
        <p className="text-sm leading-relaxed text-foreground/80">
          רוצה להפריד עובדה מסיפור לפני שיחה אישית?
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/booking" className="btn btn-primary text-sm">
            לתיאום
          </Link>
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
