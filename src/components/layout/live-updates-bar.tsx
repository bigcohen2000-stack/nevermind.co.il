"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { LiveUpdateItem } from "@/lib/site/live-updates";
import { cn } from "@/lib/utils";

type LiveUpdatesBarProps = {
  items: LiveUpdateItem[];
};

function UpdateChip({ item }: { item: LiveUpdateItem }) {
  const isLive = item.kind === "live";

  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex max-w-[min(85vw,28rem)] shrink-0 items-baseline gap-2",
        "rounded-sm px-1 py-0.5 no-underline transition hover:no-underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
      )}
    >
      {isLive ? (
        <span
          className="relative mt-1 inline-flex size-1.5 shrink-0"
          aria-hidden="true"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-action/70 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-action" />
        </span>
      ) : null}
      <span
        className={cn(
          "shrink-0 text-[11px] font-medium tracking-wide sm:text-xs",
          isLive ? "text-action" : "text-action",
        )}
      >
        {item.dateLabel}
      </span>
      <span className="shrink-0 text-[11px] text-[#FAFAF8]/55 sm:text-xs">
        {item.eyebrow}
      </span>
      <span className="min-w-0 truncate text-xs text-[#FAFAF8]/90 sm:text-sm">
        {item.title}
      </span>
    </Link>
  );
}

/**
 * Header updates scroller: live schedule, new videos, articles.
 * Marquee on wide screens. Manual horizontal scroll on touch.
 * Falls back to a single rotator when prefers-reduced-motion.
 */
export function LiveUpdatesBar({ items }: LiveUpdatesBarProps) {
  const [online, setOnline] = useState(true);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!reduceMotion || items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [items.length, reduceMotion]);

  const current = items[Math.min(index, Math.max(0, items.length - 1))];
  const loop = items.length > 0 ? [...items, ...items] : [];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-b text-foreground",
        online
          ? "border-foreground/10 bg-ink text-[#FAFAF8]"
          : "border-action/40 bg-[#1A1A1A] text-[#FAFAF8]",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-1.5 sm:gap-4 sm:px-6">
        <div
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
          title={online ? "מחובר לרשת" : "מנותק מהרשת"}
        >
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-flex size-2 rounded-full sm:size-2.5",
              online ? "bg-emerald-400" : "bg-action",
            )}
          >
            {online ? (
              <span
                className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : null}
          </span>
          <span className="hidden text-[11px] font-medium tracking-wide sm:inline sm:text-xs">
            {online ? "עדכונים" : "מנותק"}
          </span>
        </div>

        <span
          aria-hidden="true"
          className="hidden h-3 w-px shrink-0 bg-[#FAFAF8]/20 sm:block"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          {!online ? (
            <p className="truncate text-xs leading-relaxed text-[#FAFAF8]/85 sm:text-sm">
              אין רשת כרגע. אפשר להמשיך במה שכבר נטען במכשיר.
            </p>
          ) : reduceMotion ? (
            current ? <UpdateChip item={current} /> : null
          ) : (
            <div
              className="nm-updates-marquee-mask overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-hidden"
              dir="rtl"
            >
              <div
                className={cn(
                  "nm-updates-marquee flex w-max items-center gap-6 pe-6 sm:gap-10 sm:pe-10",
                  items.length > 1 &&
                    "sm:animate-nm-updates-marquee motion-reduce:animate-none",
                )}
              >
                {(items.length > 1 ? loop : items).map((item, i) => (
                  <UpdateChip
                    key={`${item.id}-${i}`}
                    item={item}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
