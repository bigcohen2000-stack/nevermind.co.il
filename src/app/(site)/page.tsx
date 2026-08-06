import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ExploreLinks } from "@/components/search/explore-links";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { HeartQuestionsStrip } from "@/components/community/heart-questions-strip";
import { HomePathsGrid } from "@/components/home/home-paths-grid";
import { HomeLiveStrip } from "@/components/live/home-live-strip";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { SiteBanner } from "@/components/site/site-banner";
import { ContinueWatchingSection } from "@/components/videos/continue-watching-section";
import { getLatestContinueWatching } from "@/actions/video-progress";
import { CATEGORY_LABELS, getAllArticles } from "@/lib/content/articles";
import { CORE_INVESTIGATION_TOPICS } from "@/lib/videos/core-library";
import { PROCESS_STEPS, SHOP_BOOK } from "@/lib/content/offers";
import { getSpotifyShowUrl } from "@/lib/podcast/links";
import { shareImageMetadata } from "@/lib/og/share-image";
import { getSocialSameAsUrls } from "@/lib/social";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { buildInfoTipsFaqLd } from "@/lib/content/info-tips";
import { CORE_EXTRACTABLE_SENTENCE } from "@/lib/seo/concept-anchors";
import { buildYakirCohenPersonLd } from "@/lib/seo/person";

const HOME_OG_TITLE = "להפריד עובדה מסיפור.";

/** Flagship lecture preview on the home video band. */
const HOME_LECTURE_PREVIEW = CORE_INVESTIGATION_TOPICS[0];

/** Method band: fact vs story video. */
const HOME_METHOD_VIDEO =
  CORE_INVESTIGATION_TOPICS.find((t) => t.id === "reality") ??
  CORE_INVESTIGATION_TOPICS[0];

export const metadata: Metadata = {
  title: {
    absolute: "NeverMind | השם לא משנה",
  },
  description:
    "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור. חקירה לפי נושא, סרטונים ומושגים בעברית.",
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
      className="mx-auto min-h-[180px] w-full max-w-2xl sm:min-h-[220px]"
      aria-hidden="true"
    >
      <div className="h-14 w-full rounded-full border border-white/30 bg-black" />
      <div className="mx-auto mt-5 h-11 w-40 border border-white/25 bg-white/90" />
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

  const randomTipsFaq = buildInfoTipsFaqLd(["random"]);
  const personLd = buildYakirCohenPersonLd();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      personLd,
      {
        "@type": "Organization",
        "@id": "https://nevermind.co.il/#organization",
        name: "השם לא משנה",
        alternateName: ["NeverMinde", "NeverMind"],
        url: "https://nevermind.co.il",
        logo: "https://nevermind.co.il/icons/icon-512.png",
        founder: { "@id": personLd["@id"] },
        sameAs: [...getSocialSameAsUrls(), spotifyUrl].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": "https://nevermind.co.il/#website",
        name: "NeverMind",
        alternateName: ["NeverMinde", "השם לא משנה"],
        url: "https://nevermind.co.il",
        inLanguage: "he-IL",
        publisher: { "@id": "https://nevermind.co.il/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://nevermind.co.il/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://nevermind.co.il/#random-investigation-faq",
        mainEntity: randomTipsFaq.mainEntity,
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
      <section
        aria-labelledby="hero-title"
        className="band-dark band-dark-search"
      >
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
            {CORE_EXTRACTABLE_SENTENCE} לא טיפול. לא מוטיבציה. לא רוחניות. רק מה
            שקרה, ומה שמספרים על מה שקרה.
          </p>

          <div className="mx-auto mt-8 min-h-[180px] w-full max-w-2xl sm:mt-10 sm:min-h-[220px]">
            <Suspense fallback={<HomeSearchFallback />}>
              <HeroSearchSection
                variant="dark"
                placeholders={HOME_PLACEHOLDERS}
                syncUrl
                chipSource="concepts"
              />
            </Suspense>
          </div>

          <ExploreLinks />
        </div>
      </section>

      <HomeLiveStrip />

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
          <div className="max-w-2xl">
            <Eyebrow>מסלולים</Eyebrow>
            <h2
              id="paths-home-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              איך העבודה מתבצעת.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
              ארבעה מסלולים ומחירון גישה למאגר. בחרו מסלול ושלחו בקשה. תיאום
              בטלפון. אין סליקה באתר.
            </p>
          </div>

          <div className="mt-8 max-w-xl">
            <SiteBanner slot="home_join" density="compact" />
          </div>

          <div className="mt-10 sm:mt-14">
            <HomePathsGrid />
          </div>
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
                ספרייה לפי מושג. אפשר להתחיל מההרצאה למטה, מעמוד הווידאו, או
                מנושאי החקירה.
              </p>
              <p className="mt-5 max-w-prose text-sm leading-relaxed text-foreground/65">
                {HOME_LECTURE_PREVIEW.label}: {HOME_LECTURE_PREVIEW.probe}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/watch/${HOME_LECTURE_PREVIEW.youtubeId}`}
                  className="btn btn-primary"
                >
                  לצפייה בהרצאה
                </Link>
                <Link href="/videos" className="btn btn-on-dark">
                  לספריית הווידאו
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/videos/topics" className="link-arrow text-foreground/80">
                  לנושאי חקירה ←
                </Link>
                <Link href="/concepts" className="link-arrow text-foreground/80">
                  למושגים ←
                </Link>
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-arrow text-foreground/80"
                >
                  לפודקאסט ←
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
                <span className="relative z-20 mt-4 block text-sm font-medium text-foreground/85 lg:absolute lg:-bottom-5 lg:-start-5 lg:mt-0 lg:border lg:border-foreground/15 lg:bg-[#1A1A1A] lg:px-4 lg:py-2 lg:text-[#FAFAF8]">
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
        className="band-paper border-y border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Eyebrow>השיטה</Eyebrow>
            <h2
              id="factstory-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              עובדה מול סיפור.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
              יש הבדל בין מה שקרה לבין מה שמספרים על מה שקרה. ההפרדה הזו היא
              נקודת ההתחלה של כל חקירה.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="border-s-2 border-action ps-6">
              <p className="text-sm font-medium tracking-wide text-action">
                עובדה
              </p>
              <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight lg:text-3xl">
                בן הזוג הרים את קולו.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
                דבר שניתן לאמת. אינו תלוי בפרשנות.
              </p>
            </div>

            <div className="border-s-2 border-foreground/20 ps-6">
              <p className="text-sm font-medium tracking-wide text-muted">
                סיפור
              </p>
              <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight lg:text-3xl">
                הוא לא מכבד אותי.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
                פירוש, השערה לגבי כוונה. לא מה שקרה.
              </p>
            </div>
          </div>

          <p className="mt-12 max-w-prose text-sm leading-relaxed text-foreground/70">
            מחשבה מקבלת מעמד של עובדה, ואז מגיבים אליה כאילו היא מה שקרה. החקירה
            מחזירה את ההפרדה.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/articles/fact-vs-story" className="link-arrow">
              למאמר: מחשבה אינה עובדה ←
            </Link>
            <Link
              href={`/watch/${HOME_METHOD_VIDEO.youtubeId}`}
              className="link-arrow"
            >
              לסרטון: {HOME_METHOD_VIDEO.label} ←
            </Link>
            <Link href="/concepts" className="link-arrow">
              למדריך המושגים ←
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent("מציאות")}`}
              className="link-arrow"
            >
              לחיפוש מציאות ←
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — BOOKS / LOVE TEASER ---------------------------------------- */}
      <section
        aria-labelledby="books-teaser-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Eyebrow>ספר</Eyebrow>
              <h2
                id="books-teaser-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                {SHOP_BOOK.title}.
              </h2>
              <p className="mt-2 text-sm text-muted">{SHOP_BOOK.statusLabel}</p>
              <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
                {SHOP_BOOK.body}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href={buildWhatsAppHref(SHOP_BOOK.whatsappText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {SHOP_BOOK.ctaLabel}
                </a>
                <Link href="/books" className="btn btn-secondary">
                  לעמוד הספר
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/paths" className="link-arrow">
                  למסלולי פגישה ←
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent("אהבה")}`}
                  className="link-arrow"
                >
                  לסרטונים על אהבה ←
                </Link>
                <Link href="/mechanisms#relationships" className="link-arrow">
                  למנגנון יחסים ←
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="border border-foreground/15 bg-foreground/[0.02] p-6 sm:p-8">
                <p className="text-sm font-medium tracking-wide text-muted">
                  איך ממשיכים
                </p>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-foreground/80">
                  <li>
                    <Link href="/books" className="font-medium text-foreground hover:text-action">
                      עמוד הספר
                    </Link>
                    {": "}
                    הזמנה ומשלוח, בלי סליקה באתר.
                  </li>
                  <li>
                    <Link href="/articles" className="font-medium text-foreground hover:text-action">
                      מאמרים
                    </Link>
                    {": "}
                    אותה חקירה בכתב, מנגנון אחר מנגנון.
                  </li>
                  <li>
                    <Link href="/contact" className="font-medium text-foreground hover:text-action">
                      יצירת קשר
                    </Link>
                    {": "}
                    שאלה קצרה לפני שמזמינים או מתאמים.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup source="home" />

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
