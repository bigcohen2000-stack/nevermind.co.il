"use server";

import { broadcastLiveStarted } from "@/lib/push/web-push";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type LivePushActionResult =
  | { ok: true; message: string; sent?: number; optIns?: number }
  | { ok: false; error: string };

export async function getLivePushStats(): Promise<{
  vapidConfigured: boolean;
  optIns: number;
}> {
  const vapidConfigured = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim(),
  );

  let optIns = 0;
  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from("subscribers")
      .select("endpoint", { count: "exact", head: true })
      .eq("notify_live", true);
    if (error) {
      // Migration 36 not applied yet.
      optIns = 0;
    } else {
      optIns = count ?? 0;
    }
  } catch {
    optIns = 0;
  }

  return { vapidConfigured, optIns };
}

/**
 * Studio-only: send a test live notification to notify_live subscribers.
 */
export async function sendTestLivePush(input?: {
  topic?: string;
}): Promise<LivePushActionResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  const vapidOk = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim(),
  );
  if (!vapidOk) {
    return {
      ok: false,
      error: "חסרים מפתחות VAPID. בדקו .env / Vercel.",
    };
  }

  const topicRaw = (input?.topic ?? "").trim().slice(0, 120);
  const topic = topicRaw || "בדיקת התראה (סטודיו)";

  try {
    const result = await broadcastLiveStarted({ topic });
    return {
      ok: true,
      sent: result.sent,
      message:
        result.sent > 0
          ? `נשלחו ${result.sent} התראות בדיקה. נכשל: ${result.failed}.`
          : "אין מנויים עם התראות לייב פעילות עדיין.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שליחה נכשלה.",
    };
  }
}
