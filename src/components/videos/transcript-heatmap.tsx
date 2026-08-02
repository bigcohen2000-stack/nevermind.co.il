"use client";

import { useId, useState } from "react";

import { useWatchSeek } from "@/components/videos/watch-seek-context";
import {
  formatMinuteLabel,
  heatColor,
  type HeatmapBucket,
} from "@/lib/videos/heatmap";
import { cn } from "@/lib/utils";

type TranscriptHeatmapProps = {
  buckets: HeatmapBucket[];
  className?: string;
};

/**
 * Segmented density bar: gray = talk, action-red intensity = concept density.
 * Hover shows concepts. Click seeks the YouTube player.
 */
export function TranscriptHeatmap({
  buckets,
  className,
}: TranscriptHeatmapProps) {
  const labelId = useId();
  const seek = useWatchSeek();
  const [active, setActive] = useState<number | null>(null);

  if (buckets.length === 0) return null;

  const hotCount = buckets.filter((b) => b.concepts.length > 0).length;
  if (hotCount === 0 && buckets.every((b) => b.density <= 0)) {
    return null;
  }

  return (
    <section
      className={cn("mt-6", className)}
      aria-labelledby={labelId}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id={labelId} className="text-sm font-medium text-foreground/80">
          מפת חום של מושגים
        </h2>
        <p className="text-xs text-muted">
          כהה יותר = יותר מושגים בדקה. לחיצה מעבירה לזמן.
        </p>
      </div>

      <div
        className="relative mt-3"
        onMouseLeave={() => setActive(null)}
      >
        <div
          role="list"
          aria-label="מקטעי זמן לפי צפיפות מושגים"
          className="flex h-3 w-full overflow-hidden rounded-sm border border-foreground/15"
        >
          {buckets.map((bucket, index) => {
            const isHot = bucket.concepts.length > 0;
            return (
              <button
                key={bucket.minute}
                type="button"
                role="listitem"
                className={cn(
                  "relative h-full min-w-0 flex-1 border-e border-foreground/10 last:border-e-0",
                  "transition-[filter] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-action",
                  isHot ? "cursor-pointer hover:brightness-110" : "cursor-default",
                )}
                style={{ backgroundColor: heatColor(bucket.density) }}
                aria-label={`${formatMinuteLabel(bucket.startSeconds)}${
                  isHot
                    ? `: ${bucket.concepts.join(", ")}`
                    : ": ללא מושגים מסומנים"
                }`}
                title={
                  isHot
                    ? bucket.concepts.join(" · ")
                    : formatMinuteLabel(bucket.startSeconds)
                }
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => {
                  if (!seek) return;
                  seek.seekTo(bucket.startSeconds);
                }}
              />
            );
          })}
        </div>

        {active != null && buckets[active] ? (
          <div
            role="tooltip"
            className="pointer-events-none absolute start-0 top-full z-20 mt-2 max-w-sm border border-foreground/15 bg-background px-3 py-2 text-start text-xs text-foreground shadow-soft"
          >
            <p className="font-medium tabular-nums">
              {formatMinuteLabel(buckets[active].startSeconds)}
              {" – "}
              {formatMinuteLabel(buckets[active].endSeconds)}
            </p>
            {buckets[active].concepts.length > 0 ? (
              <p className="mt-1 leading-relaxed text-foreground/80">
                {buckets[active].concepts.join(" · ")}
              </p>
            ) : (
              <p className="mt-1 text-muted">דיבור רגיל בדקה הזו.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
