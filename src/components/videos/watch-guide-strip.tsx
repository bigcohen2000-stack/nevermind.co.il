import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Layers,
  Library,
  Lock,
  PenLine,
  Play,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Highlight = {
  id: string;
  icon: keyof typeof HIGHLIGHT_ICONS;
  title: string;
  body: string;
};

type WatchGuideStripProps = {
  highlights: readonly Highlight[];
  title?: string;
  lead?: string;
  tone?: "light" | "dark";
  className?: string;
  actions?: ReactNode;
};

const HIGHLIGHT_ICONS = {
  play: Play,
  sparkles: Sparkles,
  layers: Layers,
  lock: Lock,
  pen: PenLine,
  shield: Shield,
  library: Library,
  timer: Timer,
} as const satisfies Record<string, LucideIcon>;

/**
 * Compact icon facts under the watch player. Same language as membership boards.
 */
export function WatchGuideStrip({
  highlights,
  title = "מה יש כאן",
  lead,
  tone = "light",
  className,
  actions,
}: WatchGuideStripProps) {
  const dark = tone === "dark";

  return (
    <section
      aria-labelledby="watch-guide-title"
      className={cn(
        "border p-4 sm:p-5",
        dark
          ? "border-[#FAFAF8]/15 bg-black/30 text-[#FAFAF8]"
          : "border-foreground/15 bg-paper text-foreground",
        className,
      )}
    >
      <h2
        id="watch-guide-title"
        className="text-lg font-semibold tracking-tight"
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-2 max-w-prose text-sm leading-relaxed",
            dark ? "text-[#FAFAF8]/70" : "text-muted",
          )}
        >
          {lead}
        </p>
      ) : null}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {highlights.map((item) => {
          const Icon = HIGHLIGHT_ICONS[item.icon];
          return (
            <li
              key={item.id}
              className={cn(
                "border p-4",
                dark
                  ? "border-[#FAFAF8]/15 bg-black/40"
                  : "border-foreground/10 bg-background",
              )}
            >
              <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Icon className="size-4 shrink-0 text-action" aria-hidden />
                {item.title}
              </p>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  dark ? "text-[#FAFAF8]/70" : "text-muted",
                )}
              >
                {item.body}
              </p>
            </li>
          );
        })}
      </ul>

      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

type WatchLockedFaqProps = {
  items: readonly { q: string; a: string }[];
  className?: string;
};

export function WatchLockedFaq({ items, className }: WatchLockedFaqProps) {
  return (
    <dl className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div
          key={item.q}
          className="border border-foreground/15 bg-paper p-4"
        >
          <dt className="font-semibold tracking-tight text-foreground">
            {item.q}
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Quick links used under locked / public watch. */
export function WatchExploreLinks({
  className,
}: {
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm", className)}>
      <Link href="/videos" className="link-arrow">
        לכל הסרטונים
      </Link>
      <Link href="/mechanisms" className="link-arrow">
        למנגנונים
      </Link>
      <Link href="/members" className="link-arrow">
        למועדון
      </Link>
      <Link href="/members#membership-prices" className="link-arrow">
        למסגרות מחיר
      </Link>
    </p>
  );
}
