import Link from "next/link";
import type { ReactNode } from "react";

import { StudioCsvExportButton } from "@/components/studio/studio-csv-export-button";
import type {
  SearchAnalyticsDashboardData,
  SearchTermCount,
} from "@/lib/studio/search-analytics-dashboard";
import type { SearchAnalytics } from "@/types/supabase";

type SearchAnalyticsDashboardProps = {
  data: SearchAnalyticsDashboardData;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TermList({
  items,
  emptyLabel,
  emphasizeZero,
}: {
  items: SearchTermCount[];
  emptyLabel: string;
  emphasizeZero?: boolean;
}) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-zinc-500">{emptyLabel}</p>;
  }

  return (
    <ol className="mt-4 space-y-2">
      {items.map((item, index) => (
        <li
          key={item.term}
          className="flex items-baseline justify-between gap-3 text-sm"
        >
          <span className="min-w-0 truncate text-zinc-200">
            <span className="me-2 text-zinc-500">{index + 1}.</span>
            <Link
              href={`/search?q=${encodeURIComponent(item.term)}`}
              className="underline-offset-2 hover:text-action hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.term}
            </Link>
          </span>
          <span
            className={`shrink-0 font-mono text-xs ${
              emphasizeZero ? "text-red-400" : "text-zinc-400"
            }`}
          >
            {item.count}x
          </span>
        </li>
      ))}
    </ol>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <h2 className="text-sm font-medium tracking-wide text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AnalyticsTable({ rows }: { rows: SearchAnalytics[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        עדיין אין חיפושים. חיפושים מהאתר יופיעו כאן.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="px-2 py-3 font-medium">שאילתה</th>
            <th className="px-2 py-3 font-medium">תאריך ושעה</th>
            <th className="px-2 py-3 font-medium">משתמש</th>
            <th className="px-2 py-3 font-medium">תוצאות</th>
            <th className="px-2 py-3 font-medium">משוב</th>
            <th className="px-2 py-3 font-medium">הערה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const zero = row.results_count === 0;
            const feedbackLabel =
              row.user_feedback === true
                ? "חיובי"
                : row.user_feedback === false
                  ? "שלילי"
                  : "-";
            return (
              <tr
                key={row.id}
                className={`border-b border-zinc-800/80 ${
                  zero ? "bg-red-950/20" : ""
                }`}
              >
                <td className="px-2 py-3 font-medium text-zinc-100">
                  <Link
                    href={`/search?q=${encodeURIComponent(row.search_query)}`}
                    className="underline-offset-2 hover:text-action hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row.search_query}
                  </Link>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-zinc-400">
                  {formatDateTime(row.created_at)}
                </td>
                <td className="px-2 py-3">
                  {row.user_id ? (
                    <span className="border border-emerald-800 bg-emerald-950 px-2 py-1 text-xs text-emerald-300">
                      מחובר
                    </span>
                  ) : (
                    <span className="border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                      אורח
                    </span>
                  )}
                </td>
                <td
                  className={`px-2 py-3 font-mono text-xs ${
                    zero ? "font-semibold text-red-400" : "text-zinc-300"
                  }`}
                >
                  {row.results_count}
                </td>
                <td
                  className={`px-2 py-3 text-xs ${
                    row.user_feedback === false
                      ? "text-red-400"
                      : row.user_feedback === true
                        ? "text-emerald-400"
                        : "text-zinc-600"
                  }`}
                >
                  {feedbackLabel}
                </td>
                <td className="max-w-[14rem] truncate px-2 py-3 text-xs text-zinc-400">
                  {row.feedback_note?.trim() || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SearchAnalyticsDashboard({
  data,
}: SearchAnalyticsDashboardProps) {
  return (
    <div className="space-y-10">
      {data.loadError ? (
        <p
          role="alert"
          className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          לא נטען מ-Supabase: {data.loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="חיפושים היום">
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalToday}
          </p>
          <p className="mt-2 text-xs text-zinc-500">מחצות מקומית</p>
        </SummaryCard>

        <SummaryCard title="טופ 5 השבוע">
          <TermList
            items={data.topTermsThisWeek}
            emptyLabel="אין חיפושים ב-7 הימים האחרונים."
          />
        </SummaryCard>

        <SummaryCard title="חורים (0 תוצאות)">
          <TermList
            items={data.topZeroResultTerms}
            emptyLabel="עדיין אין חיפושים בלי תוצאות."
            emphasizeZero
          />
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            מועמדים טובים לסרטון הבא.
          </p>
        </SummaryCard>

        <SummaryCard title="דיסלייק (7 ימים)">
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.thumbsDownThisWeek}
          </p>
          <p className="mt-2 text-xs text-zinc-500">משוב איכות</p>
        </SummaryCard>
      </div>

      {data.feedbackNotes.length > 0 ? (
        <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-zinc-100">
            הערות משוב אחרונות
          </h2>
          <ul className="mt-4 space-y-3">
            {data.feedbackNotes.map((item) => (
              <li
                key={`${item.createdAt}-${item.query}`}
                className="border-b border-zinc-800/80 pb-3 text-sm last:border-0"
              >
                <p className="font-medium text-zinc-200">{item.query}</p>
                <p className="mt-1 text-zinc-400">{item.note}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {formatDateTime(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              כל החיפושים
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {data.rows.length} אירועים (חדש למעלה)
            </p>
          </div>
          <StudioCsvExportButton
            filename={`search-analytics-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={[
              "query",
              "created_at",
              "results_count",
              "user_feedback",
              "feedback_note",
              "user_id",
            ]}
            rows={data.rows.map((row) => [
              row.search_query,
              row.created_at,
              row.results_count,
              row.user_feedback == null
                ? ""
                : row.user_feedback
                  ? "up"
                  : "down",
              row.feedback_note,
              row.user_id,
            ])}
          />
        </div>
        <AnalyticsTable rows={data.rows} />
      </section>
    </div>
  );
}
