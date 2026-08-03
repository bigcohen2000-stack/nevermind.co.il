import { formatDurationHe } from "@/lib/videos/format-meta";
import { cn } from "@/lib/utils";

type VideoDurationBadgeProps = {
  durationSeconds?: number | null;
  className?: string;
};

/**
 * Thumbnail duration chip (e.g. 12:34). Used on locked cards so length
 * is visible before purchase.
 */
export function VideoDurationBadge({
  durationSeconds,
  className,
}: VideoDurationBadgeProps) {
  const label = formatDurationHe(durationSeconds);
  if (!label) return null;

  return (
    <span
      className={cn(
        "absolute bottom-1.5 end-1.5 z-[3] bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums tracking-tight text-[#FAFAF8]",
        className,
      )}
      aria-label={`משך הסרטון ${label}`}
    >
      {label}
    </span>
  );
}
