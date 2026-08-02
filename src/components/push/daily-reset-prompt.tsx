"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const DISMISS_KEY = "nm-daily-reset-dismissed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/**
 * Subtle bottom prompt: Subscribe to Daily Resets (Web Push).
 * Hidden when unsupported, dismissed, already subscribed, or VAPID missing.
 */
export function DailyResetPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (Notification.permission === "denied") return;

    let cancelled = false;

    void (async () => {
      try {
        const reg = await registerServiceWorker();
        const existing = await reg?.pushManager.getSubscription();
        if (!cancelled && !existing) {
          setVisible(true);
        }
      } catch {
        /* unsupported / insecure context */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  const subscribe = useCallback(async () => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setError("התראות לא מוגדרות עדיין.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("ההרשאה לא אושרה.");
        setBusy(false);
        return;
      }

      const reg = await registerServiceWorker();
      if (!reg) {
        setError("רכיב ההתראות בדפדפן לא זמין.");
        setBusy(false);
        return;
      }

      await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "שמירת המנוי נכשלה.");
      }

      window.localStorage.setItem(DISMISS_KEY, "1");
      setVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ההרשמה נכשלה.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="הרשמה לאיפוס יומי"
      className={cn(
        "fixed inset-x-0 bottom-20 z-[60] border-t border-foreground/15 bg-background/95 p-4 shadow-float backdrop-blur-sm md:bottom-0",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <p className="text-sm font-medium text-foreground">
            הרשמה לאיפוסים יומיים
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            משפט קצר מהחקירה, פעם ביום. בלי דרמה.
          </p>
          {error ? (
            <p role="status" className="mt-2 text-xs text-action">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={dismiss}
            disabled={busy}
          >
            לא עכשיו
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void subscribe()}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "נרשם..." : "הרשמה"}
          </button>
        </div>
      </div>
    </aside>
  );
}
