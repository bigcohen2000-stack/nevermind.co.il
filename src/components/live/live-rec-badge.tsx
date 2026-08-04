"use client";

import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";

type LiveRecBadgeProps = {
  active: boolean;
  /** Tooltip surface: light on paper, dark on ink bands. */
  tipTone?: "light" | "dark";
  className?: string;
};

/**
 * Shared REC indicator for home live strip and /live hero.
 */
export function LiveRecBadge({
  active,
  tipTone = "light",
  className,
}: LiveRecBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={active ? "שידור חי פעיל עכשיו" : "שידור חי. כרגע לא פעיל"}
    >
      <span
        className={
          active
            ? "relative inline-flex size-2.5 shrink-0"
            : "inline-flex size-2.5 shrink-0"
        }
        aria-hidden="true"
      >
        {active ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-action/70" />
        ) : null}
        <span
          className={
            active
              ? "relative inline-flex size-2.5 rounded-full bg-action"
              : "inline-flex size-2.5 rounded-full bg-action/40"
          }
        />
      </span>
      <span
        className={
          active
            ? "text-[0.7rem] font-semibold tracking-[0.14em] text-action"
            : "text-[0.7rem] font-semibold tracking-[0.14em] text-foreground/45"
        }
      >
        REC
      </span>
      <InfoTip
        label="הסבר על שידור חי"
        tone={tipTone}
        className="size-6"
      >
        {active
          ? "השידור פעיל עכשיו. הכניסה דרך עמוד השידור החי אחרי הרשמה ואישור גיל 18+."
          : "שידור חי ממפגשי הפודקאסט. כשמתחיל, מופיע כאן כפתור כניסה. אפשר גם להירשם להתראה בדפדפן בפרופיל."}
      </InfoTip>
    </span>
  );
}
