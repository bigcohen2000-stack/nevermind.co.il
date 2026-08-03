"use client";

import { useEffect, useState, useTransition } from "react";

import { setSiteThemePreference } from "@/actions/theme";
import type { HeaderSession } from "@/lib/auth/header-session-shared";
import {
  applySiteTheme,
  clearThemeCookie,
  isConnectedForTheme,
  THEME_STORAGE_KEY,
  type SiteTheme,
  writeThemeCookie,
} from "@/lib/theme/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  session: HeaderSession;
  initialTheme: SiteTheme;
  className?: string;
};

/**
 * Light / dark toggle for connected account or club sessions.
 * Guests stay on the cream canvas (no control).
 */
export function ThemeToggle({
  session,
  initialTheme,
  className,
}: ThemeToggleProps) {
  const connected = isConnectedForTheme(session);
  const [theme, setTheme] = useState<SiteTheme>(
    connected ? initialTheme : "light",
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!connected) {
      applySiteTheme("light");
      clearThemeCookie();
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // ignore
      }
      setTheme("light");
      return;
    }
    applySiteTheme(initialTheme);
    setTheme(initialTheme);
  }, [connected, initialTheme]);

  if (!connected) return null;

  function toggle() {
    const next: SiteTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applySiteTheme(next);
    writeThemeCookie(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    startTransition(async () => {
      await setSiteThemePreference(next);
    });
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-60",
        className,
      )}
      aria-pressed={isDark}
      aria-label={isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
