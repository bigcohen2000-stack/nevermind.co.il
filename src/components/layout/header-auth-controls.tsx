"use client";

import {
  Bookmark,
  KeyRound,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { logoutClub } from "@/actions/club-login";
import { clearSiteThemePreference } from "@/actions/theme";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  formatHeaderAuthLabel,
  formatHeaderClubLabel,
  type HeaderSession,
} from "@/lib/auth/header-session-shared";
import type { SiteAccessTier } from "@/lib/access/site-tier";
import { createClient } from "@/lib/supabase/client";
import type { SiteTheme } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";

type HeaderAuthControlsProps = {
  session: HeaderSession;
  theme: SiteTheme;
  accessTier?: SiteAccessTier;
  /** Stack vertically in the mobile drawer. */
  layout?: "inline" | "stack";
  onNavigate?: () => void;
  /** Shorter trigger for tight mobile chrome. */
  compact?: boolean;
};

const menuItemClass =
  "flex min-h-10 w-full items-center gap-2 px-2 text-start transition hover:bg-paper";

/**
 * Header auth: personal account (email) or club session.
 * Guest: התחברות + הרשמה. Connected: list, profile, theme, sign out.
 */
export function HeaderAuthControls({
  session,
  theme,
  accessTier = "guest",
  layout = "inline",
  onNavigate,
  compact = false,
}: HeaderAuthControlsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const authLabel = formatHeaderAuthLabel(session.authEmail);
  const clubLabel = formatHeaderClubLabel(session.clubPhone);
  const hasAuth = Boolean(session.authUserId);
  const isClub = accessTier === "club";
  const isConnected = hasAuth || isClub;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  function signOutAccount() {
    startTransition(async () => {
      await clearSiteThemePreference().catch(() => undefined);
      const supabase = createClient();
      await supabase.auth.signOut();
      close();
      router.refresh();
      router.push("/");
    });
  }

  function signOutClub() {
    startTransition(async () => {
      await clearSiteThemePreference().catch(() => undefined);
      await logoutClub();
      close();
      router.refresh();
      router.push("/");
    });
  }

  const menuLinks = (
    <>
      {isClub ? (
        <Link
          role="menuitem"
          href="/members"
          className={layout === "stack" ? "nav-link flex min-h-11 items-center gap-2" : menuItemClass}
          onClick={layout === "stack" ? onNavigate : close}
        >
          <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
          המועדון
        </Link>
      ) : null}
      <Link
        role="menuitem"
        href="/my-list"
        className={layout === "stack" ? "nav-link flex min-h-11 items-center gap-2" : menuItemClass}
        onClick={layout === "stack" ? onNavigate : close}
      >
        <Bookmark className="h-4 w-4 shrink-0" aria-hidden="true" />
        הרשימה שלי
      </Link>
      <Link
        role="menuitem"
        href="/profile"
        className={layout === "stack" ? "nav-link flex min-h-11 items-center gap-2" : menuItemClass}
        onClick={layout === "stack" ? onNavigate : close}
      >
        <User className="h-4 w-4 shrink-0" aria-hidden="true" />
        פרופיל אישי
      </Link>
      {hasAuth ? (
        <Link
          role="menuitem"
          href="/profile?tab=settings"
          className={layout === "stack" ? "nav-link flex min-h-11 items-center gap-2" : menuItemClass}
          onClick={layout === "stack" ? onNavigate : close}
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
          הגדרות
        </Link>
      ) : null}
    </>
  );

  if (layout === "stack") {
    return (
      <div className="space-y-2 border-t border-foreground/10 pt-4">
        <p className="px-2 text-xs font-medium tracking-wide text-muted">
          חשבון
        </p>
        {isConnected ? (
          <div className="space-y-1 px-2 text-sm">
            {authLabel ? (
              <p className="text-foreground/90">חשבון: {authLabel}</p>
            ) : null}
            {clubLabel || isClub ? (
              <p className="text-foreground/70">
                מועדון: {clubLabel || "פתוח במכשיר"}
              </p>
            ) : null}
            <div className="flex flex-col gap-1 pt-2">
              {menuLinks}
              <div className="flex min-h-11 items-center justify-between gap-2 px-0">
                <span className="flex items-center gap-2 text-sm text-foreground/80">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  )}
                  ערכת נושא
                </span>
                <ThemeToggle session={session} initialTheme={theme} />
              </div>
              {hasAuth ? (
                <button
                  type="button"
                  disabled={pending}
                  className="flex min-h-11 items-center gap-2 text-start text-muted hover:text-action disabled:opacity-50"
                  onClick={signOutAccount}
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  יציאה
                </button>
              ) : null}
              {isClub || session.clubPhone ? (
                <button
                  type="button"
                  disabled={pending}
                  className="flex min-h-11 items-center gap-2 text-start text-muted hover:text-action disabled:opacity-50"
                  onClick={signOutClub}
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  יציאה מהמועדון
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/profile"
                className="nav-link flex min-h-12 items-center gap-2 px-2 text-base"
                onClick={onNavigate}
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                התחברות
              </Link>
            </li>
            <li>
              <Link
                href="/profile?mode=register"
                className="nav-link flex min-h-12 items-center gap-2 px-2 text-base"
                onClick={onNavigate}
              >
                <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                הרשמה
              </Link>
            </li>
          </ul>
        )}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/profile"
          className={cn(
            "inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 text-sm text-foreground transition",
            compact ? "min-w-11 justify-center px-2" : "px-3",
            "hover:border-action hover:text-action",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          )}
          aria-label="התחברות"
        >
          <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
          {compact ? null : <span>התחברות</span>}
        </Link>
        <Link
          href="/profile?mode=register"
          className={cn(
            "inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 bg-foreground text-sm text-background transition",
            compact ? "min-w-11 justify-center px-2" : "px-3",
            "hover:border-action hover:bg-action hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          )}
          aria-label="הרשמה"
        >
          <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
          {compact ? null : <span>הרשמה</span>}
        </Link>
      </div>
    );
  }

  const triggerLabel = hasAuth ? "החשבון" : "מועדון";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 text-sm text-foreground transition",
          compact ? "min-w-11 justify-center px-2" : "px-3",
          "hover:border-action hover:text-action",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
        )}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={hasAuth ? "תפריט חשבון" : "תפריט מועדון"}
        onClick={() => setOpen((v) => !v)}
      >
        {hasAuth ? (
          <User className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {compact ? (
          <span className="sr-only">{triggerLabel}</span>
        ) : (
          <span>{triggerLabel}</span>
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 z-[60] mt-2 w-64 border border-foreground/15 bg-background p-2 text-sm shadow-float"
        >
          <div className="space-y-1">
            {authLabel ? (
              <p className="px-2 py-1 text-xs text-muted">חשבון: {authLabel}</p>
            ) : null}
            {clubLabel || isClub ? (
              <p className="px-2 py-1 text-xs text-muted">
                מועדון: {clubLabel || "פתוח במכשיר"}
              </p>
            ) : null}
            {menuLinks}
            <div className="flex min-h-10 items-center justify-between gap-2 border-y border-foreground/10 px-2 py-1">
              <span className="flex items-center gap-2 text-xs text-muted">
                ערכת נושא
              </span>
              <ThemeToggle session={session} initialTheme={theme} />
            </div>
            {hasAuth ? (
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                className={cn(menuItemClass, "text-muted disabled:opacity-50")}
                onClick={signOutAccount}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                יציאה
              </button>
            ) : null}
            {isClub || session.clubPhone ? (
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                className={cn(menuItemClass, "text-muted disabled:opacity-50")}
                onClick={signOutClub}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                יציאה מהמועדון
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
