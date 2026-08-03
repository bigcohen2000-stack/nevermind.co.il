import Link from "next/link";

import type { ReactNode } from "react";

const LINKS = [
  { href: "/studio", label: "סרטונים", active: "ingestion" as const },
  {
    href: "/studio/analytics",
    label: "חיפושים",
    active: "analytics" as const,
  },
  { href: "/studio/leads", label: "לידים", active: "leads" as const },
  { href: "/studio/quotes", label: "הצעות", active: "quotes" as const },
  { href: "/studio/banners", label: "באנרים", active: "banners" as const },
  {
    href: "/studio/comments",
    label: "תגובות",
    active: "comments" as const,
  },
  {
    href: "/studio/users",
    label: "משתמשים",
    active: "users" as const,
  },
  {
    href: "/studio/guide",
    label: "מדריך",
    active: "guide" as const,
  },
] as const;

type StudioNavProps = {
  active:
    | "ingestion"
    | "analytics"
    | "leads"
    | "quotes"
    | "banners"
    | "comments"
    | "users"
    | "guide";
  actions?: ReactNode;
};

export function StudioNav({ active, actions }: StudioNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="ניווט ניהול"
        className="flex flex-wrap items-center gap-2"
      >
        {LINKS.map((link) => {
          const isActive = active === link.active;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-zinc-100 text-zinc-950"
                  : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      {actions}
    </div>
  );
}
