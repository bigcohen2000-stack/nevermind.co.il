import Link from "next/link";

import type { ArticleMeta } from "@/lib/content/articles";
import { CATEGORY_LABELS } from "@/lib/content/articles";
import {
  BREAKDOWN_LEVEL_LABELS,
  BREAKDOWN_LEVEL_NUMBERS,
  isBreakdownLevel,
} from "@/lib/videos/investigation";
import { formatDurationHe } from "@/lib/videos/format-meta";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";
import { cn } from "@/lib/utils";

export type MatrixVideoRow = {
  kind: "video";
  id: string;
  ref: string;
  title: string;
  href: string;
  durationLabel: string | null;
  levelLabel: string | null;
  levelNum: number | null;
  gated: boolean;
  tags: string[];
};

export type MatrixArticleRow = {
  kind: "article";
  id: string;
  ref: string;
  title: string;
  href: string;
  categoryLabel: string;
  tags: string[];
  gated: boolean;
};

export type MatrixRow = MatrixVideoRow | MatrixArticleRow;

function shortVideoRef(id: string, index: number): string {
  const tail = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `VID-${String(index + 1).padStart(2, "0")}-${tail}`;
}

function shortArticleRef(slug: string, index: number): string {
  const tail = slug.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "ART";
  return `ART-${String(index + 1).padStart(2, "0")}-${tail}`;
}

export function buildVideoMatrixRows(videos: Video[]): MatrixVideoRow[] {
  return videos.map((video, index) => {
    const gated = isMembersOnlyVideo(video);
    const level = isBreakdownLevel(video.breakdown_level)
      ? video.breakdown_level
      : null;
    return {
      kind: "video",
      id: video.id,
      ref: shortVideoRef(video.id, index),
      title: video.title,
      href: getWatchHref(video),
      durationLabel: formatDurationHe(video.duration_seconds),
      levelLabel: level ? BREAKDOWN_LEVEL_LABELS[level] : null,
      levelNum: level ? BREAKDOWN_LEVEL_NUMBERS[level] : null,
      gated,
      tags: ["אהבה"],
    };
  });
}

export function buildArticleMatrixRows(
  articles: ArticleMeta[],
): MatrixArticleRow[] {
  return articles.map((article, index) => ({
    kind: "article",
    id: article.slug,
    ref: shortArticleRef(article.slug, index),
    title: article.title,
    href: `/articles/${article.slug}`,
    categoryLabel: CATEGORY_LABELS[article.category],
    tags: [
      CATEGORY_LABELS[article.category],
      ...(article.relatedTerms ?? []).slice(0, 3),
    ],
    gated: article.isPremium,
  }));
}

type BooksInvestigationMatrixProps = {
  rows: MatrixRow[];
  /** When set, only rows whose tags include this concept. */
  activeConcept?: string | null;
};

/**
 * Dense chapter-matrix rows for /books (videos + articles). No cover images.
 */
export function BooksInvestigationMatrix({
  rows,
  activeConcept = null,
}: BooksInvestigationMatrixProps) {
  const filtered =
    activeConcept == null
      ? rows
      : rows.filter((row) =>
          row.tags.some((t) => t.includes(activeConcept) || activeConcept.includes(t)),
        );

  if (filtered.length === 0) {
    return (
      <p className="border border-dashed border-foreground/15 p-6 text-sm text-muted">
        אין שורות תואמות לסינון הנוכחי.
      </p>
    );
  }

  return (
    <ul className="space-y-3 font-mono text-xs">
      {filtered.map((row) => (
        <li key={`${row.kind}-${row.id}`}>
          <div
            className={cn(
              "flex flex-col gap-4 border border-foreground/12 bg-background p-4 transition-colors hover:border-action md:flex-row md:items-center md:justify-between",
            )}
          >
            <div className="max-w-3xl space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="font-bold text-action">#{row.ref}</span>
                {row.kind === "video" && row.levelNum != null ? (
                  <span className="border border-foreground/15 bg-foreground/[0.03] px-1.5 py-0.5 text-muted">
                    LEVEL {row.levelNum}
                    {row.levelLabel ? `: ${row.levelLabel}` : ""}
                  </span>
                ) : null}
                {row.kind === "video" && row.durationLabel ? (
                  <span className="text-muted tabular-nums">
                    {row.durationLabel}
                  </span>
                ) : null}
                {row.kind === "article" ? (
                  <span className="border border-foreground/15 px-1.5 py-0.5 text-muted">
                    {row.categoryLabel}
                  </span>
                ) : null}
                {row.gated ? (
                  <span className="border border-action/40 px-1.5 py-0.5 text-action">
                    מועדון
                  </span>
                ) : (
                  <span className="border border-foreground/15 px-1.5 py-0.5 text-muted">
                    פתוח
                  </span>
                )}
              </div>
              <h3 className="font-sans text-base font-bold text-foreground">
                {row.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {row.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-foreground/10 px-1.5 py-0.5 text-[10px] text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 md:w-auto">
              <Link
                href={row.href}
                className={cn(
                  "inline-block w-full border px-3 py-1.5 text-center text-xs font-bold transition-colors md:w-auto",
                  row.gated
                    ? "border-action text-action hover:bg-action hover:text-background"
                    : "border-foreground bg-foreground/[0.03] text-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {row.kind === "video"
                  ? row.gated
                    ? "לצפייה (מועדון) ←"
                    : "לצפייה ←"
                  : row.gated
                    ? "לקריאה (מועדון) ←"
                    : "לקריאה ←"}
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
