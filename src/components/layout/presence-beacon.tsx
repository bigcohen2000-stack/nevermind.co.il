"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { pingPresence } from "@/actions/presence";
import type { HeaderSession } from "@/lib/auth/header-session-shared";

const INTERVAL_MS = 60_000;

type PresenceBeaconProps = {
  session: HeaderSession;
};

/**
 * Quiet heartbeat while a visitor has an account or club session.
 */
export function PresenceBeacon({ session }: PresenceBeaconProps) {
  const pathname = usePathname() ?? "/";
  const active = Boolean(session.authUserId || session.clubPhone);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function beat() {
      if (cancelled || document.visibilityState === "hidden") return;
      await pingPresence(pathname);
    }

    void beat();
    const id = window.setInterval(() => void beat(), INTERVAL_MS);

    function onVisibility() {
      if (document.visibilityState === "visible") void beat();
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, pathname]);

  useEffect(() => {
    lastPath.current = pathname;
  }, [pathname]);

  return null;
}
