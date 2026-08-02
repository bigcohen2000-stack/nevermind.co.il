import { cn } from "@/lib/utils";

/**
 * Subtle dot field on the cream canvas.
 * Pure decorative layer: no client JS, no canvas, no images.
 */
export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[#FAFAF8]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        role="presentation"
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(#9CA3AF_1px,transparent_1px)]",
          "[background-size:20px_20px]",
          "opacity-25",
          "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]",
        )}
      />
    </div>
  );
}

export default DotBackground;
