import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  created_at: string;
  unsubscribed_at: string | null;
};

export type NewsletterDashboardData = {
  rows: NewsletterSubscriberRow[];
  activeCount: number;
  unsubscribedCount: number;
  loadError: string | null;
};

export async function getNewsletterDashboard(): Promise<NewsletterDashboardData> {
  const empty: NewsletterDashboardData = {
    rows: [],
    activeCount: 0,
    unsubscribedCount: 0,
    loadError: null,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .select("id, email, source, status, created_at, unsubscribed_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return {
        ...empty,
        loadError:
          error.message ||
          "טעינת מנויי עדכון במייל נכשלה. בדוק מיגרציות 38 ו-41.",
      };
    }

    const rows = (data ?? []) as NewsletterSubscriberRow[];
    return {
      rows,
      activeCount: rows.filter((row) => row.status === "active").length,
      unsubscribedCount: rows.filter((row) => row.status === "unsubscribed")
        .length,
      loadError: null,
    };
  } catch (err) {
    return {
      ...empty,
      loadError:
        err instanceof Error
          ? err.message
          : "טעינת מנויי עדכון במייל נכשלה.",
    };
  }
}

export function newsletterRowsToCsv(rows: NewsletterSubscriberRow[]): string {
  const header = "email,status,source,created_at,unsubscribed_at";
  const lines = rows.map((row) =>
    [
      csvEscape(row.email),
      csvEscape(row.status),
      csvEscape(row.source),
      csvEscape(row.created_at),
      csvEscape(row.unsubscribed_at ?? ""),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
