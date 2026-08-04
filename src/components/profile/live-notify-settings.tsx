"use client";

import { useCallback, useEffect, useState } from "react";

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
 * Profile settings: opt in to browser push when a live stream starts.
 */
export function LiveNotifySettings() {
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">(
    "unknown",
  );
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    setConfigured(Boolean(vapid));
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setPermission(Notification.permission);

    let cancelled = false;
    void (async () => {
      try {
        const reg = await registerServiceWorker();
        const sub = await reg?.pushManager.getSubscription();
        if (!cancelled) setEnabled(Boolean(sub));
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const enableLive = useCallback(async () => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setError("התראות לא מוגדרות בשרת (חסרות מפתחות VAPID).");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setError("ההרשאה בדפדפן לא אושרה.");
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
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
      }

      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...json,
          notify_live: true,
          notify_daily: true,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "שמירת ההתראה נכשלה.");
      }

      // Ensure flag even if row already existed without notify_live in body merge.
      if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        await fetch("/api/push/subscribe", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: {
              p256dh: json.keys.p256dh,
              auth: json.keys.auth,
            },
            notify_live: true,
          }),
        });
      }

      setEnabled(true);
      setMessage("התראות שידור חי פעילות במכשיר הזה.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ההרשמה נכשלה.");
    } finally {
      setBusy(false);
    }
  }, []);

  const disableLive = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (!sub?.endpoint) {
        setEnabled(false);
        setMessage("אין מנוי פעיל במכשיר.");
        setBusy(false);
        return;
      }

      const json = sub.toJSON();
      if (!json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("מפתחות המנוי חסרים. נסו להפעיל מחדש.");
      }

      const res = await fetch("/api/push/subscribe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
          notify_live: false,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "עדכון נכשל.");
      }

      setMessage("התראות שידור חי כבויות. איפוס יומי (אם הופעל) נשאר.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "כיבוי נכשל.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (!configured) {
    return (
      <div className="mt-6 border border-[#FAFAF8]/10 p-4 text-sm text-[#9CA3AF]">
        <p className="font-medium text-[#FAFAF8]">התראות שידור חי</p>
        <p className="mt-2">
          ההתראות בדפדפן עדיין לא מוגדרות בשרת. אפשר לחזור לכאן אחרי הגדרת
          VAPID.
        </p>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="mt-6 border border-[#FAFAF8]/10 p-4 text-sm text-[#9CA3AF]">
        <p className="font-medium text-[#FAFAF8]">התראות שידור חי</p>
        <p className="mt-2">
          הדפדפן או המכשיר לא תומכים בהתראות Push. אפשר לפתוח את האתר בכרום או
          ב-Edge במחשב, או באנדרואיד.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-[#FAFAF8]/10 p-4 text-sm">
      <p className="font-medium text-[#FAFAF8]">התראות שידור חי</p>
      <p className="mt-2 leading-relaxed text-[#9CA3AF]">
        כששידור חי מתחיל בסטודיו, תקבל התראה בדפדפן עם קישור ל-/live. זה עובד
        כמו אפליקציה קלה, בלי להתקין חנות אפליקציות. צריך להשאיר הרשאה לדפדפן
        במכשיר הזה.
      </p>
      {permission === "denied" ? (
        <p className="mt-2 text-[#D42B2B]">
          ההרשאה נחסמה בהגדרות הדפדפן. אפשר לאפשר מחדש בהגדרות האתר.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void enableLive()}
          className="border border-[#D42B2B] bg-[#D42B2B] px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {busy ? "מעדכן..." : enabled ? "הפעל מחדש התראות לייב" : "הפעל התראות לייב"}
        </button>
        <button
          type="button"
          disabled={busy || !enabled}
          onClick={() => void disableLive()}
          className="border border-[#FAFAF8]/25 px-3 py-1.5 text-xs text-[#FAFAF8] disabled:opacity-40"
        >
          כבה התראות לייב
        </button>
      </div>
      {error ? (
        <p role="status" className="mt-3 text-xs text-[#D42B2B]">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-3 text-xs text-emerald-400">
          {message}
        </p>
      ) : null}
    </div>
  );
}
