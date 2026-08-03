import Link from "next/link";

export type ConceptCardItem = {
  name: string;
  category: string | null;
  videoCount: number;
};

function formatVideoCount(count: number): string {
  if (count === 1) return "סרטון אחד";
  return `${count} סרטונים`;
}

/**
 * Editorial numbered directory. Links each concept to search.
 * Server component: no client hover cards.
 */
export function ConceptDirectoryGrid({ items }: { items: ConceptCardItem[] }) {
  if (items.length === 0) return null;

  return (
    <ol className="mt-10 border-t border-foreground/10">
      {items.map((item, i) => (
        <li key={item.name} className="border-b border-foreground/10">
          <Link
            href={`/search?q=${encodeURIComponent(item.name)}`}
            className="row-link group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 py-5 sm:gap-x-6 sm:py-6"
          >
            <span
              aria-hidden="true"
              className="text-sm font-semibold tabular-nums text-foreground/25 transition-colors duration-200 group-hover:text-action/40"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold tracking-tight transition-colors duration-200 group-hover:text-action sm:text-lg">
                {item.name}
              </span>
              {item.category?.trim() ? (
                <span className="mt-1 block text-sm text-muted">
                  {item.category}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-sm text-foreground/60 tabular-nums">
              {formatVideoCount(item.videoCount)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
