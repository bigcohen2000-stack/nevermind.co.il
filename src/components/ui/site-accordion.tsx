"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SiteAccordionItem = {
  id: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

type SiteAccordionProps = {
  items: SiteAccordionItem[];
  className?: string;
};

/**
 * Native details accordion for public site (token colors, RTL).
 */
export function SiteAccordion({ items, className }: SiteAccordionProps) {
  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      {items.map((item) => (
        <details
          key={item.id}
          id={item.id}
          {...(item.defaultOpen ? { open: true } : {})}
          className="group scroll-mt-24 border border-foreground/20 bg-paper open:border-foreground/40"
        >
          <summary className="cursor-pointer list-none px-4 py-4 transition sm:px-5 [&::-webkit-details-marker]:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {item.title}
                </h3>
                {item.summary ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {item.summary}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden
                className="mt-1 shrink-0 text-xs font-medium tracking-wide text-action group-open:hidden"
              >
                פתיחה
              </span>
              <span
                aria-hidden
                className="mt-1 hidden shrink-0 text-xs font-medium tracking-wide text-muted group-open:inline"
              >
                סגירה
              </span>
            </div>
          </summary>
          <div className="border-t border-foreground/10 px-4 py-5 sm:px-5 sm:py-6">
            {item.children}
          </div>
        </details>
      ))}
    </div>
  );
}
