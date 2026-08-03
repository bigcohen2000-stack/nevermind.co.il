import {
  clampPage,
  parsePageParam,
} from "@/lib/videos/browse-params";

/** Fair grid size: 3 columns × 4 rows on large screens (same as /videos). */
export const SEARCH_PAGE_SIZE = 12;

/** Cap ranked search hits so multi-page results stay bounded. */
export const SEARCH_FETCH_CAP = 96;

export type SearchVideoFilter = "all" | "open" | "club";

/** Which result groups to emphasize / show. */
export type SearchResultType = "all" | "videos" | "articles" | "concepts";

export type SearchPageParams = {
  q: string;
  page: number;
  filter: SearchVideoFilter;
  type: SearchResultType;
};

/**
 * Parse and clamp `/search` search params.
 * Invalid or empty `page` falls back to 1 (no throw).
 */
export function parseSearchPageParams(raw: {
  q?: string;
  page?: string;
  filter?: string;
  type?: string;
}): SearchPageParams {
  const filter =
    raw.filter === "open" || raw.filter === "club" || raw.filter === "all"
      ? raw.filter
      : "all";
  const type =
    raw.type === "videos" ||
    raw.type === "articles" ||
    raw.type === "concepts" ||
    raw.type === "all"
      ? raw.type
      : "all";

  return {
    q: raw.q?.trim() ?? "",
    page: parsePageParam(raw.page),
    filter,
    type,
  };
}

/**
 * Build a `/search` href preserving q / filter / type / page.
 * Defaults are omitted for clean canonical URLs.
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
  if (type !== "all") params.set("type", type);
  const page = opts.page ?? 1;
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const base = qs ? `/search?${qs}` : "/search";
  return opts.hash ? `${base}#${opts.hash}` : base;
}

export { clampPage, parsePageParam };
