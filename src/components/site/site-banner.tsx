import Link from "next/link";

import type { BannerSlot } from "@/lib/studio/banners-shared";
import { getActiveBannerForSlot } from "@/lib/studio/banners";
import { cn } from "@/lib/utils";

type SiteBannerProps = {
  slot: BannerSlot;
  className?: string;
  /** compact = inline / gate. default = section block. */
  density?: "default" | "compact";
};

/**
 * RSC banner from site_banners table. Renders nothing when inactive / missing.
 */
export async function SiteBanner({
  slot,
  className,
  density = "default",
}: SiteBannerProps) {
  const banner = await getActiveBannerForSlot(slot);
  if (!banner) return null;

  const compact = density === "compact";
  const href = banner.cta_href?.trim();
  const ctaLabel = banner.cta_label?.trim();

  return (
    <aside
      className={cn(
        "border border-action bg-background text-foreground",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-8",
        className,
      )}
      aria-labelledby={`site-banner-${slot}-title`}
    >
      <h2
        id={`site-banner-${slot}-title`}
        className={cn(
          "font-semibold tracking-tight",
          compact ? "text-lg" : "text-2xl lg:text-3xl",
        )}
      >
        {banner.title}
      </h2>
      {banner.body.trim() ? (
        <p
          className={cn(
            "mt-3 max-w-prose leading-relaxed text-foreground/80",
            compact ? "text-sm" : "text-base",
          )}
        >
          {banner.body}
        </p>
      ) : null}
      {ctaLabel && href ? (
        <div className="mt-5">
          {href.startsWith("http") ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link href={href} className="btn btn-primary">
              {ctaLabel}
            </Link>
          )}
        </div>
      ) : null}
    </aside>
  );
}
