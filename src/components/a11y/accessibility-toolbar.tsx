"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import {
  A11Y_STORAGE_KEY,
  applyA11yPrefs,
  clearA11yAttrs,
  DEFAULT_A11Y_PREFS,
  parseA11yPrefs,
  type A11yFontScale,
  type A11yPrefs,
} from "@/lib/a11y/toolbar-prefs";
import { cn } from "@/lib/utils";

type ToggleKey = Exclude<keyof A11yPrefs, "fontScale">;

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: "highContrast", label: "ניגודיות גבוהה" },
  { key: "underlineLinks", label: "הדגשת קישורים" },
  { key: "stopAnimations", label: "עצירת אנימציות" },
  { key: "relaxedSpacing", label: "ריווח מוגדל" },
  { key: "grayscale", label: "גווני אפור" },
];

/**
 * Floating accessibility toolbar (סרגל נגישות).
 * Preferences persist in localStorage and apply to <html> via data attributes.
 */
export function AccessibilityToolbar() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_A11Y_PREFS);

  useEffect(() => {
    const initial = parseA11yPrefs(localStorage.getItem(A11Y_STORAGE_KEY));
    setPrefs(initial);
    applyA11yPrefs(initial);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function persist(next: A11yPrefs) {
    setPrefs(next);
    applyA11yPrefs(next);
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
  }

  function setFontScale(fontScale: A11yFontScale) {
    persist({ ...prefs, fontScale });
  }

  function toggle(key: ToggleKey) {
    persist({ ...prefs, [key]: !prefs[key] });
  }

  function reset() {
    persist({ ...DEFAULT_A11Y_PREFS });
    clearA11yAttrs();
    applyA11yPrefs(DEFAULT_A11Y_PREFS);
  }

  return (
    <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] start-3 z-[90] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:start-4">
      <div className="pointer-events-auto flex flex-col items-stretch gap-2">
        {open ? (
          <div
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${panelId}-title`}
            className="w-[min(18.5rem,calc(100vw-1.5rem))] border border-foreground/20 bg-background text-foreground shadow-none"
          >
            <div className="flex items-center justify-between border-b border-foreground/20 px-3 py-2.5">
              <h2
                id={`${panelId}-title`}
                className="text-sm font-semibold tracking-tight"
              >
                סרגל נגישות
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center text-sm text-muted hover:text-foreground"
                aria-label="סגירת סרגל נגישות"
              >
                סגור
              </button>
            </div>

            <div className="space-y-4 px-3 py-3">
              <fieldset>
                  <legend className="text-xs font-medium text-muted">
                  גודל טקסט
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {(
                    [
                      ["normal", "רגיל"],
                      ["large", "גדול"],
                      ["xlarge", "גדול מאוד"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFontScale(value)}
                      aria-pressed={prefs.fontScale === value}
                      className={cn(
                        "min-h-10 border px-1 text-xs font-medium transition",
                        prefs.fontScale === value
                          ? "border-action bg-action text-[#FAFAF8]"
                          : "border-foreground/30 bg-transparent text-foreground hover:border-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <ul className="space-y-1">
                {TOGGLES.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => toggle(item.key)}
                      aria-pressed={prefs[item.key]}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-between border px-3 text-start text-sm transition",
                        prefs[item.key]
                          ? "border-action bg-action/5 text-foreground"
                          : "border-foreground/20 hover:border-foreground/50",
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-muted" aria-hidden>
                        {prefs[item.key] ? "פעיל" : "כבוי"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 border-t border-foreground/20 pt-3">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-10 items-center justify-center border border-foreground px-3 text-sm font-medium hover:bg-foreground/5"
                >
                  איפוס הגדרות
                </button>
                <Link
                  href="/accessibility"
                  className="inline-flex min-h-10 items-center justify-center text-sm font-medium text-action underline-offset-4 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  הצהרת נגישות
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 border border-ink bg-ink px-3 text-sm font-medium text-[#FAFAF8] shadow-none transition hover:border-action hover:bg-action focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
        >
          <span aria-hidden className="text-base leading-none">
            ♿
          </span>
          <span className="sr-only sm:not-sr-only sm:inline">נגישות</span>
        </button>
      </div>
    </div>
  );
}

export default AccessibilityToolbar;
