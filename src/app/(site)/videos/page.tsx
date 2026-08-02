import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RandomClubButton } from "@/components/members/random-club-button";
import { PodcastSubscribe } from "@/components/podcast/podcast-subscribe";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { ContinueWatchingSection } from "@/components/videos/continue-watching-section";
import { VideoGridSkeleton } from "@/components/videos/video-grid-skeleton";
import { VideosResults } from "@/components/videos/videos-results";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { parseVideosBrowseParams } from "@/lib/videos/browse-params";

export const dynamic = "force-dynamic";

type VideosPageProps = {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
    concept?: string;
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
  if (params.page > 1) canonicalQs.set("page", String(params.page));
  const qs = canonicalQs.toString();

  return {
    title: parts.join(" | "),
    description,
    alternates: {
      canonical: qs
        ? `https://nevermind.co.il/videos?${qs}`
        : "https://nevermind.co.il/videos",
    },
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
  const { filter, sort, concept, page } = parseVideosBrowseParams(
    await searchParams,
  );

  return (
    <main className="w-full text-start">
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
              פודקאסט מרפסת
            </h3>
            <PodcastSubscribe className="mt-4" variant="light" />
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
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="videos-cta-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-7 lg:text-4xl"
            >
              רוצים את המסגרת בכתב.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href="/articles" className="btn btn-primary">
                לקריאת המאמרים
              </Link>
              <Link href="/members" className="btn btn-secondary">
                למועדון
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                ליצירת קשר
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
