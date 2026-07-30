"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export type SuggestItem =
  | {
      type: "video";
      id: string;
      youtubeId: string;
      title: string;
      isGated: boolean;
    }
  | {
      type: "concept";
      id: string;
      name: string;
      category: string | null;
    };

export type ConceptChip = {
  id: string;
  name: string;
  category?: string | null;
};

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

function itemLabel(item: SuggestItem): string {
  return item.type === "video" ? item.title : item.name;
}

type HeroSearchProps = {
  popularConcepts?: ConceptChip[];
  className?: string;
  variant?: "light" | "dark";
  initialQuery?: string;
  placeholder?: string;
};

/**
 * Client Hero Search — large RTL input, Lucide icons, 300ms autocomplete.
 */
export function HeroSearch({
  popularConcepts = [],
  className = "",
  variant = "light",
  initialQuery = "",
  placeholder = "חפש סרטון או מושג…",
}: HeroSearchProps) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const isDark = variant === "dark";

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(q)}`,
        );
        const data = (await res.json()) as { items?: SuggestItem[] };
        setItems(data.items ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  const goToSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      goToSearch(itemLabel(items[activeIndex]));
      return;
    }
    goToSearch(query);
  };

  const clearQuery = () => {
    setQuery("");
    setItems([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (open) {
        setOpen(false);
        setActiveIndex(-1);
      } else if (query) {
        clearQuery();
      }
      return;
    }

    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  };

  const iconMuted = isDark ? "text-background/55" : "text-muted";
  const fieldShell = [
    "relative mx-auto w-full max-w-2xl",
    className,
  ].join(" ");

  return (
    <div dir="rtl" className={fieldShell}>
      <form onSubmit={onSubmit} role="search" className="relative w-full">
        <label htmlFor={`${listId}-input`} className="sr-only">
          חיפוש סרטונים ומושגים
        </label>

        {/* Search icon — logical start (right in RTL) */}
        <span
          className={`pointer-events-none absolute top-1/2 start-4 z-10 -translate-y-1/2 ${iconMuted}`}
          aria-hidden="true"
        >
          <Search className="size-5" strokeWidth={1.75} />
        </span>

        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          dir="rtl"
          lang="he"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => items.length > 0 && setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          className={[
            "w-full border text-base outline-none transition",
            "ps-12 pe-12 py-4 sm:py-5 sm:text-lg",
            "focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2",
            isDark
              ? "border-background/30 bg-background/5 text-background placeholder:text-background/45 focus-visible:ring-offset-ink"
              : "border-foreground/15 bg-background text-foreground placeholder:text-muted focus-visible:ring-offset-background",
          ].join(" ")}
        />

        {/* Clear / loading — logical end (left in RTL) */}
        <div className="absolute top-1/2 end-3 z-10 flex -translate-y-1/2 items-center gap-1">
          {loading ? (
            <span
              className={`text-xs ${iconMuted}`}
              aria-live="polite"
            >
              מחפש…
            </span>
          ) : null}
          {query ? (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="נקה חיפוש"
              className={[
                "inline-flex size-9 items-center justify-center rounded-md transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                isDark
                  ? "text-background/70 hover:bg-background/10 hover:text-background"
                  : "text-muted hover:bg-paper hover:text-foreground",
              ].join(" ")}
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        {open && items.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            dir="rtl"
            className="absolute z-40 mt-2 max-h-80 w-full overflow-auto border border-foreground/15 bg-background text-start text-foreground shadow-float"
          >
            {items.map((item, index) => {
              const label = itemLabel(item);
              const meta =
                item.type === "video"
                  ? item.isGated
                    ? "סרטון · לחברים"
                    : "סרטון"
                  : "מושג";

              return (
                <li key={`${item.type}-${item.id}`} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    className={[
                      "flex w-full items-start justify-between gap-3 px-4 py-3 text-start text-sm",
                      activeIndex === index ? "bg-paper" : "hover:bg-paper",
                    ].join(" ")}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToSearch(label)}
                  >
                    <span className="min-w-0 leading-relaxed">
                      {highlightMatch(label, query)}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{meta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </form>

      {popularConcepts.length > 0 ? (
        <div
          className="mt-5 flex flex-wrap justify-center gap-2"
          aria-label="מושגים נפוצים"
        >
          {popularConcepts.map((c) => (
            <Link
              key={c.id}
              href={`/search?q=${encodeURIComponent(c.name)}`}
              className={[
                "border px-3 py-1.5 text-sm transition",
                isDark
                  ? "border-background/30 text-background/90 hover:border-background hover:bg-background/10"
                  : "border-foreground/15 text-foreground/80 hover:border-action hover:text-action",
              ].join(" ")}
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
