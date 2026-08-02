"use client";

import type { ReactNode } from "react";

export type StudioAccordionItem = {
  id: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

type StudioAccordionProps = {
  items: StudioAccordionItem[];
};

/**
 * Simple native details/summary accordion. Multiple sections may stay open.
 */
export function StudioAccordion({ items }: StudioAccordionProps) {
  return (
    <div className="mt-8 space-y-3" dir="rtl">
      {items.map((item) => (
        <details
          key={item.id}
          id={item.id}
          open={item.defaultOpen}
          className="scroll-mt-6 border border-zinc-800 bg-zinc-900/40 group"
        >
          <summary className="cursor-pointer list-none border-b border-transparent px-5 py-4 transition group-open:border-zinc-800 [&::-webkit-details-marker]:hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">
                  {item.title}
                </h2>
                {item.summary ? (
                  <p className="mt-1 text-sm text-zinc-400">{item.summary}</p>
                ) : null}
              </div>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-xs text-zinc-500 group-open:hidden"
              >
                פתיחה
              </span>
              <span
                aria-hidden
                className="mt-0.5 hidden shrink-0 text-xs text-zinc-500 group-open:inline"
              >
                סגירה
              </span>
            </div>
          </summary>
          <div className="px-5 py-5 sm:px-6 sm:py-6">{item.children}</div>
        </details>
      ))}
    </div>
  );
}
