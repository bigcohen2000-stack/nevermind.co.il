"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";

import { resetSearchAnalytics } from "@/actions/search-analytics";
import { StudioCsvExportButton } from "@/components/studio/studio-csv-export-button";
import type {
  SearchAnalyticsDashboardData,
  SearchTermCount,
} from "@/lib/studio/search-analytics-dashboard";
import type { SearchAnalytics } from "@/types/supabase";

type SearchAnalyticsDashboardProps = {
  data: SearchAnalyticsDashboardData;
};

type RowFilter = "all" | "zero" | "feedback";

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

function Metric({
  value,
  hint,
}: {
  value: string | number;
  hint: string;
}) {
  return (
    <>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </>
  );
}

function AnalyticsTable({ rows }: { rows: SearchAnalytics[] }) {
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  if (rows.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        עדיין אין חיפושים. חיפושים מהאתר יופיעו כאן.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="px-2 py-3 font-medium">שאילתה</th>
              <th className="px-2 py-3 font-medium">תאריך ושעה</th>
              <th className="px-2 py-3 font-medium">גולש</th>
              <th className="px-2 py-3 font-medium">תוצאות</th>
              <th className="px-2 py-3 font-medium">משוב</th>
              <th className="px-2 py-3 font-medium">הערה</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
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
      {pageCount > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <p>
            עמוד {safePage + 1} מתוך {pageCount} ({rows.length} שורות)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="border border-zinc-700 px-2.5 py-1 disabled:opacity-40"
            >
              הקודם
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="border border-zinc-700 px-2.5 py-1 disabled:opacity-40"
            >
              הבא
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResetAnalyticsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        className="border border-red-900/60 px-3 py-2 text-xs text-red-300 hover:border-red-500 disabled:opacity-50"
        onClick={() => {
          setError(null);
          setMessage(null);
          const ok = window.confirm(
            "למחוק את כל היסטוריית החיפושים באנליטיקס ולהתחיל מ-0? לא ניתן לשחזר.",
          );
          if (!ok) return;
          const ok2 = window.confirm(
            "אישור שני: למחוק לצמיתות את כל רשומות search_analytics?",
          );
          if (!ok2) return;
          startTransition(async () => {
            const result = await resetSearchAnalytics();
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(result.message);
            router.refresh();
          });
        }}
      >
        {pending ? "מוחק..." : "אפס נתונים (מ-0)"}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
    </div>
  );
}

export function SearchAnalyticsDashboard({
  data,
}: SearchAnalyticsDashboardProps) {
  const [filter, setFilter] = useState<RowFilter>("all");

  const filteredRows = useMemo(() => {
    if (filter === "zero") {
      return data.rows.filter((r) => r.results_count === 0);
    }
    if (filter === "feedback") {
      return data.rows.filter(
        (r) => r.user_feedback != null || Boolean(r.feedback_note?.trim()),
      );
    }
    return data.rows;
  }, [data.rows, filter]);

  // Reset paging when filter changes is handled inside AnalyticsTable via key.
  const tableKey = `${filter}-${data.rows.length}`;

  const weekChangeLabel =
    data.weekChangePct == null
      ? "אין בסיס להשוואה"
      : data.weekChangePct > 0
        ? `+${data.weekChangePct}% מול שבוע קודם`
        : data.weekChangePct < 0
          ? `${data.weekChangePct}% מול שבוע קודם`
          : "בלי שינוי מול שבוע קודם";

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

      <div className="flex flex-wrap items-start justify-between gap-4 border border-zinc-800 bg-zinc-950/40 p-4">
        <div>
          <p className="text-sm font-medium text-zinc-200">
            מה מחפשים הגולשים
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
            סיכום חיפושים באתר: מה עובד, איפה יש חורים, ומתי מחפשים. בלי ז&apos;רגון.
          </p>
        </div>
        <ResetAnalyticsButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="היום">
          <Metric value={data.totalToday} hint="חיפושים מחצות מקומית" />
        </SummaryCard>
        <SummaryCard title="השבוע">
          <Metric
            value={data.totalThisWeek}
            hint={weekChangeLabel}
          />
        </SummaryCard>
        <SummaryCard title="שיעור 0 תוצאות">
          <Metric
            value={`${data.zeroResultRatePct}%`}
            hint={`ב-${data.metricsDays} הימים האחרונים`}
          />
        </SummaryCard>
        <SummaryCard title="דיסלייק (7 ימים)">
          <Metric
            value={data.thumbsDownThisWeek}
            hint="משוב שלילי על תוצאות"
          />
        </SummaryCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="ממוצע תוצאות">
          <Metric value={data.avgResults} hint="לכל חיפוש" />
        </SummaryCard>
        <SummaryCard title="שעת שיא (7 ימים)">
          <Metric
            value={data.peakHourLabel ?? "-"}
            hint="שעון ישראל"
          />
        </SummaryCard>
        <SummaryCard title="שאילתות ייחודיות">
          <Metric
            value={data.uniqueQueryCount}
            hint={`${data.uniqueQuerySharePct}% מכלל החיפושים`}
          />
        </SummaryCard>
        <SummaryCard title="מחוברים">
          <Metric
            value={`${data.signedInSharePct}%`}
            hint="חיפושים עם user_id"
          />
        </SummaryCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="טופ מונחים השבוע">
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
            מועמדים טובים לסרטון או למושג הבא.
          </p>
        </SummaryCard>
        <SummaryCard title="מה כן עובד (עם תוצאות)">
          <TermList
            items={data.topHitTerms}
            emptyLabel="אין עדיין חיפושים עם תוצאות."
          />
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
              חיפושים אחרונים
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {filteredRows.length} מוצגים מתוך {data.rows.length}
              {data.rowsTruncated
                ? ` (חלון ${data.metricsDays} ימים, עד ${data.rows.length} שורות)`
                : ` (${data.metricsDays} ימים אחרונים)`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["all", "הכל"],
                  ["zero", "0 תוצאות"],
                  ["feedback", "עם משוב"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`border px-2.5 py-1 text-xs ${
                    filter === id
                      ? "border-zinc-300 text-zinc-100"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
            rows={filteredRows.map((row) => [
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
        <AnalyticsTable key={tableKey} rows={filteredRows} />
      </section>
    </div>
  );
}
