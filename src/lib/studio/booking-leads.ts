import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BookingLead } from "@/types/supabase";

export type BookingLeadsDashboardData = {
  rows: BookingLead[];
  totalToday: number;
  totalThisWeek: number;
  openCount: number;
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

export async function getBookingLeadsDashboard(): Promise<BookingLeadsDashboardData> {
  const empty: BookingLeadsDashboardData = {
    rows: [],
    totalToday: 0,
    totalThisWeek: 0,
    openCount: 0,
    loadError: null,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("booking_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return {
        ...empty,
        loadError: error.message || "טעינת לידי יצירת קשר נכשלה.",
      };
    }
    if (!data) return empty;

    const rows = data as BookingLead[];
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
      openCount: rows.filter((row) => row.status === "new" || row.status === "contacted")
        .length,
      loadError: null,
    };
  } catch (err) {
    return {
      ...empty,
      loadError:
        err instanceof Error
          ? err.message
          : "טעינת לידי יצירת קשר נכשלה (בדוק מיגרציה 33).",
    };
  }
}
