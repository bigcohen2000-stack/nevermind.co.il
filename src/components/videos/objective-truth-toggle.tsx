"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { ArticleGlossary } from "@/components/content/article-glossary";
import { cn } from "@/lib/utils";

type ObjectiveTruthToggleProps = {
  facts: string[];
  /** Full transcript text. Pass null when guest (do not leak in HTML). */
  transcript: string | null;
  /** True when a transcript exists server-side (even if locked for guests). */
  transcriptAvailable?: boolean;
  /** Personal Auth (Google / email). Club alone does not unlock transcript. */
  canViewTranscript?: boolean;
  /** Return path after magic link / Google. */
  signInNextPath?: string;
  videoTitle?: string;
  concepts?: string[];
};

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

/**
 * Under-player facts / transcript panel.
 * Facts stay open. Full transcript requires free site account.
 */
export function ObjectiveTruthToggle({
  facts,
  transcript,
  transcriptAvailable = Boolean(transcript?.trim()),
  canViewTranscript = true,
  signInNextPath = "/my-list",
  videoTitle = "תמליל",
  concepts = [],
}: ObjectiveTruthToggleProps) {
  const switchId = useId();
  const [factsOnly, setFactsOnly] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const hasFacts = facts.length > 0;
  const hasTranscriptText = Boolean(transcript?.trim()) && canViewTranscript;
  const showTranscriptGate =
    transcriptAvailable && !canViewTranscript && !factsOnly;

  if (!hasFacts && !transcriptAvailable) {
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby={`${switchId}-heading`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id={`${switchId}-heading`}
            className="text-lg font-semibold tracking-tight"
          >
            תובנה
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            עובדות קצרות מהסרטון פתוחות לכולם. התמליל המלא לחברים רשומים בחינם.
            {primaryConceptLine(concepts)}{" "}
            מאגר חסום ב{" "}
            <Link
              href="/members"
              className="text-action underline-offset-2 hover:underline"
            >
              אזור החברים
            </Link>
            .
          </p>
        </div>

        {hasFacts ? (
          <label
            htmlFor={switchId}
            className="inline-flex cursor-pointer items-center gap-3 text-sm text-foreground/80"
          >
            <span>עובדות בלבד</span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                id={switchId}
                type="checkbox"
                role="switch"
                className="peer sr-only"
                checked={factsOnly}
                onChange={(e) => setFactsOnly(e.target.checked)}
                aria-checked={factsOnly}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-full border border-foreground/20 bg-foreground/10 transition",
                  "peer-checked:border-action peer-checked:bg-action",
                  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute start-0.5 top-0.5 size-5 rounded-full bg-background shadow-soft transition",
                  "peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5",
                )}
              />
            </span>
          </label>
        ) : null}
      </div>

      {factsOnly && hasFacts ? (
        <div
          className="mt-5 border border-white/20 bg-black px-5 py-8 text-white sm:px-8"
          role="region"
          aria-label="עובדות לוגיות בלבד"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/50">
            עובדות
          </p>
          <ul className="mt-6 space-y-5">
            {facts.map((fact) => (
              <li
                key={fact}
                className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      ) : showTranscriptGate ? (
        <div
          className="mt-5 border border-foreground/15 bg-paper/40 p-5 sm:p-6"
          role="region"
          aria-label="תמליל לחברים רשומים"
        >
          <p className="text-sm font-medium tracking-tight">
            התמליל המלא לחברים רשומים
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            הרשמה בחינם עם Google או קישור לאימייל. בלי סיסמה. אחרי ההתחברות
            התמליל נפתח כאן.
          </p>
          <MyListSignInForm nextPath={signInNextPath} variant="compact" />
        </div>
      ) : hasTranscriptText ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary text-sm"
              aria-expanded={transcriptOpen}
              onClick={() => setTranscriptOpen((open) => !open)}
            >
              {transcriptOpen ? "הסתר תמליל" : "הצג תמליל"}
            </button>
            <button
              type="button"
              className="text-sm text-action underline-offset-2 hover:underline"
              onClick={() =>
                downloadTranscript(transcript!.trim(), videoTitle)
              }
            >
              הורד תמליל
            </button>
          </div>
          {transcriptOpen ? (
            <div className="mt-3 max-h-[18rem] overflow-y-auto border border-foreground/10 bg-paper/40 p-4 text-sm leading-relaxed text-foreground/80">
              <ArticleGlossary>
                <p className="whitespace-pre-wrap">{transcript}</p>
              </ArticleGlossary>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              התמליל מכווץ. לחץ להצגה או להורדה כקובץ טקסט.
            </p>
          )}
        </div>
      ) : hasFacts ? (
        <p className="mt-4 text-sm text-muted">
          אין תמליל מלא. כבה את המתג כדי לראות עובדות, או חכה לחילוץ.
        </p>
      ) : null}

      {!hasFacts && hasTranscriptText ? (
        <p className="mt-3 text-xs text-muted">
          עובדות ליבה עדיין לא חולצו לייבוא הזה.
        </p>
      ) : null}
    </section>
  );
}

function primaryConceptLine(concepts: string[]) {
  const primaryConcept = concepts.find((c) => c.trim()) ?? null;
  if (!primaryConcept) return null;
  return (
    <>
      {" "}
      מושג קשור:{" "}
      <Link
        href={`/search?q=${encodeURIComponent(primaryConcept)}`}
        className="text-action underline-offset-2 hover:underline"
      >
        {primaryConcept}
      </Link>
      .
    </>
  );
}
