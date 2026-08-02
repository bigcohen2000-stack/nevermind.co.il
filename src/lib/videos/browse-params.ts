import type {
  VideoBrowseFilter,
  VideoBrowseSort,
} from "@/lib/videos/queries";
import {
  isBreakdownLevel,
  type BreakdownLevel,
} from "@/lib/videos/investigation";

/** Fair grid size: 3 columns × 4 rows on large screens. */
export const VIDEOS_PAGE_SIZE = 12;

export type VideosBrowseParams = {
  filter: VideoBrowseFilter;
  sort: VideoBrowseSort;
  concept?: string;
  breakdown?: BreakdownLevel;
  page: number;
};

/**
 * Parse and clamp `/videos` search params.
 * Invalid or empty `page` falls back to 1 (no throw).
 */
export function parseVideosBrowseParams(raw: {
  filter?: string;
  sort?: string;
  concept?: string;
  breakdown?: string;
  level?: string;
  page?: string;
}): VideosBrowseParams {
  const filter =
    raw.filter === "open" || raw.filter === "club" || raw.filter === "all"
      ? raw.filter
      : "all";

  const sort =
    raw.sort === "newest" ||
    raw.sort === "oldest" ||
    raw.sort === "title" ||
    raw.sort === "longest"
      ? raw.sort
      : "newest";

  const conceptRaw = raw.concept?.trim() ?? "";
  const concept =
    conceptRaw.length > 0 && conceptRaw.length <= 80
      ? conceptRaw
      : undefined;

  const breakdownRaw = (raw.breakdown ?? raw.level)?.trim() ?? "";
  const breakdown = isBreakdownLevel(breakdownRaw) ? breakdownRaw : undefined;

  return {
    filter,
    sort,
    concept,
    breakdown,
    page: parsePageParam(raw.page),
  };
}

/** Empty, NaN, zero, negative, or non-integer → 1. */
export function parsePageParam(raw: string | undefined | null): number {
  if (raw == null) return 1;
  const trimmed = String(raw).trim();
  if (!trimmed) return 1;
  if (!/^\d+$/.test(trimmed)) return 1;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 10_000);
}

/**
 * Build a `/videos` href preserving filter/sort/concept and optional page.
 * Page 1 omits `page` for a clean canonical URL.
 */
export function videosBrowseHref(opts: {
  filter?: VideoBrowseFilter;
  sort?: VideoBrowseSort;
  concept?: string;
  breakdown?: BreakdownLevel | string;
  page?: number;
  /** Scroll target after navigation (hash without #). */
  hash?: string;
}): string {
  const params = new URLSearchParams();
  const filter = opts.filter ?? "all";
  const sort = opts.sort ?? "newest";
  if (filter !== "all") params.set("filter", filter);
  if (sort !== "newest") params.set("sort", sort);
  if (opts.concept?.trim()) params.set("concept", opts.concept.trim());
  if (isBreakdownLevel(opts.breakdown)) {
    params.set("breakdown", opts.breakdown);
  }
  const page = opts.page ?? 1;
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const base = qs ? `/videos?${qs}` : "/videos";
  return opts.hash ? `${base}#${opts.hash}` : base;
}

export function clampPage(page: number, totalPages: number): number {
  const max = Math.max(1, totalPages);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), max);
}
