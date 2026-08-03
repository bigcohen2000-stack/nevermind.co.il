import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RandomClubButton } from "@/components/members/random-club-button";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { SocialOutboundLinks } from "@/components/layout/social-outbound-links";
import { PodcastSubscribe } from "@/components/podcast/podcast-subscribe";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { ContinueWatchingSection } from "@/components/videos/continue-watching-section";
import { VideoGridSkeleton } from "@/components/videos/video-grid-skeleton";
import { VideosResults } from "@/components/videos/videos-results";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { parseVideosBrowseParams } from "@/lib/videos/browse-params";

export const dynamic = "force-dynamic";

type VideosPageProps = {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
    concept?: string;
    breakdown?: string;
    level?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: VideosPageProps): Promise<Metadata> {
  const params = parseVideosBrowseParams(await searchParams);
  const parts = ["וידאו והרצאות"];
  if (params.concept) parts.push(params.concept);
  if (params.page > 1) parts.push(`עמוד ${params.page}`);

  const description = params.concept
    ? `סרטונים בנושא ${params.concept}. חפש סרטונים ומושגים ב-NeverMinde.`
    : "אותם מנגנונים, בקול. חפש סרטונים ומושגים. המאמרים נשארים מקור המסגרת.";

  const canonicalQs = new URLSearchParams();
  if (params.filter !== "all") canonicalQs.set("filter", params.filter);
  if (params.sort !== "newest") canonicalQs.set("sort", params.sort);
  if (params.concept) canonicalQs.set("concept", params.concept);
  if (params.breakdown) canonicalQs.set("breakdown", params.breakdown);
  if (params.page > 1) canonicalQs.set("page", String(params.page));
  const qs = canonicalQs.toString();

  const ogTitle = params.concept
    ? `סרטונים: ${params.concept}`
    : "אותו ניתוח, בקול.";

  return {
    title: parts.join(" | "),
    description,
    alternates: {
      canonical: qs
        ? `https://nevermind.co.il/videos?${qs}`
        : "https://nevermind.co.il/videos",
    },
    ...shareImageMetadata(ogTitle),
  };
}

function VideosResultsFallback() {
  return (
    <>
      <div className="lg:max-w-2xl">
        <p className="mt-4 max-w-prose leading-relaxed">
          <span
            aria-hidden="true"
            className="inline-block h-[1.5em] w-full max-w-md animate-pulse rounded-sm bg-foreground/10 align-middle"
          />
        </p>
      </div>
      <VideoGridSkeleton count={12} className="mt-14" />
    </>
  );
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const access = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
  }));
  const { filter, sort, concept, breakdown, page } = parseVideosBrowseParams(
    await searchParams,
  );

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "סרטונים", path: "/videos" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />
      <section aria-labelledby="videos-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          הרצאות
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>וידאו והרצאות</Eyebrow>
              <h1
                id="videos-hero-title"
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                אותו ניתוח,
                <br />
                בקול.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
                חפש לפי מושג או כותרת. סרטוני מועדון מסומנים בתג. אפשר לסנן
                ולמיין. הצפייה במאגר נפתחת אחרי כניסה.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#videos-browse" className="btn btn-secondary">
                  פתיחת סינון ומיון
                </a>
                {access.entitled ? (
                  <RandomClubButton variant="secondary" />
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-7">
              <HeroSearchSection variant="dark" />
            </div>
          </div>
        </div>
      </section>

      <InvestigationFactsStrip
        tone="paper"
        factIds={["hours", "levels", "concepts", "since", "views"]}
        moreHref="/members"
        moreLabel="למועדון ולמאגר"
      />

      <ContinueWatchingSection variant="strip" />

      <section
        aria-labelledby="videos-list-title"
        className="band-paper border-b border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>ספרייה</Eyebrow>
            <h2
              id="videos-list-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              סרטונים זמינים לחקירה.
            </h2>
          </div>

          <Suspense fallback={<VideosResultsFallback />}>
            <VideosResults
              filter={filter}
              sort={sort}
              concept={concept}
              breakdown={breakdown}
              page={page}
            />
          </Suspense>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/videos/topics" className="link-arrow">
              עיון לפי נושא
            </Link>
            <Link href="/search" className="link-arrow">
              לכל החיפוש
            </Link>
            <Link href="/concepts" className="link-arrow">
              למדריך המושגים
            </Link>
            <Link href="/members" className="link-arrow">
              לכניסה למועדון
            </Link>
            <Link href="/articles" className="link-arrow">
              למאמרים
            </Link>
          </div>

          <div className="mt-12 border-t border-foreground/10 pt-10">
            <h3 className="text-lg font-semibold tracking-tight">
              פודקאסט: חינם מול מועדון
            </h3>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
              חינם: פיד ציבורי להרצאות הפתוחות. מועדון: פיד RSS אישי למאגר
              הלא-רשום, להאזנה בנהיגה או בהליכה.
            </p>
            <PodcastSubscribe className="mt-4" variant="light" />
            <div className="mt-6">
              <PrivatePodcastBanner density="compact" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="videos-philosophy-title" className="band-dark">
        <Watermark className="top-[-1rem] end-[-0.5rem] text-[5rem] text-foreground/[0.045] sm:text-[7rem] lg:text-[10rem]">
          מבנה
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>למה וידאו</Eyebrow>
              <h2
                id="videos-philosophy-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                וידאו אינו בידור.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-lg leading-relaxed text-foreground/80">
                הווידאו כאן אינו נועד לבדר או להלהיב. הוא דרך נוספת להתבונן
                במבנה: לראות את אותו מנגנון פועל בזמן אמת, בקול ובקצב אחר.
              </p>
              <p className="mt-5 max-w-prose leading-relaxed text-foreground/70">
                המאמרים נשארים מקור המסגרת. הווידאו מלווה אותם, לא מחליף אותם.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="videos-cta-title"
        className="border-t border-foreground bg-ink text-[#FAFAF8]"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-6">
              <h2
                id="videos-cta-title"
                className="text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl"
              >
                מסגרת בכתב, או מאגר מלא.
              </h2>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-[#FAFAF8]/70">
                המאמרים פתוחים לכולם. המועדון נפתח אחרי שיחת התאמה. אין סליקה
                באתר.
              </p>
            </div>

            <div className="lg:col-span-6">
              <ul className="divide-y divide-[#FAFAF8]/15 border-y border-[#FAFAF8]/15">
                <li>
                  <Link
                    href="/articles"
                    className="group flex min-h-14 items-center justify-between gap-4 py-4 text-[#FAFAF8] no-underline transition-opacity hover:opacity-90 hover:no-underline"
                  >
                    <span>
                      <span className="block text-base font-medium tracking-tight">
                        מאמרים
                      </span>
                      <span className="mt-0.5 block text-sm text-[#FAFAF8]/60">
                        המסגרת בכתב, פתוח
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-sm text-[#FAFAF8]/45 transition-colors group-hover:text-[#FAFAF8]/80"
                    >
                      ←
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/members"
                    className="group flex min-h-14 items-center justify-between gap-4 py-4 text-[#FAFAF8] no-underline transition-opacity hover:opacity-90 hover:no-underline"
                  >
                    <span>
                      <span className="block text-base font-medium tracking-tight">
                        מועדון
                      </span>
                      <span className="mt-0.5 block text-sm text-[#FAFAF8]/60">
                        המאגר המלא, אחרי התאמה
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-sm text-[#FAFAF8]/45 transition-colors group-hover:text-[#FAFAF8]/80"
                    >
                      ←
                    </span>
                  </Link>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link
                  href="/paths#membership-prices"
                  className="inline-flex min-h-11 items-center text-[#FAFAF8]/70 no-underline transition-colors hover:text-[#FAFAF8] hover:no-underline"
                >
                  מסגרות מחיר
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center text-[#FAFAF8]/70 no-underline transition-colors hover:text-[#FAFAF8] hover:no-underline"
                >
                  יצירת קשר
                </Link>
              </div>

              <SocialOutboundLinks
                className="mt-8 border-t border-[#FAFAF8]/15 pt-6 [&_p]:text-[#FAFAF8]/45 [&_a]:text-[#FAFAF8]/70 [&_a:hover]:text-[#FAFAF8]"
                label="לחקור גם ברשתות"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
