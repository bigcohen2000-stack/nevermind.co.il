import Link from "next/link";

import { CURATED_CONCEPTS } from "@/lib/concepts/quality";
import {
  videosBrowseHref,
  type VideoBrowseDuration,
} from "@/lib/videos/browse-params";
import {
  BREAKDOWN_LEVELS,
  BREAKDOWN_LEVEL_LABELS,
  BREAKDOWN_LEVEL_NUMBERS,
  type BreakdownLevel,
} from "@/lib/videos/investigation";
import type {
  VideoBrowseFilter,
  VideoBrowseSort,
} from "@/lib/videos/queries";
import { cn } from "@/lib/utils";

type VideosBrowseControlsProps = {
  filter: VideoBrowseFilter;
  sort: VideoBrowseSort;
  concept?: string;
  breakdown?: BreakdownLevel;
  duration?: VideoBrowseDuration;
};

const FILTERS: { id: VideoBrowseFilter; label: string }[] = [
  { id: "all", label: "הכול" },
  { id: "open", label: "פתוחים" },
  { id: "club", label: "מועדון" },
];

const SORTS: { id: VideoBrowseSort; label: string }[] = [
  { id: "newest", label: "חדש קודם" },
  { id: "oldest", label: "ישן קודם" },
  { id: "title", label: "לפי כותרת" },
  { id: "longest", label: "הארוך קודם" },
];

const DURATIONS: { id: VideoBrowseDuration; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "short", label: "קצר (עד 10 דק')" },
  { id: "long", label: "עומק (20+ דק')" },
];

const PEEK_CONCEPTS = 4;

/**
 * Open filter + sort strip for /videos. Uses links so crawlers see variants.
 * Concepts sit in a collapsed accordion so they do not dominate the page.
 */
export function VideosBrowseControls({
  filter,
  sort,
  concept,
  breakdown,
  duration = "all",
}: VideosBrowseControlsProps) {
  const activeConcept = concept?.trim() || undefined;
  const activeBreakdown = breakdown;
  const activeDuration = duration;
  const peekBase = CURATED_CONCEPTS.slice(0, PEEK_CONCEPTS);
  const peek =
    activeConcept &&
    !peekBase.includes(activeConcept as (typeof CURATED_CONCEPTS)[number]) &&
    CURATED_CONCEPTS.includes(activeConcept as (typeof CURATED_CONCEPTS)[number])
      ? ([...peekBase.slice(0, PEEK_CONCEPTS - 1), activeConcept] as string[])
      : ([...peekBase] as string[]);
  const rest = CURATED_CONCEPTS.filter((name) => !peek.includes(name));

  const hrefBase = {
    filter,
    sort,
    concept: activeConcept,
    breakdown: activeBreakdown,
    duration: activeDuration,
  } as const;

  return (
    <div
      id="videos-browse"
      className="mt-8 scroll-mt-24 border border-foreground/15 bg-background p-4 sm:p-5"
    >
      <p className="text-xs font-medium tracking-wide text-action">סינון ומיון</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">הצגה</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = item.id === filter;
              return (
                <li key={item.id}>
                  <Link
                    href={videosBrowseHref({
                      ...hrefBase,
                      filter: item.id,
                    })}
                    className={cn(
                      "inline-flex min-h-10 items-center border px-3 text-sm no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                      active
                        ? "border-action bg-action text-background"
                        : "border-foreground/20 text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">סידור</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {SORTS.map((item) => {
              const active = item.id === sort;
              return (
                <li key={item.id}>
                  <Link
                    href={videosBrowseHref({
                      ...hrefBase,
                      sort: item.id,
                    })}
                    className={cn(
                      "inline-flex min-h-10 items-center border px-3 text-sm no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-5 border-t border-foreground/10 pt-4">
        <p className="text-sm font-medium text-foreground">משך צפייה</p>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="סינון לפי משך">
          {DURATIONS.map((item) => {
            const active = activeDuration === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={videosBrowseHref({
                    ...hrefBase,
                    duration: item.id,
                  })}
                  className={cn(
                    "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                    active
                      ? "border-action bg-action text-background"
                      : "border-foreground/20 text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 border-t border-foreground/10 pt-4">
        <p className="text-sm font-medium text-foreground">רמת פירוק</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          <li>
            <Link
              href={videosBrowseHref({
                ...hrefBase,
                breakdown: undefined,
              })}
              className={cn(
                "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                !activeBreakdown
                  ? "border-action bg-action/10 text-action"
                  : "border-foreground/20 text-foreground",
              )}
              aria-current={!activeBreakdown ? "page" : undefined}
            >
              כל הרמות
            </Link>
          </li>
          {BREAKDOWN_LEVELS.map((level) => {
            const active = activeBreakdown === level;
            return (
              <li key={level}>
                <Link
                  href={videosBrowseHref({
                    ...hrefBase,
                    breakdown: level,
                  })}
                  className={cn(
                    "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                    active
                      ? "border-action bg-action text-background"
                      : "border-foreground/20 text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {BREAKDOWN_LEVEL_NUMBERS[level]}.{" "}
                  {BREAKDOWN_LEVEL_LABELS[level]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 border-t border-foreground/10 pt-4">
        <p className="text-sm font-medium text-foreground">
          מושג
          {activeConcept ? (
            <span className="ms-2 font-normal text-action">
              ({activeConcept})
            </span>
          ) : null}
        </p>

        <ul className="mt-2 flex flex-wrap gap-2">
          <li>
            <Link
              href={videosBrowseHref({
                ...hrefBase,
                concept: undefined,
              })}
              className={cn(
                "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                !activeConcept
                  ? "border-action bg-action/10 text-action"
                  : "border-foreground/20 text-foreground",
              )}
              aria-current={!activeConcept ? "page" : undefined}
            >
              כל המושגים
            </Link>
          </li>
          {peek.map((name) => {
            const active = activeConcept === name;
            return (
              <li key={name}>
                <Link
                  href={videosBrowseHref({
                    ...hrefBase,
                    concept: name,
                  })}
                  className={cn(
                    "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                    active
                      ? "border-action bg-action text-background"
                      : "border-foreground/20 text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>

        {rest.length > 0 ? (
          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-xs text-muted marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">
                עוד מושגים ({rest.length})
              </span>
              <span className="hidden group-open:inline">
                הסתרת מושגים נוספים
              </span>
            </summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {rest.map((name) => {
                const active = activeConcept === name;
                return (
                  <li key={name}>
                    <Link
                      href={videosBrowseHref({
                        ...hrefBase,
                        concept: name,
                      })}
                      className={cn(
                        "inline-flex min-h-9 items-center border px-2.5 text-xs no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
                        active
                          ? "border-action bg-action text-background"
                          : "border-foreground/20 text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null}

        <p className="mt-3 text-xs">
          <Link
            href="/concepts"
            className="text-muted no-underline hover:text-action hover:no-underline"
          >
            למדריך המושגים המלא
          </Link>
        </p>
      </div>
    </div>
  );
}
