import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

export type LiveQueueStatus = "planned" | "live" | "done" | "cancelled";

export type LiveQueueItem =
  Database["public"]["Tables"]["live_stream_queue"]["Row"];

export async function listLiveQueue(limit = 40): Promise<{
  items: LiveQueueItem[];
  error: string | null;
}> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("live_stream_queue")
      .select("*")
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error) {
      return {
        items: [],
        error:
          error.message.includes("schema cache") ||
          error.message.includes("live_stream_queue")
            ? "טבלת תור השידורים חסרה. הרץ מיגרציה 36 ב-Supabase."
            : error.message,
      };
    }

    return { items: (data as LiveQueueItem[]) ?? [], error: null };
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : "טעינת תור נכשלה.",
    };
  }
}

/** Upcoming planned (and optionally live) rows for public /live page. */
export async function listUpcomingLivePublic(limit = 8): Promise<
  { id: string; topic: string; scheduled_at: string; status: string }[]
> {
  try {
    const admin = getSupabaseAdmin();
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("live_stream_queue")
      .select("id, topic, scheduled_at, status")
      .in("status", ["planned", "live"])
      .gte("scheduled_at", since)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
