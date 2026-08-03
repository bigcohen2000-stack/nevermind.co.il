import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SearchAnalytics } from "@/types/supabase";

export type SearchTermCount = {
  term: string;
  count: number;
};

export type SearchAnalyticsDashboardData = {
  rows: SearchAnalytics[];
  totalToday: number;
  topTermsThisWeek: SearchTermCount[];
  topZeroResultTerms: SearchTermCount[];
  thumbsDownThisWeek: number;
  feedbackNotes: Array<{
    query: string;
    note: string;
    createdAt: string;
  }>;
  loadError: string | null;
};

function startOfLocalDay(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number, now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
}

function normalizeTerm(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function topTerms(
  rows: SearchAnalytics[],
  limit: number,
): SearchTermCount[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const term = normalizeTerm(row.search_query);
    if (!term) continue;
    map.set(term, (map.get(term) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, "he"))
    .slice(0, limit);
}

/**
 * Load search analytics for the Studio dashboard (service role; bypasses RLS).
 */
export async function getSearchAnalyticsDashboard(): Promise<SearchAnalyticsDashboardData> {
  const empty: SearchAnalyticsDashboardData = {
    rows: [],
    totalToday: 0,
    topTermsThisWeek: [],
    topZeroResultTerms: [],
    thumbsDownThisWeek: 0,
    feedbackNotes: [],
    loadError: null,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("search_analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      return {
        ...empty,
        loadError: error.message || "טעינת אנליטיקס נכשלה.",
      };
    }
    if (!data) return empty;

    const rows = data as SearchAnalytics[];
    const todayStart = startOfLocalDay().getTime();
    const weekStart = daysAgo(7).getTime();

    const totalToday = rows.filter(
      (row) => new Date(row.created_at).getTime() >= todayStart,
    ).length;

    const weekRows = rows.filter(
      (row) => new Date(row.created_at).getTime() >= weekStart,
    );

    const zeroRows = rows.filter((row) => row.results_count === 0);

    const weekFeedbackDown = weekRows.filter(
      (row) => row.user_feedback === false,
    ).length;

    const feedbackNotes = rows
      .filter((row) => Boolean(row.feedback_note?.trim()))
      .slice(0, 20)
      .map((row) => ({
        query: row.search_query,
        note: row.feedback_note!.trim(),
        createdAt: row.created_at,
      }));

    return {
      rows,
      totalToday,
      topTermsThisWeek: topTerms(weekRows, 5),
      topZeroResultTerms: topTerms(zeroRows, 3),
      thumbsDownThisWeek: weekFeedbackDown,
      feedbackNotes,
      loadError: null,
    };
  } catch (err) {
    return {
      ...empty,
      loadError:
        err instanceof Error ? err.message : "טעינת אנליטיקס נכשלה.",
    };
  }
}
