import Link from "next/link";

import {
  searchHref,
  type SearchResultType,
  type SearchVideoFilter,
} from "@/lib/search/search-params";
import { cn } from "@/lib/utils";

type SearchVideosPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  q: string;
  filter?: SearchVideoFilter;
  type?: SearchResultType;
};

/**
 * Crawlable Previous/Next pager for /search video results.
 * Uses real links (rel prev/next) and anchors to #search-videos.
 */
export function SearchVideosPagination({
  page,
  totalPages,
  total,
  pageSize,
  q,
  filter = "all",
  type = "all",
}: SearchVideosPaginationProps) {
  if (total <= pageSize || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const prevHref =
    page > 1
      ? searchHref({
          q,
          filter,
          type,
          page: page - 1,
          hash: "search-videos",
        })
      : null;
  const nextHref =
    page < totalPages
      ? searchHref({
          q,
          filter,
          type,
          page: page + 1,
          hash: "search-videos",
        })
      : null;

  const linkClass =
    "inline-flex min-h-11 min-w-[7rem] items-center justify-center border px-4 text-sm no-underline transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action";

  return (
    <nav
      className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
      aria-label="עימוד תוצאות חיפוש"
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
