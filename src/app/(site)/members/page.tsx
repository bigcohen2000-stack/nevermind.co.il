import type { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  KeyRound,
  Library,
  Phone,
  Shield,
} from "lucide-react";

import { SiteBanner } from "@/components/site/site-banner";
import { AccessLayersCompare } from "@/components/members/access-layers-compare";
import { ClubJoinDisclaimer } from "@/components/members/club-join-disclaimer";
import { ClubLoginForm } from "@/components/members/club-login-form";
import { ClubWhatsNewSection } from "@/components/members/club-whats-new";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { MemberOffersStrip } from "@/components/members/member-offers-strip";
import { MembersAccessSteps } from "@/components/members/members-access-steps";
import { MembersCredibilityFaq } from "@/components/members/members-credibility-faq";
import { MembersJumpNav } from "@/components/members/members-jump-nav";
import { MembersPricing } from "@/components/members/members-pricing";
import { MembersStatsStrip } from "@/components/members/members-stats-strip";
import { MembershipBenefitsBoard } from "@/components/members/membership-benefits-board";
import { MembersSyllabusSection } from "@/components/members/members-syllabus-section";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { RandomClubButton } from "@/components/members/random-club-button";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { InfoTip } from "@/components/ui/info-tip";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { MEMBERSHIP_HIGHLIGHTS } from "@/lib/content/access-layers";
import { getMembersLibraryPreview } from "@/lib/members/library-stats";
import { getClubWhatsNew } from "@/lib/members/whats-new";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "כניסה למועדון",
  description:
    "מאגר המועדון של NeverMind: כניסה בקישור או סיסמה, מה כלול, ופיד פרטי. אין סליקה באתר. גישה אחרי שיחת התאמה.",
  alternates: {
    canonical: "https://nevermind.co.il/members",
  },
  ...shareImageMetadata("כניסה למועדון."),
};

const ACCESS_TEXT =
  "היי יקיר, אני מבקש גישה למאגר הסרטונים של המועדון באתר. אשמח לשיחת התאמה.";

const HIGHLIGHT_ICONS = {
  shield: Shield,
  phone: Phone,
  library: Library,
  headphones: Headphones,
} as const;

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

  const isMember = access.clubSession || access.entitled;
  const { stats } = preview;
  const whatsNew = isMember
    ? await getClubWhatsNew({ phone: access.phone, limit: 8 }).catch(() => [])
    : [];

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מועדון", path: "/members" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />

      <section aria-labelledby="members-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          מועדון
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow onDark>מאגר חברים</Eyebrow>
          <h1
            id="members-hero-title"
            className="mt-5 max-w-3xl text-fluid-display font-semibold leading-[1.05] tracking-tight"
          >
            {isMember ? "אתם בפנים." : "כניסה למועדון."}
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-foreground/80">
            {isMember
              ? "המאגר פתוח במכשיר הזה. אפשר לחקור, לחפש, ולחזור לסרטונים."
              : "חלק מהסרטונים פתוחים לכולם. מאגר המועדון נפתח עם קישור אישי או סיסמה בוואטסאפ. אין סליקה באתר."}
          </p>

          {!isMember ? (
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MEMBERSHIP_HIGHLIGHTS.map((item) => {
                const Icon = HIGHLIGHT_ICONS[item.icon];
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
          ) : null}

          <MembersJumpNav isMember={isMember} className="mt-8" />

          {!isMember ? (
            <ClubJoinDisclaimer tone="dark" className="mt-8" />
          ) : null}

          <div className="mt-8 max-w-xl">
            <SiteBanner slot="members_hero" density="compact" />
          </div>

          {stats.clubVideos > 0 ? (
            <p className="mt-5 inline-flex flex-wrap items-center gap-1.5 text-sm text-foreground/65">
              <span>
                כרגע במאגר:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {stats.clubVideos.toLocaleString("he-IL")}
                </span>{" "}
                סרטונים חסומים.
              </span>
              <InfoTip label="הסבר על סרטונים חסומים" tone="dark">
                מספר חי מהאתר אחרי סנכרון. הכותרת גלויה. הצפייה אחרי כניסה
                למועדון.
              </InfoTip>
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-end gap-3">
            {isMember ? (
              <>
                <Link href="/videos?filter=club" className="btn btn-primary">
                  למאגר המועדון
                </Link>
                <Link href="/search" className="btn btn-secondary">
                  חיפוש
                </Link>
                <Link href="/live" className="btn btn-secondary">
                  לייב
                </Link>
                <a href="#podcast" className="btn btn-secondary">
                  פיד פרטי
                </a>
                <Link href="/members/vault" className="btn btn-secondary">
                  כספת נכסים
                </Link>
                <Link href="/my-list" className="btn btn-secondary">
                  הרשימה שלי
                </Link>
                <RandomClubButton variant="secondary" />
              </>
            ) : (
              <>
                <a href="#access" className="btn btn-primary">
                  <KeyRound className="size-3.5" aria-hidden />
                  בקשת גישה למועדון
                </a>
                <a href="#login" className="btn btn-secondary">
                  כניסה עם סיסמה
                </a>
                <a
                  href={buildWhatsAppHref(ACCESS_TEXT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  וואטסאפ
                </a>
                <a href="#membership-prices" className="btn btn-secondary">
                  מחירים
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {!isMember ? (
        <InvestigationFactsStrip
          tone="paper"
          moreHref="#membership-benefits"
          moreLabel="מה כלול במועדון"
        />
      ) : null}

      <MembersStatsStrip preview={preview} hasFullAccess={isMember} />

      {!isMember ? (
        <section
          aria-labelledby="access-layers-title"
          className="bg-background text-foreground"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-medium tracking-wide text-action">
              שכבות גישה
            </p>
            <h2
              id="access-layers-title"
              className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              אורח, חשבון מייל, ומועדון.
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
              שלוש שכבות ברורות. חשבון מייל שומר רשימה. מועדון פותח את המאגר.
              בלי סליקה באתר.
            </p>
            <div className="mt-8">
              <AccessLayersCompare />
            </div>
          </div>
        </section>
      ) : null}

      {isMember ? (
        <section
          id="member-hub"
          className="scroll-mt-24 bg-background text-foreground"
          aria-labelledby="member-hub-title"
        >
          <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
            <div>
              <h2
                id="member-hub-title"
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                אתם בפנים
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
                קיצורי דרך למאגר, חיפוש, לייב, רשימה ופיד. בלי הפרעות.
              </p>
            </div>
            <MemberOffersStrip
              isMember
              tone="light"
              title="מה פתוח לכם עכשיו"
            />
            <div className="border border-foreground/15 bg-paper p-5">
              <p className="text-sm font-medium text-foreground">סרטון אקראי</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                קפיצה ישירה לסרטון מועדון. בלי לבחור מראש.
              </p>
              <RandomClubButton className="mt-4" variant="secondary" />
            </div>
            <ClubWhatsNewSection videos={whatsNew} />
            <PrivatePodcastBanner memberMode />
          </div>
        </section>
      ) : null}

      <section
        id="access"
        className="scroll-mt-24 bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
                <KeyRound className="size-3.5" aria-hidden />
                כניסה ובקשת גישה
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {isMember ? "סטטוס גישה" : "יש לכם סיסמה או קישור?"}
              </h2>
              {!isMember ? (
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
                  ממלאים כאן אחרי שקיבלתם סיסמה. אין סיסמה עדיין? מבקשים
                  בוואטסאפ אחרי שיחת התאמה.
                </p>
              ) : null}
            </div>
            {!isMember ? (
              <a
                href={buildWhatsAppHref(ACCESS_TEXT)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                בקשת גישה
              </a>
            ) : null}
          </div>
          <ClubLoginForm
            alreadyIn={isMember}
            initialPhone={access.phone}
            variant={isMember ? "gate" : "page"}
          />
        </div>
      </section>

      {!isMember ? (
        <section className="border-y border-foreground/10 bg-paper">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <PrivatePodcastBanner memberMode={false} />
          </div>
        </section>
      ) : null}

      {!isMember ? (
        <MembershipBenefitsBoard
          surface="members"
          isMember={false}
          showOffers={false}
          showPricing={false}
        />
      ) : null}

      {!isMember ? <MembersPricing /> : null}

      <MembersSyllabusSection />

      {!isMember ? <MembersCredibilityFaq /> : null}

      {!isMember ? <MembersAccessSteps /> : null}

      {!isMember ? <NewsletterSignup source="members" /> : null}

      {!isMember ? (
        <section className="border-t border-foreground/10 bg-paper text-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-14">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                מוכנים להתחיל?
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                כניסה עם סיסמה, בקשת גישה, או חזרה למאגר אם כבר בפנים.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#login" className="btn btn-primary">
                לטופס הכניסה
              </a>
              <a
                href={buildWhatsAppHref(ACCESS_TEXT)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                וואטסאפ
              </a>
              <Link href="/contact?from=members" className="btn btn-secondary">
                צור קשר
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
