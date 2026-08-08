import "server-only";

import { Resend } from "resend";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { configureWebPush } from "@/lib/push/web-push";
import webpush from "web-push";

const LOOKBACK_HOURS = 36;

type MatchRow = {
  userId: string;
  email: string | null;
  videoId: string;
  youtubeId: string;
  videoTitle: string;
  conceptId: string;
  conceptName: string;
};

/**
 * Match recent videos to user topic prefs and send email (and push when possible).
 * Dedupes via topic_notification_log.
 */
export async function broadcastTopicAlerts(): Promise<{
  matched: number;
  emailed: number;
  pushed: number;
  skipped: number;
}> {
  const admin = getSupabaseAdmin();
  const since = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { data: recentVideos } = await admin
    .from("videos")
    .select("id, youtube_id, title, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(40);

  if (!recentVideos?.length) {
    return { matched: 0, emailed: 0, pushed: 0, skipped: 0 };
  }

  const videoIds = recentVideos.map((v) => v.id);
  const { data: links } = await admin
    .from("video_concepts")
    .select("video_id, concept_id, concepts(id, name)")
    .in("video_id", videoIds);

  if (!links?.length) {
    return { matched: 0, emailed: 0, pushed: 0, skipped: 0 };
  }

  const conceptIds = [
    ...new Set(links.map((l) => l.concept_id).filter(Boolean)),
  ];
  const { data: prefs } = await admin
    .from("user_topic_prefs")
    .select("user_id, concept_id")
    .in("concept_id", conceptIds);

  if (!prefs?.length) {
    return { matched: 0, emailed: 0, pushed: 0, skipped: 0 };
  }

  const videoById = new Map(recentVideos.map((v) => [v.id, v]));
  const matches: MatchRow[] = [];

  for (const pref of prefs) {
    for (const link of links) {
      if (link.concept_id !== pref.concept_id) continue;
      const video = videoById.get(link.video_id);
      if (!video) continue;
      const concept = link.concepts as
        | { id: string; name: string }
        | { id: string; name: string }[]
        | null;
      const conceptRow = Array.isArray(concept) ? concept[0] : concept;
      matches.push({
        userId: pref.user_id,
        email: null,
        videoId: video.id,
        youtubeId: video.youtube_id,
        videoTitle: video.title,
        conceptId: pref.concept_id,
        conceptName: conceptRow?.name ?? "מושג",
      });
    }
  }

  // Resolve emails from auth.users via profiles join is not available;
  // fetch emails with admin auth API in batches.
  const uniqueUserIds = [...new Set(matches.map((m) => m.userId))];
  const emailByUser = new Map<string, string>();
  for (const userId of uniqueUserIds) {
    try {
      const { data } = await admin.auth.admin.getUserById(userId);
      const email = data.user?.email?.trim();
      if (email) emailByUser.set(userId, email);
    } catch {
      /* skip */
    }
  }

  let emailed = 0;
  const pushed = 0;
  let skipped = 0;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>";
  const resend = apiKey ? new Resend(apiKey) : null;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://nevermind.co.il";

  let pushReady = false;
  try {
    configureWebPush();
    pushReady = true;
  } catch {
    pushReady = false;
  }

  for (const match of matches) {
    const email = emailByUser.get(match.userId) ?? null;

    // Email channel
    if (email && resend) {
      const { data: prior } = await admin
        .from("topic_notification_log")
        .select("id")
        .eq("user_id", match.userId)
        .eq("video_id", match.videoId)
        .eq("channel", "email")
        .maybeSingle();

      if (prior) {
        skipped += 1;
      } else {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: `סרטון חדש בנושא ${match.conceptName}`,
            text: [
              `יצא סרטון חדש בנושא שבחרת: ${match.conceptName}.`,
              "",
              match.videoTitle,
              `${site}/watch/${match.youtubeId}`,
              "",
              "אפשר לעדכן תחומי עניין בפרופיל.",
            ].join("\n"),
          });
          await admin.from("topic_notification_log").insert({
            user_id: match.userId,
            video_id: match.videoId,
            concept_id: match.conceptId,
            channel: "email",
          });
          emailed += 1;
        } catch {
          skipped += 1;
        }
      }
    }

    // Push channel (best-effort: match subscriber email is not linked;
    // skip if we cannot map — keep structure for future endpoint binding)
    if (pushReady) {
      const { data: priorPush } = await admin
        .from("topic_notification_log")
        .select("id")
        .eq("user_id", match.userId)
        .eq("video_id", match.videoId)
        .eq("channel", "push")
        .maybeSingle();
      if (priorPush) {
        skipped += 1;
        continue;
      }
      // Without user↔push link, mark log only after a future binding exists.
      void webpush;
    }
  }

  return {
    matched: matches.length,
    emailed,
    pushed,
    skipped,
  };
}
