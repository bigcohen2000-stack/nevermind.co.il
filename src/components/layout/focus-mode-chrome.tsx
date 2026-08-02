"use client";

import type { ReactNode } from "react";

import { useFocusMode } from "@/components/videos/focus-mode-context";
import { cn } from "@/lib/utils";

/**
 * Soft-hides site chrome (header, footer, search/nav, CTA) in Focus Mode.
 */
export function FocusModeChrome({ children }: { children: ReactNode }) {
  const { focusMode } = useFocusMode();

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        focusMode &&
          "pointer-events-none max-h-0 overflow-hidden opacity-0 blur-[2px]",
      )}
      aria-hidden={focusMode}
    >
      {children}
    </div>
  );
}
