import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Clapperboard,
  Heart,
  Lock,
  Radio,
} from "lucide-react";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { LiveArchivePanel } from "@/components/live/live-archive-panel";
import { LiveExplorePanel } from "@/components/live/live-explore-panel";
import { LiveGateClient } from "@/components/live/live-gate-client";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { resolveVideoEntitlement } from "@/lib/club/access";
import {
  getLiveArchiveItems,
  getLiveVoteLeaders,
} from "@/lib/live/archive";
import { getLivePublicStatus } from "@/lib/live/status";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "שידור חי ממפגשי הפודקאסט",
  description:
    "LIVE באתר: לוח זמנים, לייבים קודמים לחברים, לייקים והזמנת סרטון ללייב. צפייה אונליין או כיסא באולפן במודיעין.",
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
    id: "now",
    icon: Radio,
    title: "שידור חי",
    body: "כשהלייב פעיל: הרשמה, אישור 18+, וקישור מהאתר.",
  },
  {
    id: "archive",
    icon: Lock,
    title: "לייבים קודמים",
    body: "תצוגה מקדימה לכולם. צפייה מלאה לחברי המועדון.",
  },
  {
    id: "likes",
    icon: Heart,
    title: "לייקים",
    body: "רשומים מצביעים. הסרטון המוביל עשוי לעלות בלייב חינם לרשומים.",
  },
  {
    id: "request",
    icon: Clapperboard,
    title: "הזמנת סרטון",
    body: "מבקשים סרטון ספציפי ללייב הבא. מהאתר או בוואטסאפ.",
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
  const [status, viewer, access] = await Promise.all([
    getLivePublicStatus(),
    getLiveViewerState(),
    resolveVideoEntitlement().catch(() => ({
      entitled: false,
      hasVideoAccess: false,
      isAuthenticated: false,
    })),
  ]);

  const hasClubAccess = access.entitled || access.hasVideoAccess;
  const isAuthenticated = viewer.signedIn || access.isAuthenticated;

  const [archiveItems, leaders] = await Promise.all([
    getLiveArchiveItems({ entitled: hasClubAccess, limit: 24 }),
    getLiveVoteLeaders({ entitled: hasClubAccess, limit: 5 }),
  ]);

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "שידור חי", path: "/live" },
  ]);

  return (
    <main className="w-full bg-background text-foreground text-start">
      <JsonLd data={breadcrumbLd} />

      <section aria-labelledby="live-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          LIVE
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow onDark>מפגשי הפודקאסט</Eyebrow>
          <h1
            id="live-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {status.isLive ? (
              <span className="inline-flex flex-wrap items-center gap-3">
                <span
                  className="relative inline-flex size-2.5 shrink-0"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-action/70" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-action" />
                </span>
                <span className="text-[0.7rem] font-semibold tracking-[0.14em] text-action">
                  REC
                </span>
                <span>השידור פעיל עכשיו</span>
              </span>
            ) : (
              <>
                LIVE ממפגשי
                <br />
                הפודקאסט
              </>
            )}
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-foreground/80">
            {status.isLive
              ? status.topic
                ? `נושא עכשיו: ${status.topic}. הרשמה ואישור גיל נדרשים לקישור.`
                : "השידור ממפגש הפודקאסט פעיל. הרשמה ואישור גיל נדרשים לקישור."
              : "שידור חי בלוח קבוע, ארכיון לייבים קודמים לחברים, לייקים שבוחרים כיוון, והזמנת סרטון ללייב."}
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LIVE_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="border border-foreground/15 bg-foreground/[0.03] p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-action" aria-hidden />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <nav
            aria-label="קפיצה בעמוד"
            className="mt-8 flex flex-wrap gap-2"
          >
            <a
              href="#live-now"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline"
            >
              <Radio className="size-3.5" aria-hidden />
              {status.isLive ? "לשידור" : "מתי ואיך"}
            </a>
            <a
              href="#live-archive"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline"
            >
              <Lock className="size-3.5" aria-hidden />
              ארכיון
            </a>
            <a
              href="#live-request"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline"
            >
              <Clapperboard className="size-3.5" aria-hidden />
              הזמנת סרטון
            </a>
            <a
              href="#live-auth"
              className="inline-flex min-h-10 items-center gap-1.5 border border-foreground/20 px-3 text-sm text-foreground no-underline transition hover:border-action hover:text-action hover:no-underline"
            >
              <CalendarDays className="size-3.5" aria-hidden />
              הרשמה
            </a>
          </nav>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <section id="live-now" className="scroll-mt-24" aria-labelledby="live-now-title">
          <h2 id="live-now-title" className="sr-only">
            {status.isLive ? "כניסה לשידור החי" : "לוח שידורים ואפשרויות"}
          </h2>

          {status.isLive ? (
            <div className="mx-auto max-w-xl">
              <LiveGateClient
                isLive={status.isLive}
                topic={status.topic}
                signedIn={viewer.signedIn}
                ageConfirmed={viewer.ageConfirmed}
              />
            </div>
          ) : (
            <LiveExplorePanel density="page" />
          )}
        </section>

        {!isAuthenticated ? (
          <section
            id="live-auth"
            className="mt-14 scroll-mt-24 border border-foreground/12 bg-paper p-5 sm:p-6"
            aria-labelledby="live-auth-title"
          >
            <h2
              id="live-auth-title"
              className="text-lg font-semibold tracking-tight"
            >
              הרשמה ללייקים, לבקשות, ולשידור החי
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/70">
              חשבון חינם מספיק ללייקים ולהזמנת סרטון. צפייה בארכיון הלא רשום דורשת
              חברות במועדון. השידור החי עצמו נפתח לרשומים אחרי אישור גיל.
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <MyListSignInForm nextPath="/live" variant="compact" />
            </div>
            <p className="mt-4 text-sm">
              <Link href="/members" className="text-action no-underline hover:underline">
                כניסה למועדון לצפייה בארכיון
              </Link>
            </p>
          </section>
        ) : (
          <div id="live-auth" className="mt-10 scroll-mt-24">
            {!hasClubAccess ? (
              <p className="border border-foreground/10 bg-paper px-4 py-3 text-sm text-foreground/75">
                מחוברים. לייקים ובקשות פתוחים. לצפייה מלאה בארכיון הלא רשום:{" "}
                <Link
                  href="/members"
                  className="text-action no-underline hover:underline"
                >
                  כניסה למועדון
                </Link>
                .
              </p>
            ) : (
              <p className="text-sm text-foreground/65">
                מחוברים עם גישה למועדון. אפשר לצפות בארכיון מהכרטיסים למטה.
              </p>
            )}
          </div>
        )}

        <section
          id="live-archive"
          className="mt-14 scroll-mt-24 sm:mt-16"
          aria-labelledby="live-archive-title"
        >
          <LiveArchivePanel
            items={archiveItems}
            leaders={leaders}
            isAuthenticated={isAuthenticated}
            hasClubAccess={hasClubAccess}
          />
        </section>
      </div>
    </main>
  );
}
