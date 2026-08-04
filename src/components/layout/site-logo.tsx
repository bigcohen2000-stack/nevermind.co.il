import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  /**
   * `on-dark` = light mark for dark header/footer.
   * `on-light` = dark mark for cream / light bands.
   */
  variant?: "on-dark" | "on-light";
  className?: string;
  /** Prefer compact header sizing. */
  size?: "header" | "footer";
  priority?: boolean;
};

const SRC = {
  "on-dark": {
    svg: "/brand/logo-on-dark.svg",
    png: "/brand/logo-on-dark.png",
  },
  "on-light": {
    svg: "/brand/logo-on-light.svg",
    png: "/brand/logo-on-light.png",
  },
} as const;

/**
 * Brand wordmark linking home. Uses SVG when present, PNG as raster fallback.
 * Replace files under public/brand/ to swap artwork without code changes.
 */
export function SiteLogo({
  variant = "on-dark",
  className,
  size = "header",
  priority = false,
}: SiteLogoProps) {
  const src = SRC[variant].svg;
  const dims =
    size === "footer"
      ? { width: 220, height: 58, className: "h-12 w-auto sm:h-14" }
      : { width: 180, height: 48, className: "h-9 w-auto sm:h-10" };

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label="השם לא משנה: NeverMinde, חזרה לראשי"
    >
      <Image
        src={src}
        alt="השם לא משנה. NeverMinde"
        width={dims.width}
        height={dims.height}
        className={cn(dims.className, "object-contain object-right")}
        priority={priority}
        unoptimized
      />
      <span className="sr-only">השם לא משנה</span>
    </Link>
  );
}

export default SiteLogo;
