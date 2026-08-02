import "server-only";

import webpush from "web-push";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PushSubscriptionKeys = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type DailyQuote = {
  body: string;
  url: string;
};

const FALLBACK_QUOTES = [
  "הכעס הוא לא האויב. הוא רק סימן.",
  "יש כאן בלבול: המנגנון פשוט.",
  "לא כל סיפור הוא עובדה.",
  "מה שקרה הוא מה שקרה. הסיפור עליו הוא משהו אחר.",
  "חקירה מתחילה בשאלה, לא בתשובה.",
];

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:hello@nevermind.co.il";

  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY (npx web-push generate-vapid-keys).",
    );
  }

  return { publicKey, privateKey, subject };
}

export function configureWebPush() {
  const { publicKey, privateKey, subject } = getVapidConfig();
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey };
}

/** Split transcript into short candidate lines (Hebrew / Latin). */
function extractShortQuotes(content: string, max = 24): string[] {
  const chunks = content
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…؟]|[.]\s)/)
    .map((part) => part.trim())
    .filter((part) => {
      const len = part.length;
      return len >= 28 && len <= 160;
    });

  return [...new Set(chunks)].slice(0, max);
}

/**
 * Pick one short quote from a random transcript, or a fallback line.
 */
export async function pickDailyResetQuote(): Promise<DailyQuote> {
  const admin = getSupabaseAdmin();

  const { count } = await admin
    .from("video_transcripts")
    .select("*", { count: "exact", head: true });

  const total = count ?? 0;
  if (total > 0) {
    const offset = Math.floor(Math.random() * total);
    const { data: row } = await admin
      .from("video_transcripts")
      .select("content, video_id")
      .range(offset, offset)
      .maybeSingle();

    const content = row?.content?.trim() ?? "";
    const quotes = content ? extractShortQuotes(content) : [];
    if (quotes.length > 0) {
      const body = quotes[Math.floor(Math.random() * quotes.length)]!;
      let url = "/videos";
      if (row?.video_id) {
        const { data: video } = await admin
          .from("videos")
          .select("youtube_id")
          .eq("id", row.video_id)
          .maybeSingle();
        if (video?.youtube_id) {
          url = `/watch/${video.youtube_id}`;
        }
      }
      return { body, url };
    }
  }

  const body =
    FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]!;
  return { body, url: "/videos" };
}

export type BroadcastResult = {
  sent: number;
  failed: number;
  removed: number;
  quote: DailyQuote;
};

/**
 * Send the daily reset payload to every stored PushSubscription.
 * Removes gone/expired endpoints (410 / 404).
 */
export async function broadcastDailyReset(
  quote?: DailyQuote,
): Promise<BroadcastResult> {
  configureWebPush();
  const payload = quote ?? (await pickDailyResetQuote());
  const admin = getSupabaseAdmin();

  const { data: rows, error } = await admin
    .from("subscribers")
    .select("endpoint, p256dh, auth");

  if (error) {
    throw new Error(error.message);
  }

  const body = JSON.stringify({
    title: "איפוס יומי",
    body: payload.body,
    url: payload.url,
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const row of rows ?? []) {
    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    };

    try {
      await webpush.sendNotification(subscription, body, {
        TTL: 60 * 60 * 12,
        urgency: "normal",
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? Number((err as { statusCode: number }).statusCode)
          : null;
      if (statusCode === 404 || statusCode === 410) {
        await admin.from("subscribers").delete().eq("endpoint", row.endpoint);
        removed += 1;
      }
    }
  }

  return { sent, failed, removed, quote: payload };
}
