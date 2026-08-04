import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bookmark,
  Calendar,
  Clapperboard,
  Compass,
  Headphones,
  KeyRound,
  Library,
  Radio,
  Search,
  ShieldQuestion,
  User,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type MembersJumpItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const DEFAULT_JUMPS: MembersJumpItem[] = [
  { href: "#login", label: "כניסה", icon: KeyRound },
  { href: "#members-stats-title", label: "עומק", icon: Compass },
  { href: "#membership-benefits", label: "מה כלול", icon: Library },
  { href: "#membership-prices", label: "מחירים", icon: Wallet },
  { href: "#members-syllabus", label: "נושאים", icon: Compass },
  { href: "#members-credibility", label: "אמינות", icon: ShieldQuestion },
  { href: "#members-access-steps", label: "איך נכנסים", icon: Clapperboard },
  { href: "#podcast", label: "פודקאסט", icon: Headphones },
];

const MEMBER_JUMPS: MembersJumpItem[] = [
  { href: "#member-hub", label: "התחנה שלי", icon: Library },
  { href: "/videos?filter=club", label: "מאגר", icon: Clapperboard },
  { href: "/videos", label: "כל הסרטונים", icon: Library },
  { href: "/search", label: "חיפוש", icon: Search },
  { href: "/live", label: "לייב", icon: Radio },
  { href: "#podcast", label: "פיד פרטי", icon: Headphones },
  { href: "/my-list", label: "רשימה", icon: Bookmark },
  { href: "/profile", label: "פרופיל", icon: User },
  { href: "/books", label: "ספרים", icon: BookOpen },
  { href: "/booking", label: "תיאום", icon: Calendar },
  { href: "/concepts", label: "מושגים", icon: Compass },
  { href: "/articles", label: "מאמרים", icon: BookOpen },
];

type MembersJumpNavProps = {
  isMember?: boolean;
  tone?: "dark" | "light";
  className?: string;
};

/**
 * In-page map so visitors find login, benefits, prices, and tools without scrolling blindly.
 */
export function MembersJumpNav({
  isMember = false,
  tone = "dark",
  className,
}: MembersJumpNavProps) {
  const items = isMember ? MEMBER_JUMPS : DEFAULT_JUMPS;
  const dark = tone === "dark";

  return (
    <nav
      aria-label="ניווט בעמוד המועדון"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 border px-3 text-sm no-underline transition hover:no-underline",
              dark
                ? "border-foreground/20 text-foreground hover:border-action hover:text-action"
                : "border-foreground/15 bg-background text-foreground/85 hover:border-action hover:text-action",
            )}
          >
            <Icon className="size-3.5 text-action" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
