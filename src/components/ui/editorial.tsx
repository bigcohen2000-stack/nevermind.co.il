import type { ReactNode } from "react";

/**
 * Shared editorial primitives.
 *
 * `Eyebrow` is the small muted section label carrying the signature red tick
 * (styled by `.eyebrow` in globals.css). `Watermark` is the oversized
 * low-contrast background word. Both were previously redefined in every page;
 * centralising them keeps the system coherent. Tokens only, RTL-aware.
 */

export function Eyebrow({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return <p className={`eyebrow${onDark ? " eyebrow-on-dark" : ""}`}>{children}</p>;
}

export function Watermark({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`watermark ${className}`}>
      {children}
    </span>
  );
}
