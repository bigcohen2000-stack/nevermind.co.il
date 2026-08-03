import { cn } from "@/lib/utils";

type LockMarkProps = {
  className?: string;
  /** Decorative mark. Parent should set aria when needed. */
  title?: string;
};

/**
 * Quiet lock glyph for club / gated surfaces.
 */
export function LockMark({ className, title }: LockMarkProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      viewBox="0 0 24 24"
      className={cn("size-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
