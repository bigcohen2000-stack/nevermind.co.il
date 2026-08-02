import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type TrendingSearch = {
  term: string;
  count: number;
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function normalizeTerm(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

/**
 * Top search queries from the last 7 days, excluding zero-result searches.
 */
export async function getTrendingSearches(
  limit = 5,
): Promise<TrendingSearch[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("search_analytics")
      .select("search_query, results_count")
      .gte("created_at", daysAgoIso(7))
      .gt("results_count", 0)
      .limit(3000);

    if (error || !data?.length) return [];

    const map = new Map<string, number>();
    for (const row of data) {
      const term = normalizeTerm(row.search_query);
      if (!term) continue;
      map.set(term, (map.get(term) ?? 0) + 1);
    }

    return [...map.entries()]
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, "he"))
      .slice(0, limit);
  } catch {
    return [];
  }
}
