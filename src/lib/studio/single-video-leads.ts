import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SingleVideoLead } from "@/types/supabase";

export type SingleVideoLeadStatus =
  | "requested"
  | "chatting"
  | "paid"
  | "sent"
  | "closed";

export type SingleVideoLeadsDashboardData = {
  rows: SingleVideoLead[];
  totalToday: number;
  totalThisWeek: number;
  openCount: number;
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

/**
 * Load single-video purchase / request leads for Studio (service role).
 */
export async function getSingleVideoLeadsDashboard(): Promise<SingleVideoLeadsDashboardData> {
  const empty: SingleVideoLeadsDashboardData = {
    rows: [],
    totalToday: 0,
    totalThisWeek: 0,
    openCount: 0,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("single_video_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) return empty;

    const rows = data as SingleVideoLead[];
    const todayStart = startOfLocalDay().getTime();
    const weekStart = daysAgo(7).getTime();

    return {
      rows,
      totalToday: rows.filter(
        (row) => new Date(row.created_at).getTime() >= todayStart,
      ).length,
      totalThisWeek: rows.filter(
        (row) => new Date(row.created_at).getTime() >= weekStart,
      ).length,
      openCount: rows.filter(
        (row) =>
          row.status === "requested" ||
          row.status === "chatting" ||
          row.status === "paid",
      ).length,
    };
  } catch {
    return empty;
  }
}
