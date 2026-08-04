import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type StudioHealthChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
};

export type StudioHealthLatestVideo = {
  title: string;
  youtube_id: string;
  created_at: string;
  published_at: string | null;
};

export type StudioHealth = {
  dbOk: boolean;
  clubPasswordSet: boolean;
  membersCount: number;
  gatedVideosCount: number;
  teasersMissingCount: number;
  resendConfigured: boolean;
  youtubeKeyConfigured: boolean;
  cronSecretConfigured: boolean;
  clubGateSecretConfigured: boolean;
  latestVideo: StudioHealthLatestVideo | null;
  paymentReady: boolean;
  checklist: StudioHealthChecklistItem[];
};

function envTruthy(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Readiness snapshot for Studio payment and ops (WhatsApp billing, no card checkout).
 */
export async function getStudioHealth(): Promise<StudioHealth> {
  const resendConfigured = envTruthy(process.env.RESEND_API_KEY);
  const youtubeKeyConfigured = envTruthy(process.env.YOUTUBE_API_KEY);
  const cronSecretConfigured = envTruthy(process.env.CRON_SECRET);
  const clubGateSecretConfigured = envTruthy(process.env.CLUB_GATE_SECRET);
  const vapidConfigured =
    envTruthy(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) &&
    envTruthy(process.env.VAPID_PRIVATE_KEY);

  const base: Omit<
    StudioHealth,
    | "dbOk"
    | "clubPasswordSet"
    | "membersCount"
    | "gatedVideosCount"
    | "teasersMissingCount"
    | "latestVideo"
    | "paymentReady"
    | "checklist"
  > = {
    resendConfigured,
    youtubeKeyConfigured,
    cronSecretConfigured,
    clubGateSecretConfigured,
  };

  try {
    const admin = getSupabaseAdmin();

    const [
      configRes,
      membersRes,
      gatedRes,
      teaserGapRes,
      latestRes,
    ] = await Promise.all([
      admin
        .from("club_config")
        .select("password_hash")
        .eq("id", 1)
        .maybeSingle(),
      admin.from("club_members").select("phone", { count: "exact", head: true }),
      admin
        .from("videos")
        .select("id", { count: "exact", head: true })
        .or("is_gated.eq.true,is_unlisted.eq.true"),
      admin
        .from("videos")
        .select("id", { count: "exact", head: true })
        .or("is_gated.eq.true,is_unlisted.eq.true")
        .is("teaser_youtube_id", null),
      admin
        .from("videos")
        .select("title, youtube_id, created_at, published_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const clubPasswordSet = Boolean(configRes.data?.password_hash?.trim());
    const membersCount = membersRes.count ?? 0;
    const gatedVideosCount = gatedRes.count ?? 0;
    const teasersMissingCount = teaserGapRes.count ?? 0;

    const checklist: StudioHealthChecklistItem[] = [
      {
        id: "db",
        label: "חיבור למאגר",
        ok: true,
        hint: "Supabase service role עובד.",
      },
      {
        id: "club-password",
        label: "סיסמת מועדון משותפת",
        ok: clubPasswordSet,
        hint: clubPasswordSet
          ? "הוגדרה בסטודיו."
          : "הגדירו סיסמה בפאנל סיסמת מועדון.",
      },
      {
        id: "members",
        label: "רשימת חברים",
        ok: membersCount >= 0,
        hint:
          membersCount > 0
            ? `${membersCount} חברים ברשימה.`
            : "אין חברים עדיין. אפשר להוסיף לפני גבייה.",
      },
      {
        id: "youtube",
        label: "מפתח YouTube API",
        ok: youtubeKeyConfigured,
        hint: youtubeKeyConfigured
          ? "YOUTUBE_API_KEY מוגדר."
          : "הוסיפו YOUTUBE_API_KEY לסנכרון ספרייה.",
      },
      {
        id: "club-gate",
        label: "חתימת קוקי מועדון",
        ok: clubGateSecretConfigured,
        hint: clubGateSecretConfigured
          ? "CLUB_GATE_SECRET מוגדר."
          : "הוסיפו CLUB_GATE_SECRET לכניסת מועדון.",
      },
      {
        id: "resend",
        label: "מייל התראות (Resend)",
        ok: resendConfigured,
        hint: resendConfigured
          ? "RESEND_API_KEY מוגדר."
          : "אופציונלי: RESEND_API_KEY ללידים ומשוב.",
      },
      {
        id: "cron",
        label: "סוד סנכרון (CRON)",
        ok: cronSecretConfigured,
        hint: cronSecretConfigured
          ? "CRON_SECRET מוגדר."
          : "אופציונלי: CRON_SECRET לסנכרון מתוזמן.",
      },
      {
        id: "vapid",
        label: "התראות דפדפן (VAPID)",
        ok: vapidConfigured,
        hint: vapidConfigured
          ? "התראות לייב ואיפוס יומי מוכנות."
          : "חסרים NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY.",
      },
    ];

    const paymentReady =
      true &&
      clubPasswordSet &&
      membersCount >= 0 &&
      youtubeKeyConfigured &&
      clubGateSecretConfigured;

    return {
      ...base,
      dbOk: true,
      clubPasswordSet,
      membersCount,
      gatedVideosCount,
      teasersMissingCount,
      latestVideo: latestRes.data ?? null,
      paymentReady,
      checklist,
    };
  } catch {
    const checklist: StudioHealthChecklistItem[] = [
      {
        id: "db",
        label: "חיבור למאגר",
        ok: false,
        hint: "לא הצלחנו לקרוא מ-Supabase. בדקו מפתחות.",
      },
      {
        id: "club-password",
        label: "סיסמת מועדון משותפת",
        ok: false,
        hint: "לא ניתן לבדוק בלי מאגר.",
      },
      {
        id: "members",
        label: "רשימת חברים",
        ok: false,
        hint: "לא ניתן לבדוק בלי מאגר.",
      },
      {
        id: "youtube",
        label: "מפתח YouTube API",
        ok: youtubeKeyConfigured,
        hint: youtubeKeyConfigured
          ? "YOUTUBE_API_KEY מוגדר."
          : "הוסיפו YOUTUBE_API_KEY.",
      },
      {
        id: "club-gate",
        label: "חתימת קוקי מועדון",
        ok: clubGateSecretConfigured,
        hint: clubGateSecretConfigured
          ? "CLUB_GATE_SECRET מוגדר."
          : "הוסיפו CLUB_GATE_SECRET.",
      },
      {
        id: "resend",
        label: "מייל התראות (Resend)",
        ok: resendConfigured,
        hint: resendConfigured ? "RESEND_API_KEY מוגדר." : "אופציונלי.",
      },
      {
        id: "cron",
        label: "סוד סנכרון (CRON)",
        ok: cronSecretConfigured,
        hint: cronSecretConfigured ? "CRON_SECRET מוגדר." : "אופציונלי.",
      },
      {
        id: "vapid",
        label: "התראות דפדפן (VAPID)",
        ok: vapidConfigured,
        hint: vapidConfigured
          ? "התראות מוכנות."
          : "חסרים מפתחות VAPID.",
      },
    ];

    return {
      ...base,
      dbOk: false,
      clubPasswordSet: false,
      membersCount: 0,
      gatedVideosCount: 0,
      teasersMissingCount: 0,
      latestVideo: null,
      paymentReady: false,
      checklist,
    };
  }
}
