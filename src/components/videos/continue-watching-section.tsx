"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getLocalContinueWatchingList,
} from "@/lib/videos/progress-local";
import {
  formatWatchTime,
  progressPercent,
  type ContinueWatchingItem,
} from "@/lib/videos/progress-shared";
import { cn } from "@/lib/utils";

type ContinueWatchingSectionProps = {
  serverItem?: ContinueWatchingItem | null;
  /** home = larger block. strip = compact RTL row for /videos. */
  variant?: "home" | "strip";
};

function mergeItems(
  serverItem: ContinueWatchingItem | null | undefined,
  localItems: ContinueWatchingItem[],
): ContinueWatchingItem[] {
  const byId = new Map<string, ContinueWatchingItem>();
  for (const item of localItems) {
    byId.set(item.youtubeId, item);
  }
  if (serverItem && serverItem.progressSeconds >= 5) {
    const existing = byId.get(serverItem.youtubeId);
    if (
      !existing ||
      new Date(serverItem.updatedAt).getTime() >=
        new Date(existing.updatedAt).getTime()
    ) {
      byId.set(serverItem.youtubeId, serverItem);
    }
  }
  return Array.from(byId.values())
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 8);
}

function ContinueCard({ item }: { item: ContinueWatchingItem }) {
  const percent = progressPercent(item.progressSeconds, item.durationSeconds);
  const thumb =
    item.thumbnailUrl ??
    `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;
  const href = `/watch/${item.youtubeId}?t=${Math.floor(item.progressSeconds)}`;

  return (
    <Link
      href={href}
      className="group flex w-[11.5rem] shrink-0 flex-col overflow-hidden border border-foreground/10 bg-background text-foreground no-underline transition hover:border-foreground/25 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:w-[13rem]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-paper">
        <Image
          src={thumb}
          alt=""
          fill
          className="object-cover"
          sizes="208px"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground/15"
          aria-hidden="true"
        >
          <div
            className="h-full bg-action"
            style={{ width: `${Math.max(percent, 3)}%` }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-action group-focus-visible:text-action">
          {item.title}
        </p>
        <p className="mt-1 text-xs text-muted tabular-nums">
          מ-{formatWatchTime(item.progressSeconds)}
          {item.durationSeconds
            ? ` מתוך ${formatWatchTime(item.durationSeconds)}`
            : ""}
        </p>
      </div>
    </Link>
  );
}

export function ContinueWatchingSection({
  serverItem = null,
  variant = "home",
}: ContinueWatchingSectionProps) {
  const [items, setItems] = useState<ContinueWatchingItem[]>(() =>
    serverItem && serverItem.progressSeconds >= 5 ? [serverItem] : [],
  );

  useEffect(() => {
    const local = getLocalContinueWatchingList(8);
    setItems(mergeItems(serverItem, local));
  }, [serverItem]);

  if (items.length === 0) return null;

  const isStrip = variant === "strip";

  return (
    <section
      aria-labelledby="continue-watching-title"
      className={cn(
        "bg-background text-foreground",
        isStrip && "border-b border-foreground/10",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-6xl",
          isStrip
            ? "px-4 py-6 sm:px-6 sm:py-8"
            : "px-4 py-10 sm:px-6 sm:py-12 lg:py-16",
        )}
      >
        <p className="text-xs font-medium tracking-wide text-muted">
          {isStrip ? "אחרונים שצפית" : "המשך צפייה"}
        </p>
        <h2
          id="continue-watching-title"
          className={cn(
            "mt-2 font-semibold tracking-tight",
            isStrip ? "text-lg sm:text-xl" : "text-2xl lg:text-3xl",
          )}
        >
          ממשיכים מאיפה שעצרתם
        </h2>

        <div
          className={cn(
            "-mx-4 mt-5 flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:mt-6 sm:px-0",
            !isStrip && "sm:mt-8",
          )}
          dir="rtl"
        >
          {items.map((item) => (
            <ContinueCard key={item.youtubeId} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
