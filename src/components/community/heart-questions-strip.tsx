import Link from "next/link";

import {
  heartInsightsForHome,
  heartInsightsForMembers,
  type HeartInsight,
} from "@/lib/community/heart-insights";

type HeartQuestionsStripProps = {
  /** members = optional club page strip. home = only showOnHome items. */
  surface: "members" | "home";
  limit?: number;
};

function InsightRow({ row }: { row: HeartInsight }) {
  return (
    <li className="border-b border-foreground/10 pb-4 last:border-0 last:pb-0">
      <p className="text-sm leading-relaxed text-foreground">
        &quot;{row.question}&quot;
      </p>
      <p className="mt-2 text-xs text-muted">
        {row.authorName}
        {row.commentedAt ? `, ${row.commentedAt}` : ""}
      </p>
      <p className="mt-2">
        <a
          href={row.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-action underline-offset-4 hover:underline"
        >
          לסרטון ולשרשור
        </a>
      </p>
    </li>
  );
}

/**
 * Optional strip for curated heart questions.
 * Renders nothing until HEART_INSIGHTS has matching rows.
 */
export function HeartQuestionsStrip({
  surface,
  limit,
}: HeartQuestionsStripProps) {
  const rows =
    surface === "home"
      ? heartInsightsForHome(limit ?? 3)
      : heartInsightsForMembers(limit ?? 6);

  if (rows.length === 0) return null;

  return (
    <section
      className="bg-background text-foreground"
      aria-labelledby={`heart-questions-${surface}-title`}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="border border-foreground/15 bg-paper p-5 sm:p-6">
          <p
            id={`heart-questions-${surface}-title`}
            className="text-xs font-medium tracking-wide text-action"
          >
            {surface === "home"
              ? "שאלה שפותחת חקירה"
              : "שאלות שחוקרים עכשיו"}
          </p>
          <ul className="mt-5 space-y-4">
            {rows.map((row, index) => (
              <InsightRow
                key={row.commentId ?? `${row.authorName}-${index}`}
                row={row}
              />
            ))}
          </ul>
          {surface === "members" ? (
            <p className="mt-4 text-xs text-muted">
              <Link
                href="/videos"
                className="underline-offset-4 hover:underline"
              >
                לכל הסרטונים
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
