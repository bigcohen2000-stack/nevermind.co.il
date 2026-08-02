import {
  CLUB_JOIN_DISCLAIMER,
  CLUB_JOIN_DISCLAIMER_LINES,
} from "@/lib/content/access-layers";
import { cn } from "@/lib/utils";

type ClubJoinDisclaimerProps = {
  /** Dark hero band vs light paper sections. */
  tone?: "dark" | "light";
  /** Compact gate on locked watch. */
  compact?: boolean;
  className?: string;
};

/**
 * Editorial club warning block. Shown before join / login.
 */
export function ClubJoinDisclaimer({
  tone = "light",
  compact = false,
  className,
}: ClubJoinDisclaimerProps) {
  const onDark = tone === "dark";

  return (
    <aside
      role="note"
      aria-label="אזהרת מועדון"
      className={cn(
        "text-start",
        compact
          ? "border border-foreground/20 px-3 py-3"
          : "max-w-prose border-s-2 border-action ps-5 pe-1",
        className,
      )}
    >
      {!compact ? (
        <p
          className={cn(
            "text-[0.7rem] font-medium uppercase tracking-[0.14em]",
            onDark ? "text-foreground/50" : "text-muted",
          )}
        >
          לפני הכניסה
        </p>
      ) : null}

      <div
        className={cn(
          "space-y-3",
          compact ? "mt-0" : "mt-3",
        )}
      >
        {CLUB_JOIN_DISCLAIMER_LINES.map((line) => (
          <p
            key={line}
            className={cn(
              "leading-[1.65]",
              compact
                ? "text-xs text-foreground/80"
                : onDark
                  ? "text-base text-foreground/90 sm:text-lg"
                  : "text-base text-foreground sm:text-lg",
            )}
          >
            {line}
          </p>
        ))}
      </div>

      <span className="sr-only">{CLUB_JOIN_DISCLAIMER}</span>
    </aside>
  );
}
