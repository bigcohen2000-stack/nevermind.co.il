"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { logoutClub } from "@/actions/club-login";
import { clearSiteThemePreference } from "@/actions/theme";
import type { SiteAccessTier } from "@/lib/access/site-tier";
import {
  formatHeaderAuthLabel,
  formatHeaderClubLabel,
  type HeaderSession,
} from "@/lib/auth/header-session-shared";
import { TimeOfDayGreeting } from "@/components/layout/time-of-day-greeting";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "nm-join-banner-dismissed";

type SiteStatusBannerProps = {
  session: HeaderSession;
  accessTier?: SiteAccessTier;
};

/**
 * Slim sticky strip by access tier:
 * - Guest: join free account
 * - Account: connected (not paid)
 * - Club: archive open (opened by Yakir)
 */
export function SiteStatusBanner({
  session,
  accessTier = "guest",
}: SiteStatusBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(true);

  const authLabel = formatHeaderAuthLabel(session.authEmail);
  const clubLabel = formatHeaderClubLabel(session.clubPhone);
  const hasAuth = Boolean(session.authUserId);
  const isClub = accessTier === "club";

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismissGuest() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  function signOutAccount() {
    startTransition(async () => {
      await clearSiteThemePreference().catch(() => undefined);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    });
  }

  function signOutClub() {
    startTransition(async () => {
      await clearSiteThemePreference().catch(() => undefined);
      await logoutClub();
      router.refresh();
      router.push("/");
    });
  }

  if (isClub) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-b border-action/40 bg-ink text-[#FAFAF8]"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <p className="min-w-0 text-xs leading-relaxed sm:text-sm">
            <span className="me-2 inline-flex items-center gap-1.5 font-semibold tracking-wide text-action">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-action"
              />
              מועדון פתוח
            </span>
            <TimeOfDayGreeting
              name={session.displayName}
              className="me-2 text-[#FAFAF8]"
            />
            <span className="text-[#FAFAF8]/85">
              המאגר זמין במכשיר הזה
              {clubLabel ? ` · ${clubLabel}` : ""}
              {authLabel ? ` · חשבון ${authLabel}` : ""}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href="/videos?filter=club"
              className="inline-flex min-h-8 items-center px-2 text-xs text-[#FAFAF8]/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              מאגר
            </Link>
            <Link
              href="/live"
              className="inline-flex min-h-8 items-center px-2 text-xs text-[#FAFAF8]/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              לייב
            </Link>
            <Link
              href="/members"
              className="inline-flex min-h-8 items-center px-2 text-xs text-[#FAFAF8]/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              המועדון
            </Link>
            {session.clubPhone ? (
              <button
                type="button"
                disabled={pending}
                onClick={signOutClub}
                className="inline-flex min-h-8 items-center px-2 text-xs text-[#9CA3AF] transition hover:text-action disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              >
                יציאה מהמועדון
              </button>
            ) : hasAuth ? (
              <button
                type="button"
                disabled={pending}
                onClick={signOutAccount}
                className="inline-flex min-h-8 items-center px-2 text-xs text-[#9CA3AF] transition hover:text-action disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              >
                התנתק
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (hasAuth) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-b border-foreground/10 bg-ink-raised/90 text-foreground"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <p className="min-w-0 text-xs leading-relaxed sm:text-sm">
            <span className="me-2 inline-flex items-center gap-1.5 font-medium text-emerald-400">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-emerald-400"
              />
              מחובר לאתר
            </span>
            <TimeOfDayGreeting
              name={session.displayName}
              className="me-2 text-foreground"
            />
            {authLabel ? (
              <span className="text-foreground/85">חשבון {authLabel}</span>
            ) : null}
            <span className="text-muted">
              {" "}
              · חשבון חופשי. מאגר המועדון נפתח בנפרד אחרי אישור.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href="/my-list"
              className="inline-flex min-h-8 items-center rounded-md px-2 text-xs text-foreground/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              הרשימה שלי
            </Link>
            <Link
              href="/members"
              className="inline-flex min-h-8 items-center rounded-md px-2 text-xs text-foreground/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              כניסה למועדון
            </Link>
            <Link
              href="/profile"
              className="inline-flex min-h-8 items-center rounded-md px-2 text-xs text-foreground/85 transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              פרופיל
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={signOutAccount}
              className="inline-flex min-h-8 items-center rounded-md px-2 text-xs text-muted transition hover:text-action disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="הצטרפות לאתר"
      className="border-b border-action/35 bg-action/[0.08] text-foreground"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-tight">הצטרפו לאתר</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted sm:text-sm">
            שמירת סרטונים, הרשימה שלי, והתחברות מהירה עם Google או אימייל. זה לא
            פותח את מאגר המועדון.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/my-list"
            className={cn(
              "inline-flex min-h-9 items-center justify-center rounded-md bg-action px-3 text-xs font-semibold text-white",
              "transition hover:bg-action/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
            )}
          >
            התחברות (Google / אימייל)
          </Link>
          <button
            type="button"
            onClick={dismissGuest}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-label="סגירת באנר הצטרפות"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
