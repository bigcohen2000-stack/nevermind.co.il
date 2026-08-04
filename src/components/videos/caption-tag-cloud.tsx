"use client";

import Link from "next/link";

import { useWatchSeek } from "@/components/videos/watch-seek-context";
import type { CaptionTag } from "@/lib/videos/caption-tag-cloud";
import { formatTimestampLabel } from "@/lib/videos/timestamp";

type CaptionTagCloudProps = {
  tags: CaptionTag[];
};

/**
 * Keyword cloud from captions. Seeks when startSeconds is known, else search.
 */
export function CaptionTagCloud({ tags }: CaptionTagCloudProps) {
  const seek = useWatchSeek();

  if (tags.length === 0) return null;

  return (
    <section
      className="mt-8 border border-[#121212] bg-background p-5 sm:p-6"
      aria-labelledby="caption-tag-cloud-title"
    >
      <p
        id="caption-tag-cloud-title"
        className="text-xs font-medium tracking-wide text-action"
      >
        ענן כתוביות
      </p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        מילות מפתח מהתמליל. לחיצה עם זמן קופצת לרגע בסרטון. בלי זמן עוברים
        לחיפוש.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="תגיות מתמליל">
        {tags.map((tag) => {
          const canSeek =
            seek != null &&
            tag.startSeconds != null &&
            tag.startSeconds >= 0;
          const timeLabel =
            tag.startSeconds != null
              ? formatTimestampLabel(tag.startSeconds)
              : null;
          const className =
            tag.kind === "investigation"
              ? "inline-flex items-center border border-action px-3 py-1.5 text-sm text-action no-underline hover:bg-action hover:text-[#FAFAF8] hover:no-underline"
              : "inline-flex items-center border border-[#121212]/25 px-3 py-1.5 text-sm text-foreground no-underline hover:border-action hover:text-action hover:no-underline";

          if (canSeek) {
            return (
              <li key={tag.label}>
                <button
                  type="button"
                  className={className}
                  onClick={() => seek.seekTo(tag.startSeconds!)}
                >
                  {tag.label}
                  {timeLabel ? (
                    <span className="ms-2 font-mono text-[10px] tabular-nums opacity-80">
                      {timeLabel}
                    </span>
                  ) : null}
                  {tag.count > 1 ? (
                    <span className="ms-2 text-muted">{tag.count}</span>
                  ) : null}
                </button>
              </li>
            );
          }

          return (
            <li key={tag.label}>
              <Link
                href={`/search?q=${encodeURIComponent(tag.label)}`}
                className={className}
              >
                {tag.label}
                {tag.count > 1 ? (
                  <span className="ms-2 text-muted">{tag.count}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
