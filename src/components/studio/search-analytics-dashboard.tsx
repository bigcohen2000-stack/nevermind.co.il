import Link from "next/link";
import type { ReactNode } from "react";

import { StudioNav } from "@/components/studio/studio-nav";
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
            {item.term}
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
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
        No search events yet. Searches from the site hero will appear here.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="px-2 py-3 font-medium">Search Query</th>
            <th className="px-2 py-3 font-medium">Date & Time</th>
            <th className="px-2 py-3 font-medium">User</th>
            <th className="px-2 py-3 font-medium">Results</th>
            <th className="px-2 py-3 font-medium">Feedback</th>
            <th className="px-2 py-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const zero = row.results_count === 0;
            const feedbackLabel =
              row.user_feedback === true
                ? "Up"
                : row.user_feedback === false
                  ? "Down"
                  : "—";
            return (
              <tr
                key={row.id}
                className={`border-b border-zinc-800/80 ${
                  zero ? "bg-red-950/20" : ""
                }`}
              >
                <td className="px-2 py-3 font-medium text-zinc-100">
                  {row.search_query}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-zinc-400">
                  {formatDateTime(row.created_at)}
                </td>
                <td className="px-2 py-3">
                  {row.user_id ? (
                    <span className="rounded-md bg-emerald-950 px-2 py-1 text-xs text-emerald-300">
                      Logged In
                    </span>
                  ) : (
                    <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                      Anonymous
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
                  {row.feedback_note?.trim() || "—"}
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
      <header className="space-y-6">
        <StudioNav
          active="analytics"
          actions={
            <Link
              href="/studio"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
            >
              Ingest video
            </Link>
          }
        />
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            NeverMind Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Search Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            What people search for, and where the library has gaps (0 results).
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Searches today">
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalToday}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Since local midnight</p>
        </SummaryCard>

        <SummaryCard title="Top 5 this week">
          <TermList
            items={data.topTermsThisWeek}
            emptyLabel="No searches in the last 7 days."
          />
        </SummaryCard>

        <SummaryCard title="Top 3 zero-result gaps">
          <TermList
            items={data.topZeroResultTerms}
            emptyLabel="No zero-result searches yet."
            emphasizeZero
          />
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Good candidates for the next video.
          </p>
        </SummaryCard>

        <SummaryCard title="Thumbs down (7 days)">
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.thumbsDownThisWeek}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Quality feedback</p>
        </SummaryCard>
      </div>

      {data.feedbackNotes.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-zinc-100">
            Recent feedback notes
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

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">All searches</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {data.rows.length} event{data.rows.length === 1 ? "" : "s"} (newest
              first)
            </p>
          </div>
          <Link
            href="/studio"
            className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            Back to ingestion
          </Link>
        </div>
        <AnalyticsTable rows={data.rows} />
      </section>
    </div>
  );
}
