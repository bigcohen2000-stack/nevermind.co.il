"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";

import {
  suggestItemHref,
  suggestItemLabel,
  type SuggestItem,
} from "@/lib/search/types";
import { pushRecentSearch } from "@/lib/recent-searches";
import { cn } from "@/lib/utils";
import { useSearchHotkey } from "@/hooks/use-search-hotkey";

type HeaderSearchProps = {
  className?: string;
  /** When true, fills available width (mobile drawer). */
  expanded?: boolean;
  onNavigate?: () => void;
};

/**
 * Compact sticky-header search. Reuses /api/search/suggest. No vanish animation.
 */
export function HeaderSearch({
  className = "",
  expanded = false,
  onNavigate,
}: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim();
  const showSuggest = open && items.length > 0;
  const panelOpen = focused && (loading || showSuggest || trimmed.length >= 2);

  useSearchHotkey(inputRef);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as { items?: SuggestItem[] };
        setItems(data.items ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!shellRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function goToSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    pushRecentSearch(t);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(t)}`);
    setOpen(false);
    setFocused(false);
  }

  function goToItem(item: SuggestItem) {
    const label = suggestItemLabel(item);
    pushRecentSearch(label);
    onNavigate?.();
    if (item.type === "article") {
      router.push(suggestItemHref(item));
    } else {
      router.push(`/search?q=${encodeURIComponent(label)}`);
    }
    setOpen(false);
    setFocused(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      goToItem(items[activeIndex]!);
      return;
    }
    goToSearch(query);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        e.preventDefault();
        setQuery("");
        setItems([]);
        setActiveIndex(-1);
        inputRef.current?.focus();
        return;
      }
      setOpen(false);
      setFocused(false);
      inputRef.current?.blur();
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
  }

  function clearQuery() {
    setQuery("");
    setItems([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  const hideOnSearchPage = pathname === "/search" && !expanded;

  if (hideOnSearchPage) {
    return null;
  }

  return (
    <div
      ref={shellRef}
      dir="rtl"
      className={cn(
        "relative",
        expanded ? "w-full" : "w-full max-w-[14rem] sm:max-w-[16rem] xl:max-w-[18rem]",
        className,
      )}
    >
      <form onSubmit={onSubmit} role="search" className="relative">
        <label htmlFor={listId + "-input"} className="sr-only">
          חיפוש באתר
        </label>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted"
        >
          🔍
        </span>
        <input
          ref={inputRef}
          id={listId + "-input"}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              setFocused(false);
            }, 150);
          }}
          onKeyDown={onKeyDown}
          placeholder="חיפוש באתר"
          autoComplete="off"
          spellCheck={false}
          aria-label="חיפוש סרטונים, מאמרים ומושגים"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={panelOpen}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          className={cn(
            "min-h-10 w-full rounded-md border border-foreground/20 bg-background/80 ps-9 text-sm text-foreground",
            query ? "pe-10" : "pe-3",
            "placeholder:text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
            expanded && "min-h-11",
          )}
        />
        {query ? (
          <button
            type="button"
            aria-label="ניקוי חיפוש"
            title="ניקוי"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearQuery}
            className="absolute inset-y-0 end-1 inline-flex min-w-9 items-center justify-center text-muted transition hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </form>

      {panelOpen ? (
        <div
          id={listId}
          role="listbox"
          aria-live="polite"
          className="absolute z-[60] mt-1 max-h-72 w-full min-w-[16rem] overflow-auto border border-foreground/15 bg-background text-start text-sm shadow-float end-0"
        >
          {loading ? (
            <div className="space-y-2 p-3" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-3.5 w-full animate-pulse rounded-sm bg-foreground/10"
                />
              ))}
            </div>
          ) : null}

          {!loading && trimmed.length >= 2 && items.length === 0 ? (
            <p className="p-3 text-muted">לא נמצאו תוצאות.</p>
          ) : null}

          {!loading && showSuggest
            ? items.map((item, index) => {
                const label = suggestItemLabel(item);
                const meta =
                  item.type === "video"
                    ? "סרטון"
                    : item.type === "article"
                      ? "מאמר"
                      : "מושג";
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
                      "flex w-full items-start justify-between gap-2 px-3 py-2.5 text-start",
                      activeIndex === index ? "bg-paper" : "hover:bg-paper",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToItem(item)}
                  >
                    <span className="min-w-0 leading-snug">{label}</span>
                    <span className="shrink-0 text-xs text-muted">{meta}</span>
                  </button>
                );
              })
            : null}
        </div>
      ) : null}
    </div>
  );
}
