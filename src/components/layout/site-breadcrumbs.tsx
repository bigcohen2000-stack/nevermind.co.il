"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildTrailFromPathname } from "@/lib/breadcrumbs/trail";
import { cn } from "@/lib/utils";

type BreadcrumbTitleContextValue = {
  title: string | null;
  setTitle: (title: string | null) => void;
};

const BreadcrumbTitleContext =
  createContext<BreadcrumbTitleContextValue | null>(null);

export function BreadcrumbTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  const value = useMemo(() => ({ title, setTitle }), [title]);
  return (
    <BreadcrumbTitleContext.Provider value={value}>
      {children}
    </BreadcrumbTitleContext.Provider>
  );
}

/**
 * Call from a page to override the last crumb label (video title, article title).
 */
export function SetBreadcrumbCurrent({ title }: { title: string }) {
  const ctx = useContext(BreadcrumbTitleContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setTitle(title);
    return () => ctx.setTitle(null);
  }, [ctx, title]);
  return null;
}

/**
 * Visible RTL breadcrumbs under the site header. Hidden on home.
 */
export function SiteBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const ctx = useContext(BreadcrumbTitleContext);
  const items = buildTrailFromPathname(pathname, ctx?.title);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="פירורי לחם"
      className={cn(
        "border-b border-foreground/10 bg-background/80",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-2.5 sm:px-6">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 text-sm text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.path}-${index}`} className="flex items-center gap-x-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-foreground/35">
                    /
                  </span>
                ) : null}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="max-w-[16rem] truncate text-foreground sm:max-w-md"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="text-muted no-underline transition-colors hover:text-foreground hover:no-underline"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
