"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const PHASES = [
  "מחפש במאגר...",
  "מחפש סרטונים חינמיים...",
  "מחפש סרטונים במועדון...",
] as const;

type SearchProgressProps = {
  className?: string;
  /** Compact row for suggest dropdowns. */
  compact?: boolean;
};

/**
 * Staged loading copy so slow archive search feels intentional.
 */
export function SearchProgress({
  className,
  compact = false,
}: SearchProgressProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % PHASES.length);
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center gap-2.5 text-start",
        compact ? "px-3 py-3 text-sm" : "px-1 py-3 text-sm sm:text-base",
        className,
      )}
    >
      <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-action/40 motion-reduce:animate-none" />
        <span className="relative size-2.5 rounded-full bg-action" />
      </span>
      <span className="min-w-0 text-foreground/80">
        <span className="font-medium text-foreground">{PHASES[index]}</span>
        <span className="mt-0.5 block text-xs text-muted">
          סורקים חינם ומועדון. זה יכול לקחת רגע.
        </span>
      </span>
    </div>
  );
}
