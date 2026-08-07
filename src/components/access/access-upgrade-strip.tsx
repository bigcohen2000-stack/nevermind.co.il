import Link from "next/link";

import {
  getTierCtaBundle,
  type TierCtaBundle,
} from "@/lib/access/tier-cta";
import type { SiteAccessTier } from "@/lib/access/site-tier";
import { cn } from "@/lib/utils";

type AccessUpgradeStripProps = {
  tier: SiteAccessTier;
  /** denser for header / mobile. */
  density?: "header" | "banner" | "section";
  className?: string;
  /** Hide status chip (header already has auth). */
  hideStatus?: boolean;
  /** Override primary CTA (e.g. watch return path). */
  primaryHref?: string;
};

function CtaLink({
  href,
  label,
  variant,
  className,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        variant === "primary" ? "btn btn-primary" : "btn btn-secondary",
        "min-h-10 px-3 text-sm",
        className,
      )}
    >
      {label}
    </Link>
  );
}

/**
 * Tier-aware next-step CTAs. One primary, optional secondary, one dry note.
 */
export function AccessUpgradeStrip({
  tier,
  density = "section",
  className,
  hideStatus = false,
  primaryHref,
}: AccessUpgradeStripProps) {
  const bundle: TierCtaBundle = getTierCtaBundle(tier);
  const primaryHrefResolved = primaryHref ?? bundle.primary.href;

  if (density === "header") {
    return (
      <div className={cn("flex shrink-0 items-center gap-1.5", className)}>
        {!hideStatus && tier !== "guest" ? (
          <span
            className={cn(
              "hidden items-center border px-2 py-1 text-[11px] font-medium tracking-wide xl:inline-flex",
              tier === "club"
                ? "border-action/50 text-action"
                : "border-foreground/20 text-foreground/80",
            )}
          >
            {bundle.statusLabel}
          </span>
        ) : null}
        {tier !== "club" ? (
          <CtaLink
            href={primaryHrefResolved}
            label={bundle.primary.label}
            variant="primary"
            className="min-h-10"
          />
        ) : null}
      </div>
    );
  }

  if (density === "banner") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          className,
        )}
      >
        <CtaLink
          href={primaryHrefResolved}
          label={bundle.primary.label}
          variant="primary"
          className="min-h-9 text-xs"
        />
        {bundle.secondary ? (
          <CtaLink
            href={bundle.secondary.href}
            label={bundle.secondary.label}
            variant="secondary"
            className="min-h-9 text-xs"
          />
        ) : null}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "border border-foreground/15 bg-paper p-4 sm:p-5",
        className,
      )}
      aria-label="שכבת גישה"
    >
      <p className="text-xs font-medium tracking-wide text-action">
        {bundle.statusLabel}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
        {bundle.note}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <CtaLink
          href={primaryHrefResolved}
          label={bundle.primary.label}
          variant="primary"
        />
        {bundle.secondary ? (
          <CtaLink
            href={bundle.secondary.href}
            label={bundle.secondary.label}
            variant="secondary"
          />
        ) : null}
      </div>
    </aside>
  );
}
