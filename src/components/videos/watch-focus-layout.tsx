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
  /** Compact actions directly under the player. */
  actions?: ReactNode;
  /** Concepts + tabs under the player. */
  belowPlayer?: ReactNode;
  /** Related videos: after player on mobile, sidebar on desktop. */
  sidebar?: ReactNode;
  locked?: boolean;
};

/**
 * Watch chrome: player first, related soon on mobile, deep content after.
 * Focus mode blacks out the stage.
 */
export function WatchFocusLayout({
  title,
  description,
  eyebrow,
  player,
  actions,
  belowPlayer,
  sidebar,
  locked = false,
}: WatchFocusLayoutProps) {
  const { focusMode, setFocusMode } = useFocusMode();

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
            : "max-w-6xl px-3 py-4 sm:px-6 sm:py-10 lg:py-14",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            focusMode
              ? "pointer-events-none max-h-0 translate-y-2 opacity-0"
              : "max-h-[24rem] translate-y-0 opacity-100",
          )}
          aria-hidden={focusMode}
        >
          <div className="hidden sm:block">{eyebrow}</div>
          <h1 className="mt-0 text-lg font-semibold leading-snug tracking-tight break-words sm:mt-3 sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted sm:mt-3 sm:line-clamp-3 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-out lg:items-start",
            focusMode
              ? "mt-0 grid-cols-1 gap-4"
              : "mt-3 grid-cols-1 gap-5 sm:mt-6 sm:gap-8 lg:grid-cols-12 lg:gap-10",
          )}
        >
          <div
            className={cn(
              "min-w-0 transition-all duration-300 ease-out",
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

            {!locked && !focusMode && actions ? (
              <div className="mt-3 sm:mt-4">{actions}</div>
            ) : null}

            {/* Related right after player on mobile / tablet */}
            {sidebar && !focusMode ? (
              <div className="mt-5 border border-foreground/10 bg-paper/50 p-4 lg:hidden">
                {sidebar}
              </div>
            ) : null}

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                focusMode
                  ? "pointer-events-none max-h-0 translate-y-2 opacity-0"
                  : "mt-5 max-h-[200rem] translate-y-0 opacity-100 sm:mt-6",
              )}
              aria-hidden={focusMode}
            >
              {belowPlayer}
            </div>
          </div>

          {sidebar ? (
            <aside
              className={cn(
                "hidden min-w-0 overflow-hidden transition-all duration-300 ease-out lg:col-span-4 lg:block",
                focusMode && "lg:pointer-events-none lg:max-h-0 lg:opacity-0",
              )}
              aria-hidden={focusMode}
              aria-labelledby="related-title"
            >
              <div className="sticky top-24 border border-foreground/10 bg-paper/40 p-4 sm:p-5">
                {sidebar}
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      {focusMode && !locked ? (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] start-1/2 z-[60] inline-flex -translate-x-1/2 items-center gap-2 border border-white/30 bg-black/85 px-4 py-2.5 text-sm font-medium text-[#FAFAF8] transition hover:border-[#D42B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D42B2B]"
        >
          <Maximize2 className="size-4" aria-hidden />
          יציאה ממיקוד
        </button>
      ) : null}
    </main>
  );
}
