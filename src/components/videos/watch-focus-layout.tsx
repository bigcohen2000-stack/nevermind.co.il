"use client";

import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { useFocusMode } from "@/components/videos/focus-mode-context";
import { cn } from "@/lib/utils";

type WatchFocusLayoutProps = {
  title: string;
  description?: string | null;
  eyebrow: ReactNode;
  player: ReactNode;
  /** Concepts + booking CTA under the player. */
  belowPlayer?: ReactNode;
  /** Related videos sidebar. */
  sidebar?: ReactNode;
  locked?: boolean;
};

/**
 * Watch page chrome with Focus Mode: black stage, max-width player,
 * related sidebar and secondary content fade away.
 */
export function WatchFocusLayout({
  title,
  description,
  eyebrow,
  player,
  belowPlayer,
  sidebar,
  locked = false,
}: WatchFocusLayoutProps) {
  const { focusMode, setFocusMode, toggleFocusMode } = useFocusMode();

  return (
    <main
      className={cn(
        "w-full text-foreground transition-colors duration-300 ease-out",
        focusMode ? "min-h-screen bg-black text-[#FAFAF8]" : "bg-background",
      )}
      dir="rtl"
    >
      <div
        className={cn(
          "mx-auto w-full transition-all duration-300 ease-out",
          focusMode
            ? "flex min-h-screen max-w-none flex-col justify-center px-2 py-4 sm:px-6 sm:py-8 lg:px-10"
            : "max-w-6xl px-3 py-6 sm:px-6 sm:py-12 lg:py-16",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            focusMode
              ? "pointer-events-none max-h-0 translate-y-2 opacity-0"
              : "max-h-[40rem] translate-y-0 opacity-100",
          )}
          aria-hidden={focusMode}
        >
          <div className="hidden sm:block">{eyebrow}</div>
          <h1 className="mt-0 text-xl font-semibold tracking-tight break-words sm:mt-3 sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 hidden max-w-3xl text-sm leading-relaxed text-foreground/75 sm:mt-4 sm:block sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-6 transition-all duration-300 ease-out sm:gap-10 lg:items-start",
            focusMode ? "mt-0 grid-cols-1" : "mt-4 sm:mt-8 lg:grid-cols-12",
          )}
        >
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              focusMode ? "w-full" : "lg:col-span-8",
            )}
          >
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                focusMode && "mx-auto w-full max-w-[min(100%,1600px)]",
              )}
            >
              {player}
            </div>

            {!locked && !focusMode ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 transition-all duration-300">
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 text-sm text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                  aria-pressed={false}
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  מצב מיקוד
                </button>
              </div>
            ) : null}

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                focusMode
                  ? "pointer-events-none max-h-0 translate-y-2 opacity-0"
                  : "max-h-[200rem] translate-y-0 opacity-100",
              )}
              aria-hidden={focusMode}
            >
              {belowPlayer}
            </div>
          </div>

          {sidebar ? (
            <aside
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out lg:col-span-4",
                focusMode
                  ? "pointer-events-none max-h-0 translate-x-4 opacity-0 lg:max-h-0"
                  : "max-h-[200rem] translate-x-0 opacity-100",
              )}
              aria-hidden={focusMode}
              aria-labelledby="related-title"
            >
              {sidebar}
            </aside>
          ) : null}
        </div>
      </div>

      {focusMode && !locked ? (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] start-1/2 z-[60] -translate-x-1/2 border border-white/30 bg-black/85 px-4 py-2 text-sm font-medium text-[#FAFAF8] transition hover:border-[#D42B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D42B2B]"
        >
          יציאה ממצב מיקוד
        </button>
      ) : null}
    </main>
  );
}
