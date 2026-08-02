import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ExploreLinks } from "@/components/search/explore-links";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { HeartQuestionsStrip } from "@/components/community/heart-questions-strip";
import { HomeLiveStrip } from "@/components/live/home-live-strip";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { SiteBanner } from "@/components/site/site-banner";
import { ContinueWatchingSection } from "@/components/videos/continue-watching-section";
import { getLatestContinueWatching } from "@/actions/video-progress";
import { CATEGORY_LABELS, getAllArticles } from "@/lib/content/articles";
import { CORE_INVESTIGATION_TOPICS } from "@/lib/videos/core-library";
import { PATH_OFFERS, PROCESS_STEPS } from "@/lib/content/offers";
import { getLivePublicStatus } from "@/lib/live/status";
import { getSpotifyShowUrl } from "@/lib/podcast/links";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildWhatsAppHref, YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

const HOME_OG_TITLE = "להפריד עובדה מסיפור.";

/** Flagship lecture preview on the home video band. */
const HOME_LECTURE_PREVIEW = CORE_INVESTIGATION_TOPICS[0];

export const metadata: Metadata = {
  title: {
    absolute: "NeverMinde",
  },
  description:
    "חקירה לפי נושא. ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור.",
  alternates: {
    canonical: "https://nevermind.co.il",
  },
  ...shareImageMetadata(HOME_OG_TITLE),
};

const HOME_PLACEHOLDERS = [
  "חפש נושא, סרטון או מושג",
  "מציאות",
  "הזדהות",
  "יחסים",
  "בחירה חופשית",
];

function HomeSearchFallback() {
  return (
    <div
      className="mx-auto h-[10.5rem] w-full max-w-2xl"
      aria-hidden="true"
    >
      <div className="h-14 w-full rounded-full border border-white/30 bg-black" />
    </div>
  );
}

const mechanisms = CORE_INVESTIGATION_TOPICS.slice(0, 3).map((topic, i) => ({
  index: String(i + 1).padStart(2, "0"),
  label: topic.label,
  body: topic.probe,
  youtubeId: topic.youtubeId,
}));

const mechanismStagger = ["lg:mt-0", "lg:mt-10", "lg:mt-20"];

export default async function Home() {
  const articles = getAllArticles();
  const spotifyUrl = getSpotifyShowUrl();
  const contactHref = buildWhatsAppHref(
    "היי, אני באתר ויש לי שאלה. מתי נוח לך שנדבר?",
  );
  const continueWatching = await getLatestContinueWatching().catch(() => null);
  const liveStatus = await getLivePublicStatus();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://nevermind.co.il/#organization",
        name: "השם לא משנה",
        alternateName: ["NeverMinde", "NeverMind"],
        url: "https://nevermind.co.il",
        logo: "https://nevermind.co.il/icons/icon-512.png",
        sameAs: [YOUTUBE_CHANNEL_URL, getSpotifyShowUrl()].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": "https://nevermind.co.il/#website",
        name: "NeverMinde",
        alternateName: "השם לא משנה",
        url: "https://nevermind.co.il",
        inLanguage: "he-IL",
        publisher: { "@id": "https://nevermind.co.il/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://nevermind.co.il/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="w-full text-start">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1 — HERO --------------------------------------------------------- */}
      <section aria-labelledby="hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          NeverMinde
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">
          <Eyebrow onDark>השם לא משנה</Eyebrow>
          <h1
            id="hero-title"
            className="mt-5 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            להפריד עובדה
            <br />
            מסיפור.
          </h1>
          <p className="mx-auto mt-6 max-w-prose text-base leading-relaxed text-foreground/80 sm:mt-7 sm:text-lg">
            ניתוח לוגי וחקירה לפי נושא. לא טיפול, לא מוטיבציה, לא רוחניות. רק מה
            שקרה, ומה שמספרים על מה שקרה.
          </p>

          <div className="mx-auto mt-8 min-h-[10.5rem] w-full max-w-2xl sm:mt-10">
            <Suspense fallback={<HomeSearchFallback />}>
              <HeroSearchSection
                variant="dark"
                placeholders={HOME_PLACEHOLDERS}
                syncUrl
                chipSource="trending"
              />
            </Suspense>
          </div>

          <ExploreLinks />
        </div>
      </section>

      <HomeLiveStrip status={liveStatus} />

      <InvestigationFactsStrip tone="paper" />

      <HeartQuestionsStrip surface="home" />

      <ContinueWatchingSection serverItem={continueWatching} />

      {/* 2 — CORE MECHANISMS ----------------------------------------------- */}
      <section
        aria-labelledby="mechanisms-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>נושאים לחקירה</Eyebrow>
            <h2
              id="mechanisms-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              שלושה צירים. בלי דרמה.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed">
              חקירה של מנגנונים שחוזרים: פחד, הזדהות, בחירה. בלי שמות אורחים
              כקטגוריה. רק המושג.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
            {mechanisms.map((m, i) => (
              <li key={m.label} className={mechanismStagger[i]}>
                <Link
                  href={`/watch/${m.youtubeId}`}
                  className="card card-hover group flex h-full flex-col p-6 text-foreground no-underline hover:no-underline sm:p-8"
                >
                  <span className="text-5xl font-semibold tracking-tight text-foreground/15">
                    {m.index}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-action">
                    {m.label}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/75">
                    {m.body}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <Link href="/mechanisms" className="link-arrow">
              למפת המנגנונים
            </Link>
          </div>
        </div>
      </section>

      {/* 3 — PATHS --------------------------------------------------------- */}
      <section aria-labelledby="paths-home-title" className="band-paper">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <Eyebrow>מסלולים</Eyebrow>
              <h2
                id="paths-home-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                איך העבודה מתבצעת.
              </h2>
              <p className="mt-4 max-w-prose leading-relaxed">
                ארבעה מסלולים ומחירון גישה למאגר. פירוט מלא בעמוד המסלולים.
                תיאום בטלפון.
              </p>
            </div>
            <Link href="/paths" className="link-arrow self-start sm:self-auto">
              לכל המסלולים ←
            </Link>
          </div>

          <div className="mt-8 max-w-xl">
            <SiteBanner slot="home_join" density="compact" />
          </div>

          <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
            {PATH_OFFERS.map((path) => (
              <li key={path.id} className="card flex h-full flex-col p-5 sm:p-7">
                <h3 className="text-xl font-semibold tracking-tight">
                  {path.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-foreground/80">
                  {path.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="תגיות">
                  {path.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-foreground/15 px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — PROCESS ------------------------------------------------------- */}
      <section
        aria-labelledby="process-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>מה קורה בפועל</Eyebrow>
          <h2
            id="process-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            שלושה שלבים. בלי הפתעות.
          </h2>
          <ol className="mt-14 grid gap-8 lg:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <li key={step.index}>
                <span className="text-4xl font-semibold tracking-tight text-foreground/15">
                  {step.index}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-foreground/80">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <Link href="/contact" className="link-arrow">
              לשאלות על התהליך ←
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — ARTICLES PREVIEW ---------------------------------------------- */}
      <section
        aria-labelledby="articles-title"
        className="bg-background text-foreground border-y border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <Eyebrow>מאמרים</Eyebrow>
              <h2
                id="articles-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                חקירה בכתב.
              </h2>
              <p className="mt-4 leading-relaxed text-foreground/75">
                ניתוח לוגי של מנגנון אחד בכל מאמר. הפרדה בין עובדה לבין סיפור.
              </p>
            </div>
            <Link href="/articles" className="link-arrow">
              כל המאמרים ←
            </Link>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {articles.slice(0, 3).map((article, i) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden text-foreground no-underline hover:no-underline"
                >
                  <div className="relative flex min-h-[11rem] flex-col justify-between gap-6 bg-ink p-6 text-[#FAFAF8] sm:min-h-[12.5rem] sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium tracking-[0.16em] text-[#9CA3AF] uppercase">
                        {CATEGORY_LABELS[article.category]}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-3xl font-semibold tracking-tight text-[#FAFAF8]/15"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold leading-snug tracking-tight text-[#FAFAF8] transition-colors duration-200 group-hover:text-[#D42B2B] sm:text-2xl">
                      {article.title}
                    </h3>
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="flex-1 text-sm leading-relaxed text-foreground/80 sm:text-base">
                      {article.description}
                    </p>
                    <span className="mt-5 inline-block text-sm font-medium text-action">
                      לקריאה ←
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 — VIDEO / LECTURE ----------------------------------------------- */}
      <section aria-labelledby="video-title" className="band-dark">
        <Watermark className="top-[-1rem] start-[-0.5rem] text-[5rem] text-foreground/[0.045] sm:text-[7rem] lg:text-[10rem]">
          הרצאות
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>וידאו והרצאות</Eyebrow>
              <h2
                id="video-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                אותו מבנה, בקול.
              </h2>
              <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
                סרטונים לפי מושג או כותרת. אפשר להתחיל מחיפוש, מעמוד הווידאו,
                מערוץ היוטיוב, או מהפודקאסט בספוטיפיי.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/videos" className="btn btn-primary">
                  לעמוד הווידאו
                </Link>
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-on-dark"
                >
                  לצפייה בערוץ יוטיוב
                </a>
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-on-dark"
                >
                  האזנה בספוטיפיי
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Link
                href={`/watch/${HOME_LECTURE_PREVIEW.youtubeId}`}
                aria-label={`לצפייה: ${HOME_LECTURE_PREVIEW.label}`}
                className="group relative block no-underline hover:no-underline"
              >
                <div className="media-frame relative aspect-video w-full overflow-hidden transition-colors duration-200 group-hover:border-foreground/50">
                  <Image
                    src={`https://i.ytimg.com/vi/${HOME_LECTURE_PREVIEW.youtubeId}/hqdefault.jpg`}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority={false}
                  />
                  <span className="absolute inset-0 bg-black/35 transition-colors duration-200 group-hover:bg-black/25" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#FAFAF8]/55 bg-black/45 transition-colors duration-200 group-hover:border-action sm:h-20 sm:w-20">
                      <span
                        aria-hidden="true"
                        className="ms-1 h-0 w-0 border-y-[11px] border-s-[18px] border-y-transparent border-s-[#FAFAF8] transition-colors duration-200 group-hover:border-s-action sm:border-y-[12px] sm:border-s-[20px]"
                      />
                    </span>
                  </span>
                </div>
                <span className="card relative z-20 mt-[-2rem] ms-4 block w-max max-w-[calc(100%-2rem)] px-4 py-2 text-sm text-foreground shadow-float lg:absolute lg:-bottom-5 lg:-start-5 lg:ms-0 lg:mt-0">
                  {HOME_LECTURE_PREVIEW.label}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — FACT VS STORY ------------------------------------------------- */}
      <section
        aria-labelledby="factstory-title"
        className="relative overflow-hidden bg-background text-foreground"
      >
        <Watermark className="top-10 end-[-1rem] text-[5rem] text-foreground/[0.04] sm:text-[7rem] lg:text-[9rem]">
          עובדה
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>השיטה</Eyebrow>
            <h2
              id="factstory-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              עובדה מול סיפור.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed">
              יש הבדל בין מה שקרה לבין מה שמספרים על מה שקרה. ההפרדה הזו היא
              נקודת ההתחלה של כל חקירה.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="card-dark flex min-h-[16rem] flex-col justify-between p-10 text-foreground">
              <p className="text-sm font-medium tracking-wide text-foreground/60">
                עובדה
              </p>
              <div>
                <p className="text-2xl font-semibold leading-snug lg:text-3xl">
                  בן הזוג הרים את קולו.
                </p>
                <p className="mt-4 leading-relaxed text-foreground/70">
                  דבר שניתן לאמת. אינו תלוי בפרשנות.
                </p>
              </div>
            </div>

            <div className="card flex min-h-[16rem] flex-col justify-between p-10">
              <p className="text-sm font-medium tracking-wide text-muted">סיפור</p>
              <div>
                <p className="text-2xl font-semibold leading-snug text-muted line-through decoration-muted lg:text-3xl">
                  הוא לא מכבד אותי.
                </p>
                <p className="mt-4 leading-relaxed text-foreground/70">
                  פירוש, השערה לגבי כוונה. לא מה שקרה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 — BOOKS / CONTENT TEASER ---------------------------------------- */}
      <section aria-labelledby="books-teaser-title" className="band-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>תכנים וספרים</Eyebrow>
              <h2
                id="books-teaser-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                אין חנות. יש מה שפתוח.
              </h2>
              <p className="mt-4 max-w-prose leading-relaxed">
                ספר אחד בכתיבה. מאמרים, וידאו ומושגים שכבר באתר.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-end">
              <Link href="/books" className="link-arrow">
                לעמוד התכנים ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — FINAL CTA ----------------------------------------------------- */}
      <section
        aria-labelledby="final-title"
        className="relative overflow-hidden band-dark"
      >
        <Watermark className="bottom-[-1rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          NeverMinde
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="final-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-7 lg:text-5xl"
            >
              יש שאלה ספציפית? אפשר לפנות ישירות.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href="/contact" className="btn btn-primary">
                ליצירת קשר
              </Link>
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-on-dark"
              >
                וואטסאפ
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
