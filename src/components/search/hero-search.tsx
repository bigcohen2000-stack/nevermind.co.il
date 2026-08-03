"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { RandomInvestigationButton } from "@/components/search/random-investigation-button";
import { logSearchQuery } from "@/actions/search-analytics";
import { useSearchHotkey } from "@/hooks/use-search-hotkey";
import { pushRecentSearch, readRecentSearches } from "@/lib/recent-searches";
import { storeSearchAnalyticsId } from "@/lib/search/analytics-session";
import {
  suggestItemBadge,
  suggestItemHref,
  suggestItemLabel,
  type SuggestItem,
} from "@/lib/search/types";
import {
  BREAKDOWN_LEVELS,
  BREAKDOWN_LEVEL_LABELS,
  BREAKDOWN_LEVEL_NUMBERS,
  type BreakdownLevel,
} from "@/lib/videos/investigation";
import { cn } from "@/lib/utils";

export type { SuggestItem } from "@/lib/search/types";

export type ConceptChip = {
  id: string;
  name: string;
  category?: string | null;
};

const DEFAULT_PLACEHOLDERS = [
  "חפש סרטון או מושג",
  "מציאות",
  "הזדהות",
  "סבל",
  "בחירה חופשית",
];

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let idx = lowerText.indexOf(lowerQ);

  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark
        key={`${idx}-${q}`}
        className="bg-transparent font-semibold text-action"
      >
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    cursor = idx + q.length;
    idx = lowerText.indexOf(lowerQ, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? parts : text;
}

type HeroSearchProps = {
  popularConcepts?: ConceptChip[];
  className?: string;
  variant?: "light" | "dark";
  initialQuery?: string;
  placeholder?: string;
  placeholders?: string[];
  /** Sync typed query into the URL with history.replaceState (home / search). */
  syncUrl?: boolean;
  /** Accessible label for the chip row under the input. */
  chipsAriaLabel?: string;
};

/**
 * Client Hero Search — Aceternity shell + hardened suggest / a11y / zero-state.
 */
export function HeroSearch({
  popularConcepts = [],
  className = "",
  variant = "light",
  initialQuery = "",
  placeholder,
  placeholders: placeholdersProp,
  syncUrl = false,
  chipsAriaLabel = "מושגים נפוצים",
}: HeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [hasFetchedEmpty, setHasFetchedEmpty] = useState(false);
  const [breakdown, setBreakdown] = useState<BreakdownLevel | null>(null);

  const isDark = variant === "dark";
  useSearchHotkey(inputRef);

  const placeholders =
    placeholdersProp && placeholdersProp.length > 0
      ? placeholdersProp
      : placeholder && placeholder.trim()
        ? [
            placeholder,
            ...DEFAULT_PLACEHOLDERS.filter((p) => p !== placeholder),
          ]
        : DEFAULT_PLACEHOLDERS;

  const trimmed = query.trim();
  const showZeroState =
    focused &&
    trimmed.length === 0 &&
    (recent.length > 0 || popularConcepts.length > 0);
  const showEmpty =
    focused &&
    trimmed.length >= 2 &&
    !loading &&
    hasFetchedEmpty &&
    items.length === 0;
  const showSuggest = open && items.length > 0;
  const panelOpen = showZeroState || showEmpty || showSuggest || loading;

  useEffect(() => {
    const q = query.trim();

    // Guard: no network for < 2 chars or whitespace-only. Clear instantly.
    if (q.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setLoading(false);
      setHasFetchedEmpty(false);
      setActiveIndex(-1);
      if (syncUrl && q.length === 0) {
        const base = pathname === "/" ? "/" : pathname;
        const current = `${window.location.pathname}${window.location.search}`;
        if (current !== base) {
          window.history.replaceState(null, "", base);
        }
      }
      return;
    }

    const handle = window.setTimeout(async () => {
      if (syncUrl) {
        const base = pathname === "/" ? "/" : pathname;
        const next = `${base}?q=${encodeURIComponent(q)}`;
        const current = `${window.location.pathname}${window.location.search}`;
        if (current !== next) {
          window.history.replaceState(null, "", next);
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setHasFetchedEmpty(false);
      try {
        const params = new URLSearchParams({ q });
        if (breakdown) params.set("breakdown", breakdown);
        const res = await fetch(`/api/search/suggest?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { items?: SuggestItem[] };
        const nextItems = data.items ?? [];
        setItems(nextItems);
        setOpen(true);
        setActiveIndex(-1);
        setHasFetchedEmpty(nextItems.length === 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setItems([]);
        setHasFetchedEmpty(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [query, pathname, syncUrl, breakdown]);

  // Focus trap while the suggest / zero-state panel is open.
  useEffect(() => {
    if (!panelOpen) return;

    const onKeyDownCapture = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        setFocused(true);
        inputRef.current?.focus();
        return;
      }

      if (e.key !== "Tab" || !shellRef.current) return;

      const root = shellRef.current;
      const focusables = root.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [href], [role="option"], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (list.length === 0) return;

      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDownCapture, true);
    return () => document.removeEventListener("keydown", onKeyDownCapture, true);
  }, [panelOpen]);

  const goToSearch = useCallback(
    (q: string) => {
      const trimmedQ = q.trim();
      if (!trimmedQ) return;
      setRecent(pushRecentSearch(trimmedQ));
      setOpen(false);
      setFocused(false);

      // Fire-and-forget: never block navigation / results.
      const videoSuggestCount = items.filter((item) => item.type === "video")
        .length;
      void logSearchQuery(trimmedQ, videoSuggestCount)
        .then((result) => {
          if (result.ok) storeSearchAnalyticsId(trimmedQ, result.id);
        })
        .catch(() => {
          /* analytics must not surface to the user */
        });

      router.push(`/search?q=${encodeURIComponent(trimmedQ)}`);
    },
    [items, router],
  );

  const goToSuggestItem = useCallback(
    (item: SuggestItem) => {
      const label = suggestItemLabel(item);
      setRecent(pushRecentSearch(label));
      setOpen(false);
      setFocused(false);

      const videoSuggestCount =
        item.type === "video"
          ? 1
          : items.filter((row) => row.type === "video").length;
      void logSearchQuery(label, videoSuggestCount)
        .then((result) => {
          if (result.ok) storeSearchAnalyticsId(label, result.id);
        })
        .catch(() => {
          /* analytics must not surface to the user */
        });

      router.push(suggestItemHref(item));
    },
    [items, router],
  );

  const fillSearch = useCallback(
    (term: string) => {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;
      setQuery(trimmedTerm);
      setFocused(true);
      setOpen(true);
      inputRef.current?.focus();
      goToSearch(trimmedTerm);
    },
    [goToSearch],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setItems([]);
    setHasFetchedEmpty(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      goToSuggestItem(items[activeIndex]);
      return;
    }
    goToSearch(query);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (open || panelOpen) {
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
      } else if (query) {
        clearQuery();
      }
      return;
    }

    if (!showSuggest) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  };

  const fieldShell = ["relative mx-auto w-full max-w-2xl", className].join(" ");

  return (
    <div ref={shellRef} dir="rtl" className={fieldShell}>
      <div className="relative w-full">
        <label htmlFor={`${listId}-input`} className="sr-only">
          חיפוש סרטונים ומושגים
        </label>

        <PlaceholdersAndVanishInput
          id={`${listId}-input`}
          placeholders={placeholders}
          value={query}
          inputRef={inputRef}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onVoiceResult={(transcript) => {
            setQuery(transcript);
            setOpen(true);
            setFocused(true);
          }}
          onClear={clearQuery}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          onFocus={() => {
            setRecent(readRecentSearches());
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              setFocused(false);
            }, 150);
          }}
          aria-label="חיפוש סרטונים ומושגים"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={panelOpen}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
        />

        {trimmed.length >= 2 ? (
          <p
            className={cn(
              "mt-2 text-center text-[11px] tabular-nums",
              isDark ? "text-white/55" : "text-muted",
            )}
            aria-live="polite"
          >
            {loading
              ? "מחפש..."
              : items.length === 1
                ? "תוצאה אחת"
                : `${items.length} תוצאות`}
          </p>
        ) : null}

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
            panelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div
              id={listId}
              role="listbox"
              aria-live="polite"
              dir="rtl"
              className={cn(
                "absolute z-40 mt-2 max-h-80 w-full overflow-auto border border-foreground/15 text-start text-foreground shadow-float",
                "bg-background/90 backdrop-blur-sm",
                !panelOpen && "pointer-events-none",
              )}
            >
              {(showSuggest || showEmpty || loading) && trimmed.length >= 2 ? (
                <div
                  className="sticky top-0 z-[1] border-b border-foreground/10 bg-background/95 px-3 py-2 backdrop-blur-sm"
                  role="group"
                  aria-label="סינון לפי רמת פירוק"
                >
                  <ul className="flex flex-wrap gap-1.5">
                    <li>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex min-h-8 items-center border px-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                          breakdown === null
                            ? "border-action bg-action/10 text-action"
                            : "border-foreground/20 text-foreground/80 hover:border-foreground/40",
                        )}
                        aria-pressed={breakdown === null}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setBreakdown(null)}
                      >
                        כל הרמות
                      </button>
                    </li>
                    {BREAKDOWN_LEVELS.map((level) => (
                      <li key={level}>
                        <button
                          type="button"
                          className={cn(
                            "inline-flex min-h-8 items-center border px-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                            breakdown === level
                              ? "border-action bg-action text-background"
                              : "border-foreground/20 text-foreground/80 hover:border-foreground/40",
                          )}
                          aria-pressed={breakdown === level}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setBreakdown(level)}
                        >
                          {BREAKDOWN_LEVEL_NUMBERS[level]}.{" "}
                          {BREAKDOWN_LEVEL_LABELS[level]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {loading ? (
                <div className="space-y-3 p-4" aria-hidden="true">
                  {[0, 1, 2].map((row) => (
                    <div
                      key={row}
                      className="h-4 w-full animate-pulse rounded-sm bg-foreground/10"
                    />
                  ))}
                </div>
              ) : null}

              {!loading && showZeroState ? (
                <div className="p-3">
                  {recent.length > 0 ? (
                    <div className="mb-3">
                      <p className="px-1 text-xs text-muted">חיפושים אחרונים</p>
                      <ul className="mt-1">
                        {recent.map((term) => (
                          <li key={term} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              className="flex w-full px-3 py-2 text-start text-sm hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => goToSearch(term)}
                            >
                              {term}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {popularConcepts.length > 0 ? (
                    <div>
                      <p className="px-1 text-xs text-muted">מושגים נפוצים</p>
                      <ul className="mt-1">
                        {popularConcepts.slice(0, 8).map((c) => (
                          <li key={c.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              className="flex w-full px-3 py-2 text-start text-sm hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => fillSearch(c.name)}
                            >
                              {c.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!loading && showEmpty ? (
                <div className="space-y-3 p-4 text-sm">
                  <p>
                    לא נמצאו תוצאות ל-&quot;{trimmed}&quot;.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={clearQuery}
                    >
                      נקה חיפוש
                    </button>
                    <Link
                      href="/concepts"
                      className="text-sm text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      למדריך המושגים
                    </Link>
                  </div>
                </div>
              ) : null}

              {!loading && showSuggest
                ? items.map((item, index) => {
                    const label = suggestItemLabel(item);
                    const badge = suggestItemBadge(item);
                    const snippet =
                      item.type === "video" && item.snippet
                        ? item.snippet
                        : null;
                    const key =
                      item.type === "article"
                        ? `article-${item.slug}`
                        : `${item.type}-${item.id}`;

                    return (
                      <button
                        key={key}
                        type="button"
                        id={`${listId}-option-${index}`}
                        role="option"
                        aria-selected={activeIndex === index}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 px-4 py-3 text-start text-sm",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action",
                          activeIndex === index ? "bg-paper" : "hover:bg-paper",
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToSuggestItem(item)}
                      >
                        <span className="min-w-0">
                          <span className="block leading-relaxed">
                            {highlightMatch(label, query)}
                          </span>
                          {snippet ? (
                            <span className="mt-1 block text-xs leading-snug text-muted">
                              "{highlightMatch(snippet, query)}"
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 border border-foreground/15 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                          {badge}
                        </span>
                      </button>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </div>

      {popularConcepts.length > 0 ? (
        <div
          className={cn(
            "mt-5 -mx-1",
            "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]",
            "sm:mx-0 sm:overflow-visible",
          )}
          aria-label={chipsAriaLabel}
        >
          <div
            className={cn(
              "flex w-max max-w-none gap-2 px-1 pb-1",
              "sm:w-full sm:max-w-2xl sm:flex-wrap sm:justify-center sm:px-0 sm:pb-0",
              "mx-auto",
            )}
          >
            {popularConcepts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => fillSearch(c.name)}
                className={cn(
                  "inline-flex shrink-0 items-center border px-3 py-2 text-sm transition",
                  "min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                    : "border-foreground/15 text-foreground/80 hover:border-action hover:text-action",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <RandomInvestigationButton
        variant={variant}
        className="mt-6"
      />
    </div>
  );
}
