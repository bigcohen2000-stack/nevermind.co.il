"use client";

import { useFocusMode } from "@/components/videos/focus-mode-context";
import { cn } from "@/lib/utils";

/**
 * Compact density toggle for profile settings / workspace prefs.
 */
export function UiDensityToggle({ className }: { className?: string }) {
  const { density, setDensity } = useFocusMode();

  return (
    <div className={cn("mt-6", className)}>
      <p className="text-sm font-medium text-[#FAFAF8]">צפיפות מידע</p>
      <p className="mt-1 text-xs text-[#9CA3AF]">
        משפיע על מרווחים בממשק. נשמר בעוגייה בלי ריצוד בטעינה הבאה.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={density === "comfortable"}
          onClick={() => setDensity("comfortable")}
          className={cn(
            "border px-3 py-1.5 text-xs transition",
            density === "comfortable"
              ? "border-action bg-action/15 text-action"
              : "border-[#FAFAF8]/20 text-[#FAFAF8]/85",
          )}
        >
          נוח
        </button>
        <button
          type="button"
          aria-pressed={density === "compact"}
          onClick={() => setDensity("compact")}
          className={cn(
            "border px-3 py-1.5 text-xs transition",
            density === "compact"
              ? "border-action bg-action/15 text-action"
              : "border-[#FAFAF8]/20 text-[#FAFAF8]/85",
          )}
        >
          צפוף
        </button>
      </div>
    </div>
  );
}
