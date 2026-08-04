"use client";

import { useCallback, useEffect, useState } from "react";

import { InstallAppButton } from "@/components/layout/install-app-button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "nm-daily-reset-dismissed";
const SUBSCRIBED_KEY = "nm-daily-reset-subscribed";
const WELCOME_AUTO_HIDE_MS = 12_000;

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

type PromptPhase = "hidden" | "offer" | "welcome";

/**
 * Bottom prompt: Daily Resets (Web Push).
 * Hidden when unsupported, dismissed, already subscribed, or VAPID missing.
 * After success: short welcome in the same panel, then auto-hide.
 */
export function DailyResetPrompt() {
  const [phase, setPhase] = useState<PromptPhase>("hidden");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.localStorage.getItem(SUBSCRIBED_KEY) === "1") return;
    if (Notification.permission === "denied") return;

    let cancelled = false;

    void (async () => {
      try {
        const reg = await registerServiceWorker();
        const existing = await reg?.pushManager.getSubscription();
        if (cancelled) return;
        if (existing) {
          window.localStorage.setItem(SUBSCRIBED_KEY, "1");
          return;
        }
        setPhase("offer");
      } catch {
        /* unsupported / insecure context */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "welcome") return;
    const timer = window.setTimeout(() => {
      setPhase("hidden");
    }, WELCOME_AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setPhase("hidden");
  }, []);

  const finishWelcome = useCallback(() => {
    setPhase("hidden");
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
        setError("ההרשאה לא אושרה. אפשר לנסות שוב מהגדרות הדפדפן.");
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

      const payload = {
        ...subscription.toJSON(),
        notify_daily: true,
        notify_live: false,
      };

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error?.includes("row-level security")
            ? "ההרשמה נכשלה בשרת. נסו שוב בעוד רגע."
            : data?.error || "שמירת המנוי נכשלה.",
        );
      }

      window.localStorage.setItem(SUBSCRIBED_KEY, "1");
      window.localStorage.setItem(DISMISS_KEY, "1");
      setPhase("welcome");
    } catch (err) {
      const message = err instanceof Error ? err.message : "ההרשמה נכשלה.";
      setError(
        message.includes("row-level security")
          ? "ההרשמה נכשלה בשרת. נסו שוב בעוד רגע."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }, []);

  if (phase === "hidden") return null;

  return (
    <aside
      role="dialog"
      aria-label={
        phase === "welcome" ? "ברוך הבא לאיפוסים יומיים" : "הרשמה לאיפוס יומי"
      }
      className={cn(
        "fixed inset-x-0 bottom-20 z-[60] border-t border-foreground/15 bg-background/95 p-4 shadow-float backdrop-blur-sm md:bottom-0",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {phase === "welcome" ? (
          <>
            <div className="text-start">
              <p className="text-sm font-medium text-foreground">
                ברוך הבא. מעכשיו תקבל איפוס יומי.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                פעם ביום יגיע משפט קצר מהחקירה. בלי רעש. אפשר גם להוסיף את האתר
                למסך הבית, כמו אפליקציה קלה.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <InstallAppButton compact />
              <button
                type="button"
                className="btn btn-primary"
                onClick={finishWelcome}
              >
                הבנתי
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}
