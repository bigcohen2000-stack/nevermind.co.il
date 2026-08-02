"use client";

import { useEffect, useState } from "react";

/**
 * Thin system strip when the browser reports no network.
 * SSR assumes online to avoid a hydration flash.
 */
export function OfflineStatusBar() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-foreground px-3 py-1.5 text-center text-xs text-background"
    >
      סטטוס אתר: מנותק מהרשת. זמין מצב צפייה מקומי בלבד.
    </div>
  );
}
