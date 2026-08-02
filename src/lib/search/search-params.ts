import {
  clampPage,
  parsePageParam,
} from "@/lib/videos/browse-params";

/** Fair grid size: 3 columns × 4 rows on large screens (same as /videos). */
export const SEARCH_PAGE_SIZE = 12;

/** Cap ranked search hits so multi-page results stay bounded. */
export const SEARCH_FETCH_CAP = 96;

export type SearchPageParams = {
  q: string;
  page: number;
};

/**
 * Parse and clamp `/search` search params.
 * Invalid or empty `page` falls back to 1 (no throw).
 */
export function parseSearchPageParams(raw: {
  q?: string;
  page?: string;
}): SearchPageParams {
  return {
    q: raw.q?.trim() ?? "",
    page: parsePageParam(raw.page),
  };
}

/**
 * Build a `/search` href preserving `q` and optional page.
 * Page 1 omits `page` for a clean canonical URL.
 */
export function searchHref(opts: {
  q?: string;
  page?: number;
  /** Scroll target after navigation (hash without #). */
  hash?: string;
}): string {
  const params = new URLSearchParams();
  const q = opts.q?.trim() ?? "";
  if (q) params.set("q", q);
  const page = opts.page ?? 1;
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const base = qs ? `/search?${qs}` : "/search";
  return opts.hash ? `${base}#${opts.hash}` : base;
}

export { clampPage, parsePageParam };
