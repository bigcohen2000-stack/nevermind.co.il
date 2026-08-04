"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { normalizeYoutubeLiveUrl } from "@/lib/live/youtube-url";
import { LIVE_STATUS_CACHE_TAG } from "@/lib/live/status";
import { broadcastLiveStarted } from "@/lib/push/web-push";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type LiveQueueActionResult =
  | { ok: true; message?: string; id?: string; notified?: number }
  | { ok: false; error: string };

function revalidateLive() {
  revalidateTag(LIVE_STATUS_CACHE_TAG, "max");
  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/studio");
}

async function requireStudio() {
  if (!(await isStudioAuthenticated())) {
    return { ok: false as const, error: "Studio session required." };
  }
  return { ok: true as const };
}

function parseScheduledAt(raw: string): Date | null {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Add one planned live slot.
 */
export async function addLiveQueueItem(input: {
  youtubeUrl: string;
  topic?: string;
  scheduledAt: string;
}): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const youtubeUrl = normalizeYoutubeLiveUrl(input.youtubeUrl);
  if (!youtubeUrl) {
    return { ok: false, error: "קישור YouTube לא תקין." };
  }

  const when = parseScheduledAt(input.scheduledAt);
  if (!when) return { ok: false, error: "תאריך/שעה לא תקינים." };

  const topic = (input.topic ?? "").trim().slice(0, 300);
  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("live_stream_queue")
      .insert({
        youtube_url: youtubeUrl,
        topic,
        scheduled_at: when.toISOString(),
        status: "planned",
        updated_at: now,
      })
      .select("id")
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message.includes("live_stream_queue")
          ? "טבלת התור חסרה. הרץ מיגרציה 36."
          : error.message,
      };
    }

    revalidateLive();
    return { ok: true, id: data.id, message: "נוסף לתור." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שמירה נכשלה.",
    };
  }
}

/**
 * Bulk lines: `url | 2026-08-10T20:00 | topic` (topic optional).
 * Also accepts plain urls if defaultScheduledAt is provided (same stamp + i hours).
 */
export async function addLiveQueueBulk(input: {
  text: string;
  defaultScheduledAt?: string;
}): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const lines = input.text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, error: "אין שורות להוספה." };
  }

  const defaultWhen = input.defaultScheduledAt
    ? parseScheduledAt(input.defaultScheduledAt)
    : null;

  let added = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const parts = line.split("|").map((p) => p.trim());
    const urlRaw = parts[0] ?? "";
    const whenRaw = parts[1] ?? "";
    const topic = (parts[2] ?? "").slice(0, 300);

    const youtubeUrl = normalizeYoutubeLiveUrl(urlRaw);
    if (!youtubeUrl) {
      errors.push(`שורה ${i + 1}: קישור לא תקין`);
      continue;
    }

    let when = whenRaw ? parseScheduledAt(whenRaw) : null;
    if (!when && defaultWhen) {
      when = new Date(defaultWhen.getTime() + i * 48 * 60 * 60 * 1000);
    }
    if (!when) {
      errors.push(`שורה ${i + 1}: חסר תאריך (url | תאריך | נושא)`);
      continue;
    }

    const result = await addLiveQueueItem({
      youtubeUrl,
      topic,
      scheduledAt: when.toISOString(),
    });
    if (result.ok) added += 1;
    else errors.push(`שורה ${i + 1}: ${result.error}`);
  }

  if (added === 0) {
    return {
      ok: false,
      error: errors[0] ?? "לא נוספו שידורים.",
    };
  }

  return {
    ok: true,
    message:
      errors.length > 0
        ? `נוספו ${added}. חלק מהשורות נכשלו: ${errors.slice(0, 3).join(", ")}`
        : `נוספו ${added} שידורים לתור.`,
  };
}

export async function updateLiveQueueStatus(input: {
  id: string;
  status: "planned" | "done" | "cancelled";
}): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(input.id);
  if (!id.success) return { ok: false, error: "מזהה לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("live_stream_queue")
      .update({
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id.data);

    if (error) return { ok: false, error: error.message };
    revalidateLive();
    return { ok: true, message: "עודכן." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "עדכון נכשל.",
    };
  }
}

export async function deleteLiveQueueItem(
  idRaw: string,
): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(idRaw);
  if (!id.success) return { ok: false, error: "מזהה לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("live_stream_queue")
      .delete()
      .eq("id", id.data);
    if (error) return { ok: false, error: error.message };
    revalidateLive();
    return { ok: true, message: "נמחק." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "מחיקה נכשלה.",
    };
  }
}

/**
 * Mark a planned/live item done without going live (stream happened elsewhere).
 */
export async function markLiveQueueDone(
  idRaw: string,
): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(idRaw);
  if (!id.success) return { ok: false, error: "מזהה לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("live_stream_queue")
      .update({
        status: "done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id.data)
      .in("status", ["planned", "live"]);

    if (error) return { ok: false, error: error.message };
    revalidateLive();
    return { ok: true, message: "סומן כבוצע." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "עדכון נכשל.",
    };
  }
}

/**
 * Activate a queue row: go live on /live and notify opt-in push subscribers.
 */
export async function activateLiveQueueItem(
  idRaw: string,
): Promise<LiveQueueActionResult> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(idRaw);
  if (!id.success) return { ok: false, error: "מזהה לא תקין." };

  try {
    const admin = getSupabaseAdmin();
    const { data: row, error: loadError } = await admin
      .from("live_stream_queue")
      .select("*")
      .eq("id", id.data)
      .maybeSingle();

    if (loadError || !row) {
      return { ok: false, error: loadError?.message ?? "לא נמצא בתור." };
    }

    const youtubeUrl = normalizeYoutubeLiveUrl(row.youtube_url);
    if (!youtubeUrl) {
      return { ok: false, error: "קישור YouTube לא תקין בתור." };
    }

    const now = new Date().toISOString();

    await admin
      .from("live_stream_queue")
      .update({ status: "done", updated_at: now })
      .eq("status", "live");

    const { error: liveError } = await admin.from("live_stream_config").upsert(
      {
        id: 1,
        is_live: true,
        youtube_url: youtubeUrl,
        topic: row.topic ?? "",
        started_at: now,
        updated_at: now,
      },
      { onConflict: "id" },
    );

    if (liveError) return { ok: false, error: liveError.message };

    await admin
      .from("live_stream_queue")
      .update({ status: "live", updated_at: now })
      .eq("id", id.data);

    let notified = 0;
    try {
      const push = await broadcastLiveStarted({
        topic: row.topic || undefined,
      });
      notified = push.sent;
    } catch {
      // Push optional if VAPID missing.
    }

    revalidateLive();
    return {
      ok: true,
      message:
        notified > 0
          ? `בשידור. נשלחו ${notified} התראות.`
          : "בשידור. הקישור ב-/live אחרי הרשמה ו-18+.",
      notified,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "הפעלה נכשלה.",
    };
  }
}
