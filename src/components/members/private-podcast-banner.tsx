import Link from "next/link";

import {
  PRIVATE_PODCAST_BANNER,
  PRIVATE_PODCAST_WHATSAPP,
} from "@/lib/content/access-layers";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type PrivatePodcastBannerProps = {
  /** compact = lock / aside. default = page section. */
  density?: "default" | "compact";
  className?: string;
  /** When true, primary CTA asks for personal feed link (already a member). */
  memberMode?: boolean;
};

/**
 * Promotes the private club RSS podcast benefit.
 */
export function PrivatePodcastBanner({
  density = "default",
  className,
  memberMode = false,
}: PrivatePodcastBannerProps) {
  const requestHref = buildWhatsAppHref(PRIVATE_PODCAST_WHATSAPP);
  const compact = density === "compact";

  return (
    <aside
      className={cn(
        "border border-action bg-background text-foreground",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-8",
        className,
      )}
      aria-labelledby="private-podcast-banner-title"
    >
      <p className="text-xs font-medium tracking-wide text-action">
        {PRIVATE_PODCAST_BANNER.eyebrow}
      </p>
      <h2
        id="private-podcast-banner-title"
        className={cn(
          "mt-2 font-semibold tracking-tight",
          compact ? "text-lg" : "text-2xl lg:text-3xl",
        )}
      >
        {PRIVATE_PODCAST_BANNER.title}
      </h2>
      <p
        className={cn(
          "mt-3 max-w-prose leading-relaxed text-foreground/80",
          compact ? "text-sm" : "text-base",
        )}
      >
        {PRIVATE_PODCAST_BANNER.body}
      </p>
      <p className="mt-2 text-sm text-muted">{PRIVATE_PODCAST_BANNER.freeNote}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {memberMode ? (
          <a
            href={requestHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            {PRIVATE_PODCAST_BANNER.requestCta}
          </a>
        ) : (
          <Link href="/members" className="btn btn-primary">
            {PRIVATE_PODCAST_BANNER.clubCta}
          </Link>
        )}
        <Link href="/api/podcast.xml" className="btn btn-secondary">
          פיד ציבורי (חינם)
        </Link>
      </div>
    </aside>
  );
}
