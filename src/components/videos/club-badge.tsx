import { cn } from "@/lib/utils";

type ClubBadgeProps = {
  className?: string;
  /** Overlay on thumbnails vs inline under title. */
  placement?: "overlay" | "inline";
};

/**
 * Quiet club marker for gated / unlisted video cards.
 */
export function ClubBadge({
  className,
  placement = "overlay",
}: ClubBadgeProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium tracking-wide",
        placement === "overlay"
          ? "absolute top-2 start-2 z-[2] bg-action px-2 py-0.5 text-background"
          : "inline-block bg-action/10 px-1.5 py-0.5 text-action",
        className,
      )}
    >
      מועדון
    </span>
  );
}
