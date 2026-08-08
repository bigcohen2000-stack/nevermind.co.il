"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

import { useCommandPalette } from "@/components/search/command-palette-context";
import { useSearchHotkey } from "@/hooks/use-search-hotkey";
import { pushRecentSearch } from "@/lib/recent-searches";
import { pushUserSearchHistory } from "@/actions/search-history";
import {
  suggestItemBadge,
  suggestItemHref,
  suggestItemLabel,
  type SuggestItem,
} from "@/lib/search/types";
import { formatTimestampLabel } from "@/lib/videos/timestamp";
import { cn } from "@/lib/utils";

/**
 * Global Raycast-style search palette (⌘K / /). Mount once in the site shell.
 */
export function CommandPalette() {
  const { open, closePalette, openPalette } = useCommandPalette();
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [hasFetchedEmpty, setHasFetchedEmpty] = useState(false);

  useSearchHotkey({ onOpen: openPalette });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setItems([]);
    setActiveIndex(-1);
    setHasFetchedEmpty(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePalette]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setLoading(false);
      setHasFetchedEmpty(false);
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
        setActiveIndex(-1);
        setHasFetchedEmpty(true);
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

    return () => window.clearTimeout(handle);
  }, [query, open]);

  function goToSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    pushRecentSearch(t);
    void pushUserSearchHistory(t);
    closePalette();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  function goToItem(item: SuggestItem) {
    const label = suggestItemLabel(item);
    pushRecentSearch(label);
    void pushUserSearchHistory(label);
    closePalette();
    router.push(suggestItemHref(item));
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
    if (e.key === "ArrowDown" && items.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  }

  if (!mounted || !open) return null;

  const trimmed = query.trim();
  const showEmpty =
    trimmed.length >= 2 && !loading && hasFetchedEmpty && items.length === 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/55 px-3 pt-[12vh] sm:px-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${listId}-title`}
        dir="rtl"
        className="w-full max-w-xl border border-foreground/20 bg-background text-foreground shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <p
            id={`${listId}-title`}
            className="font-mono text-xs tracking-wide text-muted"
          >
            חיפוש מאגר: ⌘K
          </p>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center border border-foreground/15 text-muted hover:border-foreground/40 hover:text-foreground"
            aria-label="סגירת חיפוש"
            onClick={closePalette}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} role="search" className="relative">
          <label htmlFor={`${listId}-input`} className="sr-only">
            חיפוש בסרטונים ומושגים
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-muted"
          >
            <Search className="h-4 w-4" />
          </span>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="חפש סרטון, מושג או ציטוט תמליל..."
            className="w-full border-0 bg-transparent py-4 pe-4 ps-11 text-base outline-none placeholder:text-muted"
            aria-controls={`${listId}-list`}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
            }
          />
        </form>

        <div
          id={`${listId}-list`}
          role="listbox"
          className="max-h-[min(50vh,22rem)] overflow-y-auto border-t border-foreground/10"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-muted">מחפש...</p>
          ) : null}

          {showEmpty ? (
            <div className="space-y-3 px-4 py-4 text-sm">
              <p>לא נמצאו תוצאות ל-&quot;{trimmed}&quot;.</p>
              <Link
                href="/concepts"
                className="text-action underline-offset-2 hover:underline"
                onClick={closePalette}
              >
                למדריך המושגים
              </Link>
            </div>
          ) : null}

          {!loading && items.length > 0
            ? items.map((item, index) => {
                const label = suggestItemLabel(item);
                const badge = suggestItemBadge(item);
                const snippet =
                  item.type === "video" && item.snippet ? item.snippet : null;
                const startLabel =
                  item.type === "video" && item.startSeconds != null
                    ? formatTimestampLabel(item.startSeconds)
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
                      activeIndex === index ? "bg-paper" : "hover:bg-paper",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToItem(item)}
                  >
                    <span className="min-w-0">
                      <span className="block leading-relaxed">{label}</span>
                      {snippet ? (
                        <span className="mt-1 block text-xs leading-snug text-muted">
                          {startLabel ? (
                            <span className="me-1.5 inline-block border border-foreground/15 px-1 py-0.5 font-mono text-[10px] tabular-nums text-action">
                              {startLabel}
                            </span>
                          ) : null}
                          &quot;{snippet}&quot;
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

          {!loading && trimmed.length < 2 ? (
            <p className="px-4 py-3 text-sm text-muted">
              הקלידו לפחות שני תווים. חיצים לניווט, Enter לבחירה, Esc לסגירה.
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
