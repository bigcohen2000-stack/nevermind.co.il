import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RssFeedLinkProps = {
  className?: string;
  children: ReactNode;
  /** Absolute or site-relative feed URL. Defaults to public podcast feed. */
  href?: string;
};

/**
 * Plain anchor for RSS/API feeds.
 * Never use next/link here: client navigation into XML breaks the app shell.
 */
export function RssFeedLink({
  className,
  children,
  href = "/api/podcast.xml",
}: RssFeedLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer alternate"
      type="application/rss+xml"
      className={cn(className)}
    >
      {children}
    </a>
  );
}
