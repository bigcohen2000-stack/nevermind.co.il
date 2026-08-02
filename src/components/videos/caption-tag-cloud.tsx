import Link from "next/link";

import type { CaptionTag } from "@/lib/videos/caption-tag-cloud";

type CaptionTagCloudProps = {
  tags: CaptionTag[];
};

/**
 * Clickable keyword navigation from captions + investigation tags.
 */
export function CaptionTagCloud({ tags }: CaptionTagCloudProps) {
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
        מילות מפתח מהתמליל. לחצו כדי לחקור הלאה בחיפוש.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="תגיות מתמליל">
        {tags.map((tag) => (
          <li key={tag.label}>
            <Link
              href={`/search?q=${encodeURIComponent(tag.label)}`}
              className={
                tag.kind === "investigation"
                  ? "inline-flex border border-action px-3 py-1.5 text-sm text-action no-underline hover:bg-action hover:text-[#FAFAF8] hover:no-underline"
                  : "inline-flex border border-[#121212]/25 px-3 py-1.5 text-sm text-foreground no-underline hover:border-action hover:text-action hover:no-underline"
              }
            >
              {tag.label}
              {tag.count > 1 ? (
                <span className="ms-2 text-muted">{tag.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
