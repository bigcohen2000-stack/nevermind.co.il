"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { cn } from "@/lib/utils";

type PublicWatchNextStepsProps = {
  /** Personal Auth unlocks transcript download. */
  isAuthenticated: boolean;
  /** Full transcript when the viewer may download it. */
  transcript: string | null;
  transcriptAvailable: boolean;
  videoTitle: string;
  signInNextPath: string;
  /** Club upsell label / href from video row when set. */
  clubLabel?: string | null;
  clubHref?: string | null;
};

type StepId = "expand" | "download" | "club";

function downloadTranscript(text: string, title: string) {
  const safe = title
    .replace(/[^\p{L}\p{N}\s\-_.]/gu, "")
    .trim()
    .slice(0, 80);
  const filename = `${safe || "transcript"}.txt`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StepIcon({ id }: { id: StepId }) {
  const cls = "size-4 shrink-0";
  if (id === "expand") {
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  if (id === "download") {
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
        <path d="M12 4v10" />
        <path d="M8 10l4 4 4-4" />
        <path d="M5 18h14" />
      </svg>
    );
  }
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
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

const STEPS: Array<{
  id: StepId;
  label: string;
  hint: string;
  accent?: boolean;
}> = [
  {
    id: "expand",
    label: "הרחב מידע",
    hint: "עובדות ותמליל",
  },
  {
    id: "download",
    label: "הורד תמליל",
    hint: "קובץ טקסט",
  },
  {
    id: "club",
    label: "הצטרף למועדון",
    hint: "מאגר מלא",
    accent: true,
  },
];

function DetailPanel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 border border-foreground/10 bg-background p-3 sm:p-4">
      {children}
    </div>
  );
}

/**
 * Public watch chooser under the player: expand, download, or join club.
 */
export function PublicWatchNextSteps({
  isAuthenticated,
  transcript,
  transcriptAvailable,
  videoTitle,
  signInNextPath,
  clubLabel,
  clubHref,
}: PublicWatchNextStepsProps) {
  const [step, setStep] = useState<StepId | null>(null);
  const canDownload = Boolean(transcript?.trim()) && isAuthenticated;
  const clubTarget = clubHref?.trim() || "/members";
  const clubCopy =
    clubLabel?.trim() ||
    "לחברי מועדון: המשך החקירה בשיחות המלאות, ללא פילטר.";

  function onPick(id: StepId) {
    setStep((prev) => (prev === id ? null : id));
    if (id === "expand") {
      const el = document.getElementById("watch-insight");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (id === "download" && canDownload && transcript) {
      downloadTranscript(transcript.trim(), videoTitle);
    }
  }

  return (
    <section
      className="border border-foreground/15 bg-paper/40 p-4 sm:p-5"
      aria-labelledby="public-next-steps-title"
    >
      <p className="text-xs font-medium tracking-[0.14em] text-action uppercase">
        איך להמשיך
      </p>
      <h2
        id="public-next-steps-title"
        className="mt-2 text-lg font-semibold tracking-tight"
      >
        שלוש אפשרויות מתחת לסרטון
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        הרחבה, הורדת תמליל, או כניסה למועדון. בלי סליקה באתר.
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3" role="list">
        {STEPS.map((item) => {
          const active = step === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item.id)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 border px-3 py-3 text-start transition sm:min-h-[4.5rem] sm:flex-col sm:items-start sm:gap-2",
                  active
                    ? "border-action bg-action/5 ring-1 ring-action/30"
                    : item.accent
                      ? "border-action/35 hover:border-action"
                      : "border-foreground/15 hover:border-foreground/35",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center border",
                    active
                      ? "border-action/40 bg-action text-background"
                      : "border-foreground/15 text-foreground/70",
                  )}
                  aria-hidden="true"
                >
                  <StepIcon id={item.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
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

      {step === "expand" ? (
        <DetailPanel>
          <p className="text-sm leading-relaxed text-foreground/75">
            גללו לתובנה למטה. עובדות פתוחות לכולם. תמליל מלא אחרי חשבון אתר
            חינם.
          </p>
        </DetailPanel>
      ) : null}

      {step === "download" ? (
        <DetailPanel>
          {!transcriptAvailable ? (
            <p className="text-sm text-muted">
              אין תמליל זמין לסרטון הזה עדיין.
            </p>
          ) : canDownload ? (
            <p className="text-sm text-foreground/75">
              ההורדה התחילה. אם לא, לחצו שוב על הורד תמליל.
            </p>
          ) : (
            <div>
              <p className="text-sm leading-relaxed text-foreground/75">
                חשבון אתר חינם פותח הורדת תמליל.
              </p>
              <div className="mt-3">
                <MyListSignInForm
                  nextPath={signInNextPath}
                  variant="compact"
                />
              </div>
            </div>
          )}
        </DetailPanel>
      ) : null}

      {step === "club" ? (
        <DetailPanel>
          <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
            {clubCopy}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={clubTarget} className="btn btn-primary text-sm">
              לאזור החברים
            </Link>
            <Link href="/videos?filter=open" className="btn btn-secondary text-sm">
              סרטונים פתוחים
            </Link>
          </div>
          <div className="mt-3">
            <PrivatePodcastBanner density="compact" />
          </div>
        </DetailPanel>
      ) : null}
    </section>
  );
}
