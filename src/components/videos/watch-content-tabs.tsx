"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Layers, Lightbulb, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type TabId = "insight" | "more" | "talk";

type WatchContentTabsProps = {
  insight: ReactNode;
  more?: ReactNode;
  talk: ReactNode;
  className?: string;
};

const TABS: Array<{ id: TabId; label: string; icon: typeof Lightbulb }> = [
  { id: "insight", label: "תובנה", icon: Lightbulb },
  { id: "more", label: "עוד", icon: Layers },
  { id: "talk", label: "שיחה", icon: MessageCircle },
];

/**
 * Mobile-friendly tabs under the watch player.
 * Keeps must-have panels reachable without a long scroll dump.
 */
export function WatchContentTabs({
  insight,
  more,
  talk,
  className,
}: WatchContentTabsProps) {
  const [tab, setTab] = useState<TabId>("insight");
  const hasMore = Boolean(more);

  const visibleTabs = TABS.filter((t) => t.id !== "more" || hasMore);

  return (
    <div className={cn("border border-foreground/15 bg-paper", className)}>
      <div
        role="tablist"
        aria-label="תוכן ליד הסרטון"
        className="flex border-b border-foreground/10"
      >
        {visibleTabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`watch-tab-${item.id}`}
              aria-controls={`watch-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex min-h-12 flex-1 items-center justify-center gap-2 px-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action",
                active
                  ? "border-b-2 border-action text-action"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        <div
          id="watch-panel-insight"
          role="tabpanel"
          aria-labelledby="watch-tab-insight"
          hidden={tab !== "insight"}
        >
          {insight}
        </div>
        {hasMore ? (
          <div
            id="watch-panel-more"
            role="tabpanel"
            aria-labelledby="watch-tab-more"
            hidden={tab !== "more"}
          >
            {more}
          </div>
        ) : null}
        <div
          id="watch-panel-talk"
          role="tabpanel"
          aria-labelledby="watch-tab-talk"
          hidden={tab !== "talk"}
        >
          {talk}
        </div>
      </div>
    </div>
  );
}
