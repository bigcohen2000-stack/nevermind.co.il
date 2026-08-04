import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Lock,
  Mic,
  Radio,
  Users,
} from "lucide-react";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { LiveArchivePanel } from "@/components/live/live-archive-panel";
import { LiveGateClient } from "@/components/live/live-gate-client";
import {
  LiveJoinPaths,
  LiveScheduleBlock,
  LiveWatchExplain,
} from "@/components/live/live-join-paths";
import { LiveNotifyHint } from "@/components/live/live-notify-hint";
import { LiveRecBadge } from "@/components/live/live-rec-badge";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductFaq } from "@/components/seo/product-faq";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { InfoTip } from "@/components/ui/info-tip";
import { SiteAccordion } from "@/components/ui/site-accordion";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { LIVE_FAQ } from "@/lib/content/offers";
import {
  getLiveArchiveItems,
  getLiveVoteLeaders,
} from "@/lib/live/archive";
import { listUpcomingLivePublic } from "@/lib/live/queue";
import { getLivePublicStatus } from "@/lib/live/status";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "שידור חי ממפגשי הפודקאסט",
  description:
    "שידור חי ממפגשי הפודקאסט של NeverMind. הצטרפות אישית או קבוצתית. ארכיון למפגשים לחברי מועדון.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "https://nevermind.co.il/live",
  },
  ...shareImageMetadata("שידור חי. מפגשי הפודקאסט."),
};

const LIVE_HIGHLIGHTS = [
  {
    id: "join",
    icon: Users,
    title: "הצטרפות",
    body: "אישי באולפן, או קבוצתי עם מיקרופון.",
    tip: "שני מסלולים: כיסא באולפן במודיעין, או מיקרופון בלייב הקבוצתי. תיאום בשיחה. אין סליקה באתר.",
  },
  {
    id: "watch",
    icon: Radio,
    title: "צפייה בלייב",
    body: "מהאתר. הרשמה ואישור גיל כשהשידור פעיל.",
    tip: "כשהשידור פעיל מופיע שער כניסה למטה. נדרשים חשבון חינם ואישור 18+. הקישור לא מוצג לציבור הפתוח.",
  },
  {
    id: "archive",
    icon: Lock,
    title: "ארכיון",
    body: "הקלטות לא רשומות. רק לחברי מועדון.",
    tip: "הקלטות מהשידורים הלא רשומים נפתחות לחברי מועדון בלבד. לא מוצגות כאן לציבור.",
  },
] as const;

async function getLiveViewerState(): Promise<{
  signedIn: boolean;
  ageConfirmed: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { signedIn: false, ageConfirmed: false };
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("age_confirmed_at")
      .eq("id", user.id)
      .maybeSingle();

    return {
      signedIn: true,
      ageConfirmed: Boolean(profile?.age_confirmed_at),
    };
  } catch {
    return { signedIn: false, ageConfirmed: false };
  }
}

export default async function LivePage() {
  const [status, viewer, access, upcoming] = await Promise.all([
    getLivePublicStatus(),
    getLiveViewerState(),
    resolveVideoEntitlement().catch(() => ({
      entitled: false,
      hasVideoAccess: false,
      isAuthenticated: false,
    })),
    listUpcomingLivePublic(8),
  ]);

  const hasClubAccess = access.entitled || access.hasVideoAccess;
  const isAuthenticated = viewer.signedIn || access.isAuthenticated;

  const [archiveAll, leaders] = await Promise.all([
    getLiveArchiveItems({ entitled: hasClubAccess, limit: 24 }),
    hasClubAccess
      ? getLiveVoteLeaders({ entitled: true, limit: 3 })
      : Promise.resolve([]),
  ]);

  const archiveCount = archiveAll.length;
  const archiveItems = hasClubAccess ? archiveAll : [];

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "שידור חי", path: "/live" },
  ]);

  return (
    <main className="w-full bg-background text-foreground text-start">
      <JsonLd data={breadcrumbLd} />

      <section aria-labelledby="live-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          LIVE
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
          <Eyebrow onDark>מפגשי הפודקאסט</Eyebrow>
          <h1
            id="live-title"
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
          >
            {status.isLive ? (
              <span className="inline-flex flex-wrap items-center gap-3">
                <LiveRecBadge active tipTone="dark" />
                <span>השידור פעיל עכשיו</span>
              </span>
            ) : (
              <>
                לייב הפודקאסט.
                <br />
                אישי או קבוצתי.
              </>
            )}
          </h1>
          <p className="mt-6 inline-flex max-w-prose flex-wrap items-start gap-1.5 text-base leading-relaxed text-foreground/80 sm:text-lg">
            <span>
              {status.isLive
                ? status.topic
                  ? `נושא עכשיו: ${status.topic}. הרשמה ואישור גיל נדרשים לקישור.`
                  : "השידור פעיל. הרשמה ואישור גיל נדרשים לקישור."
                : "רוצים להצטרף למפגש: כיסא באולפן או מיקרופון בלייב הקבוצתי. צופים מהאתר. ארכיון רק לחברים."}
            </span>
            {!status.isLive ? (
              <InfoTip label="מה יש בעמוד הזה" tone="dark">
                כאן מצטרפים למפגש, בודקים מתי משדרים, נכנסים לשידור כשהוא פעיל,
                ורואים ארכיון אם יש גישת מועדון.
              </InfoTip>
            ) : null}
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {LIVE_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="border border-foreground/15 bg-foreground/[0.03] p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4 text-action" aria-hidden />
                    <span>{item.title}</span>
                    <InfoTip
                      label={`הסבר: ${item.title}`}
                      tone="dark"
                      className="size-6"
                    >
                      {item.tip}
                    </InfoTip>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <nav aria-label="ניווט מהיר" className="mt-8 flex flex-wrap gap-2">
            <a
              href="#join"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
              title="מעבר להצטרפות למפגש"
            >
              <Mic className="size-3.5 text-action" aria-hidden />
              הצטרפות
            </a>
            <a
              href="#schedule"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
              title="מעבר ללוח השידורים"
            >
              <CalendarDays className="size-3.5 text-action" aria-hidden />
              מתי
            </a>
            <a
              href="#watch"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
              title="מעבר לצפייה בשידור"
            >
              <Radio className="size-3.5 text-action" aria-hidden />
              צפייה
            </a>
            <a
              href="#archive"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
              title="מעבר לארכיון לייבים"
            >
              <Lock className="size-3.5 text-action" aria-hidden />
              ארכיון
            </a>
          </nav>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {status.isLive ? (
          <section
            id="live-now"
            className="mb-10 scroll-mt-24 border border-action/40 bg-paper p-5 sm:p-6"
            aria-labelledby="live-now-title"
          >
            <h2
              id="live-now-title"
              className="text-lg font-semibold tracking-tight"
            >
              כניסה לשידור החי
            </h2>
            <div className="mt-5">
              <LiveGateClient
                isLive={status.isLive}
                topic={status.topic}
                signedIn={viewer.signedIn}
                ageConfirmed={viewer.ageConfirmed}
              />
            </div>
          </section>
        ) : null}

        <SiteAccordion
          items={[
            {
              id: "join",
              title: "הצטרפות לפודקאסט",
              summary: "אישי באולפן במודיעין, או קבוצתי עם מיקרופון בלייב.",
              defaultOpen: !status.isLive,
              children: <LiveJoinPaths />,
            },
            {
              id: "schedule",
              title: "מתי משדרים",
              summary:
                upcoming.length > 0
                  ? "תאריכים מתוכננים + לוח קבוע."
                  : "שלישי וחמישי 20:00. מוצאי שבת 22:00.",
              children: <LiveScheduleBlock upcoming={upcoming} />,
            },
            {
              id: "watch",
              title: "צפייה בשידור מהאתר",
              summary: "הרשמה חינם. קישור רק כשהלייב פעיל.",
              children: (
                <div className="space-y-6">
                  <LiveWatchExplain />
                  {!isAuthenticated ? (
                    <div id="live-auth" className="scroll-mt-24">
                      <p className="mb-4 text-sm text-foreground/75">
                        הרשמה לשידור החי, ללייקים ולבקשות נושא.
                      </p>
                      <MyListSignInForm nextPath="/live" variant="compact" />
                    </div>
                  ) : (
                    <p id="live-auth" className="text-sm text-foreground/70">
                      מחוברים.
                      {!hasClubAccess ? (
                        <>
                          {" "}
                          לצפייה בארכיון:{" "}
                          <Link
                            href="/members"
                            className="text-action no-underline hover:underline"
                          >
                            כניסה למועדון
                          </Link>
                          .
                        </>
                      ) : (
                        " אפשר לפתוח את ארכיון החברים למטה."
                      )}
                    </p>
                  )}
                  {!status.isLive ? (
                    <p className="text-sm text-muted">
                      כרגע אין שידור פעיל. בדקו את הלוח, או הוסיפו ליומן.
                    </p>
                  ) : null}
                  <LiveNotifyHint signedIn={viewer.signedIn} />
                </div>
              ),
            },
            {
              id: "archive",
              title: "ארכיון לייבים",
              summary: hasClubAccess
                ? "עד 3 כותרות. אפשר לפתוח עוד. בלי תמונות מקדימות."
                : "סגור לציבור. נפתח לחברי מועדון.",
              children: (
                <LiveArchivePanel
                  items={archiveItems}
                  leaders={leaders}
                  isAuthenticated={isAuthenticated}
                  hasClubAccess={hasClubAccess}
                  archiveCount={archiveCount}
                />
              ),
            },
          ]}
        />

        <p className="mt-10 text-center text-sm text-muted">
          שאלות כלליות:{" "}
          <Link
            href="/contact?from=live"
            className="text-action no-underline hover:underline"
          >
            יצירת קשר
          </Link>
          {", "}
          <Link
            href="/members"
            className="text-action no-underline hover:underline"
          >
            מועדון
          </Link>
          {", "}
          <Link
            href="/paths"
            className="text-action no-underline hover:underline"
          >
            מסלולים
          </Link>
        </p>

        <div className="mt-12">
          <ProductFaq
            items={LIVE_FAQ}
            title="שאלות על השידור החי"
            headingId="live-faq-title"
            tone="paper"
          />
        </div>
      </div>
    </main>
  );
}
