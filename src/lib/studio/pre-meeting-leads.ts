import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PreMeetingLead } from "@/types/supabase";

export type PreMeetingLeadsDashboardData = {
  rows: PreMeetingLead[];
  totalToday: number;
  totalThisWeek: number;
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
 * Load Thought Deconstructor / pre-meeting leads for Studio (service role).
 */
export async function getPreMeetingLeadsDashboard(): Promise<PreMeetingLeadsDashboardData> {
  const empty: PreMeetingLeadsDashboardData = {
    rows: [],
    totalToday: 0,
    totalThisWeek: 0,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("pre_meeting_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) return empty;

    const rows = data as PreMeetingLead[];
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
    };
  } catch {
    return empty;
  }
}
