import Link from "next/link";

import { getWatchHref } from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

type WatchPrevNextProps = {
  prev: Pick<Video, "id" | "youtube_id" | "title" | "is_gated" | "is_unlisted"> | null;
  next: Pick<Video, "id" | "youtube_id" | "title" | "is_gated" | "is_unlisted"> | null;
};

/**
 * Previous / next navigation under the watch player.
 */
export function WatchPrevNext({ prev, next }: WatchPrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="flex flex-wrap items-stretch gap-2"
      aria-label="ניווט בין סרטונים"
    >
      {prev ? (
        <Link
          href={getWatchHref(prev)}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 border border-foreground/15 px-3 py-2 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:flex-none sm:max-w-[48%]"
        >
          <span aria-hidden="true" className="shrink-0 text-muted">
            ←
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] text-muted">הסרטון הקודם</span>
            <span className="block truncate font-medium">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden min-h-11 flex-1 sm:block" aria-hidden="true" />
      )}
      {next ? (
        <Link
          href={getWatchHref(next)}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-end gap-2 border border-foreground/15 px-3 py-2 text-end text-sm no-underline transition hover:border-action hover:text-action hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:flex-none sm:max-w-[48%]"
        >
          <span className="min-w-0">
            <span className="block text-[11px] text-muted">הסרטון הבא</span>
            <span className="block truncate font-medium">{next.title}</span>
          </span>
          <span aria-hidden="true" className="shrink-0 text-muted">
            →
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
