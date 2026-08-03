import {
  clampPage,
  parsePageParam,
} from "@/lib/videos/browse-params";

/** Fair grid size: 3 columns × 4 rows on large screens (same as /videos). */
export const SEARCH_PAGE_SIZE = 12;

/** Cap ranked search hits so multi-page results stay bounded. */
export const SEARCH_FETCH_CAP = 96;

export type SearchVideoFilter = "all" | "open" | "club";

/**
 * Which result groups to show.
 * `tab` is the shareable URL key. `type` is accepted as a legacy alias.
 */
export type SearchResultType =
  | "all"
  | "videos"
  | "articles"
  | "concepts"
  | "mechanisms";

export type SearchPageParams = {
  q: string;
  page: number;
  filter: SearchVideoFilter;
  type: SearchResultType;
};

const RESULT_TYPES: readonly SearchResultType[] = [
  "all",
  "videos",
  "articles",
  "concepts",
  "mechanisms",
] as const;

export function isSearchResultType(value: unknown): value is SearchResultType {
  return (
    typeof value === "string" &&
    (RESULT_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Parse and clamp `/search` search params.
 * Invalid or empty `page` falls back to 1 (no throw).
 * `tab` wins over legacy `type` when both are present.
 */
export function parseSearchPageParams(raw: {
  q?: string;
  page?: string;
  filter?: string;
  type?: string;
  tab?: string;
}): SearchPageParams {
  const filter =
    raw.filter === "open" || raw.filter === "club" || raw.filter === "all"
      ? raw.filter
      : "all";

  const tabRaw = (raw.tab ?? raw.type)?.trim() ?? "";
  const type = isSearchResultType(tabRaw) ? tabRaw : "all";

  return {
    q: raw.q?.trim() ?? "",
    page: parsePageParam(raw.page),
    filter,
    type,
  };
}

/**
 * Build a `/search` href preserving q / filter / tab / page.
 * Defaults are omitted for clean canonical URLs.
 * Writes `tab` (not `type`) for shareable views.
 */
export function searchHref(opts: {
  q?: string;
  page?: number;
  filter?: SearchVideoFilter;
  type?: SearchResultType;
  /** Scroll target after navigation (hash without #). */
  hash?: string;
}): string {
  const params = new URLSearchParams();
  const q = opts.q?.trim() ?? "";
  if (q) params.set("q", q);
  const filter = opts.filter ?? "all";
  if (filter !== "all") params.set("filter", filter);
  const type = opts.type ?? "all";
  if (type !== "all") params.set("tab", type);
  const page = opts.page ?? 1;
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const base = qs ? `/search?${qs}` : "/search";
  return opts.hash ? `${base}#${opts.hash}` : base;
}

/**
 * Merge a live query into the current search URL while keeping tab/filter/page.
 */
export function searchUrlWithQuery(
  pathname: string,
  currentSearch: string,
  q: string,
): string {
  const params = new URLSearchParams(currentSearch);
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  else params.delete("q");

  // Normalize legacy `type` → `tab`.
  const legacyType = params.get("type");
  if (legacyType && !params.get("tab")) {
    params.set("tab", legacyType);
  }
  params.delete("type");

  const qs = params.toString();
  const base = pathname || "/search";
  return qs ? `${base}?${qs}` : base;
}

export { clampPage, parsePageParam };
