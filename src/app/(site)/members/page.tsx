import type { Metadata } from "next";
import Link from "next/link";

import { HeartQuestionsStrip } from "@/components/community/heart-questions-strip";
import { SiteBanner } from "@/components/site/site-banner";
import { AccessLayersCompare } from "@/components/members/access-layers-compare";
import { ClubJoinDisclaimer } from "@/components/members/club-join-disclaimer";
import { ClubLoginForm } from "@/components/members/club-login-form";
import { MembersPricing } from "@/components/members/members-pricing";
import { MembersStatsStrip } from "@/components/members/members-stats-strip";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { ARCHIVE_SYLLABUS, ARCHIVE_TOOLS_NOTE } from "@/lib/content/offers";
import { getMembersLibraryPreview } from "@/lib/members/library-stats";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "כניסה למועדון",
  description:
    "הגישה למאגר התכנים פתוחה לחברי המועדון. קישור או סיסמה בוואטסאפ לאחר הסדרת הגישה.",
  ...shareImageMetadata("כניסה למועדון."),
};

const ACCESS_TEXT =
  "היי יקיר, אני מבקש גישה למאגר הסרטונים של המועדון באתר. אשמח לשיחת התאמה.";

export default async function MembersPage() {
  const [access, preview] = await Promise.all([
    resolveVideoEntitlement().catch(() => ({
      entitled: false,
      clubSession: false,
      hasVideoAccess: false,
      isAuthenticated: false,
      phone: null as string | null,
      displayName: null as string | null,
    })),
    getMembersLibraryPreview(),
  ]);
  const { stats } = preview;

  return (
    <main className="w-full text-start">
      <section aria-labelledby="members-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          מועדון
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>מאגר חברים</Eyebrow>
          <h1
            id="members-hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            כניסה למועדון.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
            חלק מהסרטונים פתוחים לכולם. מאגר המועדון נפתח עם קישור אישי או
            סיסמה שקיבלתם ממני בוואטסאפ. אין סליקה באתר. זו קהילה סגורה של
            חוקרי אמת.
          </p>
          <p className="mt-5 max-w-prose text-sm leading-relaxed text-foreground/65">
            כ-150+ שעות חקירה. כ-300 סרטוני ארכיון. מעל 50 מושגי יסוד שפורקו.
            ארבע רמות פירוק. מאז 2021.
          </p>
          <ClubJoinDisclaimer tone="dark" className="mt-8" />
          <div className="mt-8 max-w-xl">
            <SiteBanner slot="members_hero" density="compact" />
          </div>
          {stats.clubVideos > 0 ? (
            <p className="mt-4 text-sm text-foreground/65">
              כרגע במאגר המועדון באתר:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {stats.clubVideos.toLocaleString("he-IL")}
              </span>{" "}
              סרטונים חסומים.
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-end gap-3">
            <a href="#login" className="btn btn-primary">
              כניסה למועדון
            </a>
            <a
              href={buildWhatsAppHref(ACCESS_TEXT)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              בקשת גישה בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      <MembersStatsStrip preview={preview} />

      <HeartQuestionsStrip surface="members" />

      <section className="bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
          <PrivatePodcastBanner
            memberMode={access.clubSession || access.entitled}
          />
        </div>
      </section>

      <section className="bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <ClubLoginForm
            alreadyIn={access.clubSession || access.entitled}
            initialPhone={access.phone}
          />
        </div>
      </section>

      <section
        aria-labelledby="members-benefits-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>חינם מול מועדון</Eyebrow>
          <h2
            id="members-benefits-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            מה פתוח. מה במועדון.
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
            {ARCHIVE_TOOLS_NOTE} בנוסף: פיד פודקאסט פרטי לחברי מועדון בלבד.
          </p>

          <div className="mt-12">
            <AccessLayersCompare />
          </div>

          <h3 className="mt-14 text-sm font-medium tracking-wide text-action">
            נושאים במאגר
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ARCHIVE_SYLLABUS.map((item) => (
              <li
                key={item}
                className="border border-foreground/20 px-3 py-1.5 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MembersPricing />

      <section className="border-t border-foreground/10 bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>איך מקבלים גישה</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">
            שלושה צעדים קצרים.
          </h2>
          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            <li>
              <span className="text-4xl font-semibold text-foreground/15">
                01
              </span>
              <h3 className="mt-4 text-xl font-semibold">מבקשים בוואטסאפ</h3>
              <p className="mt-3 leading-relaxed text-foreground/80">
                כותבים לבקשת גישה. בודקים התאמה בשיחה קצרה.
              </p>
            </li>
            <li>
              <span className="text-4xl font-semibold text-foreground/15">
                02
              </span>
              <h3 className="mt-4 text-xl font-semibold">
                מקבלים קישור או סיסמה
              </h3>
              <p className="mt-3 leading-relaxed text-foreground/80">
                קישור אישי בוואטסאפ, או סיסמת מועדון. לוחצים או ממלאים למטה.
              </p>
            </li>
            <li>
              <span className="text-4xl font-semibold text-foreground/15">
                03
              </span>
              <h3 className="mt-4 text-xl font-semibold">נכנסים למאגר</h3>
              <p className="mt-3 leading-relaxed text-foreground/80">
                אחרי הכניסה, סרטוני המועדון נפתחים במכשיר הזה. אפשר גם לבקש
                קישור לפיד פודקאסט פרטי להאזנה באפליקציה.
              </p>
            </li>
          </ol>

          <p className="mt-14 max-w-prose text-sm leading-relaxed text-muted">
            פירוט מסלולי ייעוץ בעמוד{" "}
            <Link href="/paths" className="underline-offset-4 hover:underline">
              המסלולים
            </Link>
            . שאלות כלליות:{" "}
            <Link href="/contact" className="underline-offset-4 hover:underline">
              צור קשר
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
