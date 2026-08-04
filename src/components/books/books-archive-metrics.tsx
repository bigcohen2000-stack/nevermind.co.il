import { BOOK_IN_PROGRESS } from "@/lib/content/offers";

type BooksArchiveMetricsProps = {
  videoCount: number;
  articleCount: number;
  openVideoCount: number;
  clubVideoCount: number;
};

/**
 * Dry operational metrics for the /books archive hero.
 */
export function BooksArchiveMetrics({
  videoCount,
  articleCount,
  openVideoCount,
  clubVideoCount,
}: BooksArchiveMetricsProps) {
  return (
    <div className="flex flex-wrap gap-4 border border-foreground/15 bg-foreground/[0.04] p-3 font-mono text-xs sm:gap-6">
      <div>
        <span className="block text-foreground/55">ספר</span>
        <span className="text-sm font-bold text-foreground">1 חיבור</span>
      </div>
      <div className="border-s border-foreground/15 ps-4">
        <span className="block text-foreground/55">סרטוני אהבה</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          {videoCount}
        </span>
      </div>
      <div className="border-s border-foreground/15 ps-4">
        <span className="block text-foreground/55">פתוח / מועדון</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          {openVideoCount} / {clubVideoCount}
        </span>
      </div>
      <div className="border-s border-foreground/15 ps-4">
        <span className="block text-foreground/55">מאמרים</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          {articleCount}
        </span>
      </div>
      {BOOK_IN_PROGRESS.priceLabel ? (
        <div className="border-s border-foreground/15 ps-4">
          <span className="block text-foreground/55">מחיר ספר</span>
          <span className="text-sm font-bold text-action tabular-nums">
            {BOOK_IN_PROGRESS.priceLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
