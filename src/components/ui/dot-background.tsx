import { cn } from "@/lib/utils";

/**
 * Aceternity-style Dot Background (CSS-only).
 *
 * Pure decorative layer: no client JS, no canvas, no images.
 * Mount behind page content with -z-10 so it never blocks FCP or interaction.
 */
export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 h-full w-full bg-black",
        className,
      )}
    >
      <div
        aria-hidden="true"
        role="presentation"
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(#334155_1px,transparent_1px)]",
          "[background-size:20px_20px]",
          "opacity-40",
          "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]",
        )}
      />
    </div>
  );
}

export default DotBackground;
