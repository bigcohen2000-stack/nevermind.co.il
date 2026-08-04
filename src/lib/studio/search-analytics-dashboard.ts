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
  totalThisWeek: number;
  totalPrevWeek: number;
  weekChangePct: number | null;
  zeroResultRatePct: number;
  avgResults: number;
  peakHourLabel: string | null;
  uniqueQueryCount: number;
  uniqueQuerySharePct: number;
  signedInSharePct: number;
  topTermsThisWeek: SearchTermCount[];
  topZeroResultTerms: SearchTermCount[];
  topHitTerms: SearchTermCount[];
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

function peakHourIsrael(rows: SearchAnalytics[]): string | null {
  if (rows.length === 0) return null;
  const hours = new Array<number>(24).fill(0);
  for (const row of rows) {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jerusalem",
        hour: "numeric",
        hour12: false,
      }).format(new Date(row.created_at)),
    );
    if (Number.isFinite(hour) && hour >= 0 && hour < 24) {
      hours[hour]! += 1;
    }
  }
  let best = 0;
  for (let h = 1; h < 24; h += 1) {
    if ((hours[h] ?? 0) > (hours[best] ?? 0)) best = h;
  }
  if ((hours[best] ?? 0) === 0) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(best)}:00-${pad((best + 1) % 24)}:00`;
}

/**
 * Load search analytics for the Studio dashboard (service role; bypasses RLS).
 */
export async function getSearchAnalyticsDashboard(): Promise<SearchAnalyticsDashboardData> {
  const empty: SearchAnalyticsDashboardData = {
    rows: [],
    totalToday: 0,
    totalThisWeek: 0,
    totalPrevWeek: 0,
    weekChangePct: null,
    zeroResultRatePct: 0,
    avgResults: 0,
    peakHourLabel: null,
    uniqueQueryCount: 0,
    uniqueQuerySharePct: 0,
    signedInSharePct: 0,
    topTermsThisWeek: [],
    topZeroResultTerms: [],
    topHitTerms: [],
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
    const prevWeekStart = daysAgo(14).getTime();

    const totalToday = rows.filter(
      (row) => new Date(row.created_at).getTime() >= todayStart,
    ).length;

    const weekRows = rows.filter(
      (row) => new Date(row.created_at).getTime() >= weekStart,
    );
    const prevWeekRows = rows.filter((row) => {
      const t = new Date(row.created_at).getTime();
      return t >= prevWeekStart && t < weekStart;
    });

    const totalThisWeek = weekRows.length;
    const totalPrevWeek = prevWeekRows.length;
    const weekChangePct =
      totalPrevWeek === 0
        ? totalThisWeek > 0
          ? 100
          : null
        : Math.round(
            ((totalThisWeek - totalPrevWeek) / totalPrevWeek) * 100,
          );

    const zeroRows = rows.filter((row) => row.results_count === 0);
    const hitRows = rows.filter((row) => row.results_count > 0);
    const zeroResultRatePct =
      rows.length === 0
        ? 0
        : Math.round((zeroRows.length / rows.length) * 1000) / 10;

    const avgResults =
      rows.length === 0
        ? 0
        : Math.round(
            (rows.reduce((sum, r) => sum + (r.results_count ?? 0), 0) /
              rows.length) *
              10,
          ) / 10;

    const uniqueSet = new Set(
      rows.map((r) => normalizeTerm(r.search_query)).filter(Boolean),
    );
    const uniqueQueryCount = uniqueSet.size;
    const uniqueQuerySharePct =
      rows.length === 0
        ? 0
        : Math.round((uniqueQueryCount / rows.length) * 1000) / 10;

    const signedIn = rows.filter((r) => Boolean(r.user_id)).length;
    const signedInSharePct =
      rows.length === 0
        ? 0
        : Math.round((signedIn / rows.length) * 1000) / 10;

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
      totalThisWeek,
      totalPrevWeek,
      weekChangePct,
      zeroResultRatePct,
      avgResults,
      peakHourLabel: peakHourIsrael(weekRows),
      uniqueQueryCount,
      uniqueQuerySharePct,
      signedInSharePct,
      topTermsThisWeek: topTerms(weekRows, 8),
      topZeroResultTerms: topTerms(zeroRows, 8),
      topHitTerms: topTerms(hitRows, 8),
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
