"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { InstallAppButton } from "@/components/layout/install-app-button";
import { ClubLoginForm } from "@/components/members/club-login-form";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { ArchiveTierPicker } from "@/components/premium/archive-tier-picker";
import { LockMark } from "@/components/videos/lock-mark";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
import { ViewerFeedbackForm } from "@/components/videos/viewer-feedback-form";
import { cn } from "@/lib/utils";

type AccessPath =
  | "buy"
  | "account"
  | "club"
  | "login"
  | "app"
  | "feedback"
  | null;

type WatchAccessChooserProps = {
  title: string;
  videoId: string;
  returnPath: string;
  isAuthenticated?: boolean;
  hasTeaser?: boolean;
};

function PathIcon({
  id,
  className,
}: {
  id: Exclude<AccessPath, null>;
  className?: string;
}) {
  const cls = cn("size-4 shrink-0", className);
  switch (id) {
    case "buy":
      return (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16v12H4z" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2" />
        </svg>
      );
    case "account":
      return (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    case "club":
      return <LockMark className={cls} />;
    case "login":
      return (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 17H5V7h5" />
          <path d="M13 12H21" />
          <path d="M17 8l4 4-4 4" />
        </svg>
      );
    case "app":
      return (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M10 18h4" />
        </svg>
      );
    case "feedback":
      return (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 5h14v10H9l-4 3V5z" />
        </svg>
      );
    default:
      return null;
  }
}

const PATHS: Array<{
  id: Exclude<AccessPath, null>;
  label: string;
  hint: string;
  accent?: boolean;
}> = [
  {
    id: "club",
    label: "בקשת גישה למועדון",
    hint: "כל המאגר אחרי בדיקת התאמה. אין סליקה באתר",
    accent: true,
  },
  {
    id: "login",
    label: "כבר יש לי גישה",
    hint: "כניסה עם סיסמה או קישור",
  },
  {
    id: "buy",
    label: "רכישה מהירה",
    hint: '50 ש"ח + מע"מ לסרטון הזה בלבד',
  },
  {
    id: "account",
    label: "חשבון אתר חינם",
    hint: "רשימה והיסטוריה. לא פותח את המאגר",
  },
  {
    id: "app",
    label: "התקנת אפליקציה",
    hint: "גישה נוחה מהמסך הראשי",
  },
  {
    id: "feedback",
    label: "משוב / שאלה",
    hint: "בלי רכישה",
  },
];

const BUY_STEPS = [
  "שולחים בוואטסאפ",
  "מקבלים לאן להעביר",
  "לינק כאן וגם במייל",
] as const;

function PathPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-foreground/15 bg-paper/40 p-4 sm:p-5">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Progressive access UI for locked watch: pick one path, then see only that form.
 */
export function WatchAccessChooser({
  title,
  videoId,
  returnPath,
  isAuthenticated = false,
  hasTeaser = false,
}: WatchAccessChooserProps) {
  // Club request open by default: archive path is the main upgrade.
  const [path, setPath] = useState<AccessPath>("club");

  const visiblePaths = useMemo(() => {
    if (isAuthenticated) {
      return PATHS.filter((p) => p.id !== "account");
    }
    return PATHS;
  }, [isAuthenticated]);

  return (
    <div className="mx-auto max-w-lg space-y-6 text-start">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-action/30 bg-action/5 text-action"
          aria-hidden="true"
        >
          <LockMark className="size-4" />
        </span>
        <div>
          <p className="text-xs font-medium tracking-normal text-action">
            איך להמשיך
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
            {hasTeaser
              ? "הטעימה הסתיימה. חשבון מייל לא פותח את המאגר. רק כניסת מועדון."
              : "הסרטון המלא במועדון. חשבון מייל לא פותח את המאגר. רק כניסת מועדון."}
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2" role="list">
        {visiblePaths.map((item) => {
          const active = path === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setPath(active ? null : item.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-2.5 border px-3 py-3 text-start transition",
                  active
                    ? "border-action bg-action/5 ring-1 ring-action/30"
                    : item.accent
                      ? "border-action/35 hover:border-action"
                      : "border-foreground/15 hover:border-foreground/35",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center border",
                    active
                      ? "border-action/40 bg-action text-background"
                      : "border-foreground/15 text-foreground/70",
                  )}
                  aria-hidden="true"
                >
                  <PathIcon id={item.id} className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.accent ? (
                      <span className="text-[10px] font-medium tracking-wide text-action">
                        מומלץ
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {item.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {path === "buy" ? (
        <PathPanel title="רכישה מהירה של הסרטון">
          <ol className="mt-3 grid gap-2 sm:grid-cols-3">
            {BUY_STEPS.map((step, i) => (
              <li
                key={step}
                className="border border-foreground/10 bg-background px-2.5 py-2 text-center"
              >
                <span className="block text-[10px] font-medium tracking-wide text-action">
                  {i + 1}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-foreground/75">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm leading-relaxed text-foreground/75">
            שולחים בוואטסאפ. מקבלים הוראות העברה, ואז קישור כאן וגם במייל.
          </p>
          <div className="mt-4">
            <SingleVideoRequestCta
              title={title}
              videoId={videoId}
              variant="lock"
            />
          </div>
        </PathPanel>
      ) : null}

      {path === "account" ? (
        <PathPanel title="חשבון אתר חינם">
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            שומרים רשימה והיסטוריית צפייה. זה לא פותח את מאגר המועדון.
          </p>
          <div className="mt-4">
            <MyListSignInForm nextPath={returnPath} variant="compact" />
          </div>
        </PathPanel>
      ) : null}

      {path === "club" ? (
        <PathPanel title="מנוי למועדון">
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            בוחרים משך. אחר כך וואטסאפ לבדיקת התאמה. אין סליקה באתר.
          </p>
          <div className="mt-4 space-y-4">
            <ArchiveTierPicker density="compact" requireExplicitSelect />
            <PrivatePodcastBanner density="compact" />
            <Link href="/members" className="link-arrow text-sm">
              לדף המועדון ←
            </Link>
          </div>
        </PathPanel>
      ) : null}

      {path === "login" ? (
        <PathPanel title="כניסה למועדון">
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            שם, טלפון וסיסמה שקיבלתם בוואטסאפ, או קישור אישי.
          </p>
          <div className="mt-4">
            <ClubLoginForm variant="gate" nextPath={returnPath} />
          </div>
        </PathPanel>
      ) : null}

      {path === "app" ? (
        <PathPanel title="התקנת האפליקציה">
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            מוסיפים למסך הבית לגישה מהירה. האפליקציה לא מחליפה כניסת מועדון.
          </p>
          <div className="mt-4">
            <InstallAppButton />
          </div>
        </PathPanel>
      ) : null}

      {path === "feedback" ? (
        <PathPanel title="משוב או שאלה">
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            אפשר גם בלי פרטי קשר.
          </p>
          <div className="mt-4">
            <ViewerFeedbackForm videoId={videoId} videoTitle={title} />
          </div>
        </PathPanel>
      ) : null}

      {!path ? (
        <p className="text-center text-xs text-muted">
          לוחצים על אפשרות אחת. הטופס נפתח מתחת.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-foreground/10 pt-6">
        <Link href="/videos" className="btn btn-secondary text-sm">
          סרטונים פתוחים
        </Link>
        <Link href="/members" className="btn btn-secondary text-sm">
          דף המועדון
        </Link>
      </div>
    </div>
  );
}
