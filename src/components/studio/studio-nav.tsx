import Link from "next/link";
import {
  BookOpen,
  Clapperboard,
  FileText,
  Inbox,
  KeyRound,
  Mail,
  Megaphone,
  MessageSquare,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const LINKS: {
  href: string;
  label: string;
  active:
    | "ingestion"
    | "club"
    | "analytics"
    | "leads"
    | "newsletter"
    | "quotes"
    | "banners"
    | "comments"
    | "users"
    | "guide";
  icon: LucideIcon;
}[] = [
  {
    href: "/studio",
    label: "סרטונים",
    active: "ingestion",
    icon: Clapperboard,
  },
  {
    href: "/studio/club",
    label: "חברי מועדון",
    active: "club",
    icon: KeyRound,
  },
  {
    href: "/studio/analytics",
    label: "חיפושים",
    active: "analytics",
    icon: Search,
  },
  { href: "/studio/leads", label: "לידים", active: "leads", icon: Inbox },
  {
    href: "/studio/newsletter",
    label: "עדכון במייל",
    active: "newsletter",
    icon: Mail,
  },
  {
    href: "/studio/quotes",
    label: "הצעות",
    active: "quotes",
    icon: FileText,
  },
  {
    href: "/studio/banners",
    label: "באנרים",
    active: "banners",
    icon: Megaphone,
  },
  {
    href: "/studio/comments",
    label: "תגובות",
    active: "comments",
    icon: MessageSquare,
  },
  { href: "/studio/users", label: "משתמשים", active: "users", icon: Users },
  {
    href: "/studio/guide",
    label: "מדריך",
    active: "guide",
    icon: BookOpen,
  },
];

export type StudioNavActive = (typeof LINKS)[number]["active"];

type StudioNavProps = {
  active: StudioNavActive;
  actions?: ReactNode;
};

export function StudioNav({ active, actions }: StudioNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="ניווט ניהול"
        className="flex max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LINKS.map((link) => {
          const isActive = active === link.active;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border px-3 text-xs font-medium transition ${
                isActive
                  ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      {actions}
    </div>
  );
}
