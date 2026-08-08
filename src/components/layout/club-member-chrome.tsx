import Link from "next/link";
import {
  Bookmark,
  Clapperboard,
  Headphones,
  KeyRound,
  Library,
  Radio,
  Search,
} from "lucide-react";

type ClubMemberChromeProps = {
  /** Compact chip in the header. */
  variant?: "chip" | "strip";
};

const LINKS = [
  { href: "/videos?filter=club", label: "ארכיון מועדון", icon: Library },
  { href: "/search", label: "חיפוש תמלילים", icon: Search },
  { href: "/members#podcast", label: "פודקאסט פרטי", icon: Headphones },
  { href: "/live", label: "שידור חי", icon: Radio },
  { href: "/my-list", label: "הרשימה שלי", icon: Bookmark },
  { href: "/members", label: "המועדון", icon: KeyRound },
  { href: "/videos", label: "כל הסרטונים", icon: Clapperboard },
] as const;

/**
 * Visible club-only chrome: chip or quick-link strip.
 * Only mount when access tier is club (entitled / club cookie).
 */
export function ClubMemberChrome({ variant = "chip" }: ClubMemberChromeProps) {
  if (variant === "chip") {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/members"
          className="inline-flex min-h-10 items-center gap-1.5 border border-action/50 bg-action/[0.08] px-2.5 text-xs font-semibold tracking-wide text-action no-underline transition hover:border-action hover:bg-action/[0.14] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          aria-label="מועדון פעיל במכשיר הזה"
        >
          <KeyRound className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
          מועדון פעיל
        </Link>
        <Link
          href="/videos?filter=club"
          className="hidden min-h-10 items-center border border-foreground/20 bg-paper px-2.5 text-xs font-medium text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action xl:inline-flex"
        >
          ארכיון
        </Link>
      </div>
    );
  }

  return (
    <nav
      aria-label="קיצורי מועדון"
      className="border-b border-foreground/15 bg-background text-foreground"
    >
      <ul className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className="inline-flex min-h-9 items-center gap-1.5 border border-transparent px-2.5 text-xs font-medium text-foreground no-underline transition hover:border-action/40 hover:text-action hover:no-underline"
              >
                <Icon className="size-3.5 text-action" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
