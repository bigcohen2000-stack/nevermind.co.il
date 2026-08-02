"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ShimmerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/**
 * Aceternity-style shimmer CTA: light sweep on hover / focus.
 * Respects prefers-reduced-motion (static surface, no sweep).
 */
export function ShimmerButton({
  children,
  className,
  disabled,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-[var(--radius-btn)] px-5 text-sm font-medium",
        "border border-foreground/20 bg-foreground text-background",
        "transition-[border-color,opacity] duration-200",
        "hover:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,45%,rgba(250,250,248,0.28),55%,transparent)] bg-[length:200%_100%]",
          "transition-transform duration-500 ease-out group-hover:translate-x-full",
          "motion-reduce:hidden",
        )}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
