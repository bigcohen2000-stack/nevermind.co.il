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
import { InfoTip } from "@/components/ui/info-tip";
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

const SYLLABUS_TIPS: Record<string, string> = {
  יחסים: "ציר של קרבה, האשמה, זוגיות ופרידה. מוביל לחיפוש ולמאמרים בציר הזה.",
  מציאות: "ההפרדה בין מה שקרה לבין הסיפור שמספרים על מה שקרה.",
  "בחירה חופשית": "חקירה של האם יש בוחר, או רק קריינות אחרי הפעולה.",
  התמכרויות: "תבניות הישרדות שחוזרות. חלקן במאגר המועדון.",
  סמים: "חקירות עומק בנושא. לרוב ברמות החסומות יותר.",
  תודעה: "מי צופה, מי מדבר, ומה נשאר כשהסיפור על ה'אני' נרגע.",
};

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
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/65">
            מדדי העומק והספירה החיה מופיעים למטה, עם הסברים קצרים ליד כל מושג.
          </p>
          <ClubJoinDisclaimer tone="dark" className="mt-8" />
          <div className="mt-8 max-w-xl">
            <SiteBanner slot="members_hero" density="compact" />
          </div>
          {stats.clubVideos > 0 ? (
            <p className="mt-4 inline-flex flex-wrap items-center gap-1.5 text-sm text-foreground/65">
              <span>
                כרגע במאגר המועדון באתר:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {stats.clubVideos.toLocaleString("he-IL")}
                </span>{" "}
                סרטונים חסומים.
              </span>
              <InfoTip
                label="הסבר על סרטונים חסומים"
                tone="dark"
              >
                מספר חי מהאתר אחרי סנכרון. הכותרת גלויה. הצפייה אחרי כניסה
                למועדון.
              </InfoTip>
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
          <p className="mt-4 flex max-w-prose items-start gap-1.5 text-sm leading-relaxed text-muted sm:text-base">
            <span>{ARCHIVE_TOOLS_NOTE} בנוסף: פיד פודקאסט פרטי לחברי מועדון בלבד.</span>
            <InfoTip label="הסבר על כלי המאגר">
              חיפוש פנימי, מדדי חקירה, ופיד פרטי. הכל חלק מהמאגר אחרי כניסה.
              אין סליקה באתר.
            </InfoTip>
          </p>

          <div className="mt-12">
            <AccessLayersCompare />
          </div>

          <div className="mt-14 flex items-center gap-1.5">
            <h3 className="text-sm font-medium tracking-wide text-action">
              נושאים במאגר
            </h3>
            <InfoTip label="הסבר על נושאים במאגר">
              דוגמאות לנושאים שחוזרים במאגר. לחיצה פותחת חיפוש באתר.
            </InfoTip>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ARCHIVE_SYLLABUS.map((item) => (
              <li key={item}>
                <span className="inline-flex items-center gap-1 border border-foreground/20 bg-background px-2.5 py-1.5 text-sm text-foreground">
                  <Link
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="no-underline hover:text-action hover:no-underline"
                  >
                    {item}
                  </Link>
                  <InfoTip label={`הסבר על ${item}`}>
                    {SYLLABUS_TIPS[item] ??
                      "נושא שחוזר במאגר. אפשר לחפש אותו או לעבור למנגנונים."}
                  </InfoTip>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/mechanisms" className="link-arrow">
              מפת המנגנונים
            </Link>
            <Link href="/concepts" className="link-arrow">
              מדריך המושגים
            </Link>
            <Link href="/search" className="link-arrow">
              חיפוש חופשי
            </Link>
          </p>
        </div>
      </section>

      <MembersPricing />

      <section className="border-t border-foreground/10 bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>איך מקבלים גישה</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">
            שלושה צעדים קצרים.
          </h2>

          <div className="mt-10 space-y-3">
            <details className="group border border-foreground/15 bg-background open:bg-background" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 text-base font-semibold">
                  <span className="text-foreground/30">01</span>
                  מבקשים בוואטסאפ
                  <InfoTip label="הסבר על בקשת גישה">
                    שיחת התאמה קצרה. בודקים אם הכיוון מתאים לפני שפותחים מאגר.
                  </InfoTip>
                </span>
                <span aria-hidden="true" className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-foreground/10 px-5 py-5 text-sm leading-relaxed text-foreground/80">
                כותבים לבקשת גישה. בודקים התאמה בשיחה קצרה.
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={buildWhatsAppHref(ACCESS_TEXT)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    בקשת גישה בוואטסאפ
                  </a>
                  <Link href="/contact" className="btn btn-secondary">
                    צור קשר
                  </Link>
                </div>
              </div>
            </details>

            <details className="group border border-foreground/15 bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 text-base font-semibold">
                  <span className="text-foreground/30">02</span>
                  מקבלים קישור או סיסמה
                  <InfoTip label="הסבר על קישור וסיסמה">
                    קישור אישי נפתח ישירות. סיסמה ממלאים בטופס הכניסה בעמוד הזה.
                  </InfoTip>
                </span>
                <span aria-hidden="true" className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-foreground/10 px-5 py-5 text-sm leading-relaxed text-foreground/80">
                קישור אישי בוואטסאפ, או סיסמת מועדון. לוחצים או ממלאים בטופס
                הכניסה.
                <div className="mt-4">
                  <a href="#login" className="link-arrow">
                    לטופס הכניסה ←
                  </a>
                </div>
              </div>
            </details>

            <details className="group border border-foreground/15 bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 text-base font-semibold">
                  <span className="text-foreground/30">03</span>
                  נכנסים למאגר
                  <InfoTip label="הסבר על כניסה למאגר">
                    אחרי כניסה במכשיר, סרטוני המועדון נפתחים. אפשר גם לבקש פיד
                    פודקאסט פרטי.
                  </InfoTip>
                </span>
                <span aria-hidden="true" className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-foreground/10 px-5 py-5 text-sm leading-relaxed text-foreground/80">
                אחרי הכניסה, סרטוני המועדון נפתחים במכשיר הזה. אפשר גם לבקש
                קישור לפיד פודקאסט פרטי להאזנה באפליקציה.
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  <Link href="/videos?filter=club" className="link-arrow">
                    סרטוני מועדון
                  </Link>
                  <Link href="/paths" className="link-arrow">
                    מסלולים ומחירים
                  </Link>
                </div>
              </div>
            </details>
          </div>

          <p className="mt-14 max-w-prose text-sm leading-relaxed text-muted">
            פירוט מסלולי ייעוץ בעמוד{" "}
            <Link href="/paths" className="underline-offset-4 hover:underline">
              המסלולים
            </Link>
            . שאלות כלליות:{" "}
            <Link href="/contact" className="underline-offset-4 hover:underline">
              צור קשר
            </Link>
            . מבנה התוכן:{" "}
            <Link
              href="/mechanisms"
              className="underline-offset-4 hover:underline"
            >
              מנגנונים
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
