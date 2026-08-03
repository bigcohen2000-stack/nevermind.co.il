import Link from "next/link";

import {
  searchHref,
  type SearchResultType,
  type SearchVideoFilter,
} from "@/lib/search/search-params";
import { cn } from "@/lib/utils";

type SearchFilterControlsProps = {
  q: string;
  filter: SearchVideoFilter;
  type?: SearchResultType;
  freeCount: number;
  clubCount: number;
};

const FILTERS: Array<{
  id: SearchVideoFilter;
  label: string;
  countKey: "all" | "free" | "club";
}> = [
  { id: "all", label: "הכול", countKey: "all" },
  { id: "open", label: "חינם", countKey: "free" },
  { id: "club", label: "מועדון", countKey: "club" },
];

/**
 * Crawlable free / club filter for /search video results.
 */
export function SearchFilterControls({
  q,
  filter,
  type = "all",
  freeCount,
  clubCount,
}: SearchFilterControlsProps) {
  const counts = {
    all: freeCount + clubCount,
    free: freeCount,
    club: clubCount,
  };

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="סינון תוצאות סרטונים"
    >
      {FILTERS.map((item) => {
        const active = item.id === filter;
        const count = counts[item.countKey];
        return (
          <Link
            key={item.id}
            href={searchHref({
              q,
              filter: item.id,
              type,
              page: 1,
              hash: "search-videos",
            })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 border px-3 text-sm no-underline transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
              active
                ? "border-action bg-action text-background"
                : "border-foreground/15 text-foreground/80 hover:border-foreground/35",
            )}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "tabular-nums text-xs",
                active ? "text-background/80" : "text-muted",
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
