"use client";

import type { ReactNode } from "react";

import { useFocusMode } from "@/components/videos/focus-mode-context";
import { cn } from "@/lib/utils";

export function SiteShellFrame({ children }: { children: ReactNode }) {
  const { focusMode } = useFocusMode();

  return (
    <div
      className={cn(
        "relative flex min-h-full flex-col overflow-x-clip transition-[padding] duration-500",
        focusMode ? "pb-0" : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0",
      )}
    >
      {children}
    </div>
  );
}
