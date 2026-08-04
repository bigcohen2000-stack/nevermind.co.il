"use client";

import { useMemo, useState, type ReactNode } from "react";

type BooksConceptFilterProps = {
  concepts: string[];
  /** Called when filter changes. Parent may ignore and filter locally via render props. */
  children: (active: string | null) => ReactNode;
};

/**
 * Client island: concept chip filter for the books investigation matrix.
 */
export function BooksConceptFilter({
  concepts,
  children,
}: BooksConceptFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  const unique = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of concepts) {
      const t = c.trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
    return out;
  }, [concepts]);

  return (
    <div>
      {unique.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-[11px] text-muted">סינון לפי מושג:</span>
          {unique.map((concept) => {
            const on = active === concept;
            return (
              <button
                key={concept}
                type="button"
                onClick={() => setActive(on ? null : concept)}
                className={
                  on
                    ? "border border-action bg-action px-2.5 py-1 font-bold text-background"
                    : "border border-foreground/15 bg-background px-2.5 py-1 text-muted hover:border-foreground/40"
                }
              >
                #{concept}
              </button>
            );
          })}
        </div>
      ) : null}
      {children(active)}
    </div>
  );
}
