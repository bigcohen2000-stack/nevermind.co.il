import Link from "next/link";
import {
  BookOpen,
  Compass,
  Film,
  Layers,
  Search,
  Tag,
} from "lucide-react";

import { MECHANISM_DEFINITIONS } from "@/lib/content/mechanisms";
import { CURATED_CONCEPTS } from "@/lib/concepts/quality";
import {
  searchHref,
  type SearchResultType,
  type SearchVideoFilter,
} from "@/lib/search/search-params";
import { cn } from "@/lib/utils";

type SearchBrowseNavProps = {
  q?: string;
  type?: SearchResultType;
  filter?: SearchVideoFilter;
  className?: string;
};

const QUICK_LINKS = [
  { href: "/videos", label: "סרטונים", icon: Film },
  { href: "/articles", label: "מאמרים", icon: BookOpen },
  { href: "/concepts", label: "מושגים", icon: Tag },
  { href: "/mechanisms", label: "מנגנונים", icon: Compass },
  { href: "/videos/topics", label: "לפי נושא", icon: Layers },
] as const;

const TYPE_TABS: Array<{ id: SearchResultType; label: string }> = [
  { id: "all", label: "הכול" },
  { id: "videos", label: "סרטונים" },
  { id: "articles", label: "מאמרים" },
  { id: "concepts", label: "מושגים" },
];

const SUGGEST_CONCEPTS = CURATED_CONCEPTS.slice(0, 10);

/**
 * Browse shortcuts + result-type tabs + mechanism / concept chips for /search.
 */
export function SearchBrowseNav({
  q = "",
  type = "all",
  filter = "all",
  className,
}: SearchBrowseNavProps) {
  const query = q.trim();

  return (
    <div className={cn("space-y-6", className)}>
      <nav aria-label="ניווט מהיר" className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/15 bg-background px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
            >
              <Icon className="size-3.5 text-action" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {query ? (
        <nav aria-label="סוג תוצאות" className="flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => {
            const active = tab.id === type;
            return (
              <Link
                key={tab.id}
                href={searchHref({
                  q: query,
                  type: tab.id,
                  filter,
                  page: 1,
                  hash: "search-results",
                })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center border px-3 text-sm no-underline transition hover:no-underline",
                  active
                    ? "border-action bg-action text-background"
                    : "border-foreground/15 text-foreground/80 hover:border-foreground/35",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <div>
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-action uppercase">
          <Compass className="size-3.5" aria-hidden />
          חיפוש לפי מנגנון
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {MECHANISM_DEFINITIONS.map((m) => (
            <li key={m.id}>
              <Link
                href={searchHref({ q: m.label, page: 1 })}
                className={cn(
                  "inline-flex min-h-10 items-center border px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline",
                  query === m.label
                    ? "border-action text-action"
                    : "border-foreground/15",
                )}
              >
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-action uppercase">
          <Search className="size-3.5" aria-hidden />
          מושגים להתחלה
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGEST_CONCEPTS.map((name) => (
            <li key={name}>
              <Link
                href={searchHref({ q: name, page: 1 })}
                className={cn(
                  "inline-flex min-h-9 items-center border px-2.5 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline",
                  query === name
                    ? "border-action text-action"
                    : "border-foreground/15 text-foreground/80",
                )}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type SearchJumpLinksProps = {
  articles: number;
  concepts: number;
  videos: number;
  className?: string;
};

/** In-page jump links when a query has mixed results. */
export function SearchJumpLinks({
  articles,
  concepts,
  videos,
  className,
}: SearchJumpLinksProps) {
  const items = [
    articles > 0
      ? { href: "#search-articles", label: `מאמרים (${articles})` }
      : null,
    concepts > 0
      ? { href: "#search-concepts", label: `מושגים (${concepts})` }
      : null,
    videos > 0
      ? { href: "#search-videos", label: `סרטונים (${videos})` }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="קפיצה לתוצאות"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="inline-flex min-h-9 items-center border border-foreground/15 px-3 text-sm text-foreground/80 no-underline transition hover:border-action hover:text-action hover:no-underline"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
