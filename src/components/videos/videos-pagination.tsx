import Link from "next/link";

import {
  videosBrowseHref,
  type VideoBrowseDuration,
} from "@/lib/videos/browse-params";
import type { BreakdownLevel } from "@/lib/videos/investigation";
import type {
  VideoBrowseFilter,
  VideoBrowseSort,
} from "@/lib/videos/queries";
import { cn } from "@/lib/utils";

type VideosPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  filter: VideoBrowseFilter;
  sort: VideoBrowseSort;
  concept?: string;
  breakdown?: BreakdownLevel;
  duration?: VideoBrowseDuration;
};

/**
 * Crawlable Previous/Next pager for /videos.
 * Uses real links (rel prev/next) and anchors to #videos-results.
 */
export function VideosPagination({
  page,
  totalPages,
  total,
  pageSize,
  filter,
  sort,
  concept,
  breakdown,
  duration = "all",
}: VideosPaginationProps) {
  if (total <= pageSize || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const prevHref =
    page > 1
      ? videosBrowseHref({
          filter,
          sort,
          concept,
          breakdown,
          duration,
          page: page - 1,
          hash: "videos-results",
        })
      : null;
  const nextHref =
    page < totalPages
      ? videosBrowseHref({
          filter,
          sort,
          concept,
          breakdown,
          duration,
          page: page + 1,
          hash: "videos-results",
        })
      : null;

  const linkClass =
    "inline-flex min-h-11 min-w-[7rem] items-center justify-center border px-4 text-sm no-underline transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action";

  return (
    <nav
      className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
      aria-label="עימוד סרטונים"
    >
      <p className="text-sm text-foreground/70" aria-live="polite">
        מציגים {from}-{to} מתוך {total}. עמוד {page} מתוך {totalPages}.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            rel="prev"
            className={cn(linkClass, "border-foreground/20 text-foreground")}
          >
            הקודם
          </Link>
        ) : (
          <span
            className={cn(
              linkClass,
              "cursor-not-allowed border-foreground/10 text-muted",
            )}
            aria-disabled="true"
          >
            הקודם
          </span>
        )}

        <span className="min-w-[4.5rem] text-center text-sm font-medium tabular-nums text-foreground">
          {page} / {totalPages}
        </span>

        {nextHref ? (
          <Link
            href={nextHref}
            rel="next"
            className={cn(linkClass, "border-action bg-action text-background")}
          >
            הבא
          </Link>
        ) : (
          <span
            className={cn(
              linkClass,
              "cursor-not-allowed border-foreground/10 text-muted",
            )}
            aria-disabled="true"
          >
            הבא
          </span>
        )}
      </div>
    </nav>
  );
}
