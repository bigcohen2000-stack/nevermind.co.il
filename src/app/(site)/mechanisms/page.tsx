import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { ShareExplorationButton } from "@/components/share/share-exploration-button";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import {
  CATEGORY_LABELS,
  getAllArticles,
  type ArticleMeta,
} from "@/lib/content/articles";
import {
  MECHANISM_DEFINITIONS,
  searchHref,
  type MechanismDefinition,
} from "@/lib/content/mechanisms";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import {
  CORE_INVESTIGATION_TOPICS,
  type CoreInvestigationTopic,
} from "@/lib/videos/core-library";

export const metadata: Metadata = {
  title: "מנגנונים",
  description:
    "האתר מאורגן לפי מנגנונים, לא לפי רגשות: יחסים, קיום, זהות. מאמרים, סרטונים וחיפוש לפי כל ציר.",
  alternates: {
    canonical: "https://nevermind.co.il/mechanisms",
  },
  ...shareImageMetadata("מנגנונים, לא רגשות."),
};

function topicsFor(mechanism: MechanismDefinition): CoreInvestigationTopic[] {
  const set = new Set(mechanism.topicIds);
  return CORE_INVESTIGATION_TOPICS.filter((t) => set.has(t.id));
}

function articlesFor(
  mechanism: MechanismDefinition,
  all: ArticleMeta[],
): ArticleMeta[] {
  return all.filter((a) => a.category === mechanism.category);
}

/** One full-width mechanism band with live links into the archive. */
function MechanismBand({
  mechanism,
  articles,
  topics,
  tone,
}: {
  mechanism: MechanismDefinition;
  articles: ArticleMeta[];
  topics: CoreInvestigationTopic[];
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";

  const section = isDark
    ? "band-dark"
    : "band-paper border-y border-foreground/10";
  const watermark = isDark
    ? "text-foreground/[0.045]"
    : "text-foreground/[0.04]";
  const indexColor = "text-foreground/15";
  const secondary = "text-foreground/80";
  const panel = isDark ? "card-dark" : "card";
  const panelLabel = isDark ? "text-foreground/60" : "text-muted";
  const divider = isDark ? "border-foreground/15" : "border-foreground/10";
  const chip = isDark
    ? "border-foreground/25 text-foreground/85 hover:border-action hover:text-action"
    : "border-foreground/20 text-foreground/80 hover:border-action hover:text-action";

  return (
    <section
      id={mechanism.id}
      aria-labelledby={`mech-${mechanism.index}`}
      className={section}
    >
      <Watermark
        className={`bottom-[-1.5rem] start-[-0.5rem] text-[6rem] sm:text-[9rem] lg:text-[12rem] ${watermark}`}
      >
        {mechanism.label}
      </Watermark>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <span
              className={`block text-6xl font-semibold tracking-tight lg:text-7xl ${indexColor}`}
            >
              {mechanism.index}
            </span>
            <h2
              id={`mech-${mechanism.index}`}
              className="mt-6 text-3xl font-semibold tracking-tight lg:text-4xl"
            >
              {mechanism.label}
            </h2>
            <p className={`mt-5 max-w-prose leading-relaxed ${secondary}`}>
              {mechanism.explanation}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label="מושגים לחקירה">
              {mechanism.searchTerms.map((term) => (
                <li key={term}>
                  <Link
                    href={searchHref(term)}
                    className={`inline-flex border px-3 py-1.5 text-sm no-underline transition hover:no-underline ${chip}`}
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={searchHref(mechanism.label)}
                className={isDark ? "btn btn-on-dark" : "btn btn-secondary"}
              >
                חיפוש: {mechanism.label}
              </Link>
              <Link href="/videos" className="link-arrow self-center">
                לכל הסרטונים ←
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className={`${panel} p-6 sm:p-8`}>
              <p className={`text-sm font-medium tracking-wide ${panelLabel}`}>
                שאלות לחקירה
              </p>
              <ul className="mt-5 space-y-1">
                {mechanism.questions.map((q) => (
                  <li key={q} className={`border-t ${divider} first:border-t-0`}>
                    <Link
                      href={searchHref(q)}
                      className="block py-3 text-lg leading-snug text-foreground no-underline transition hover:text-action hover:no-underline"
                    >
                      {q}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {topics.length > 0 ? (
              <div className={`${panel} p-6 sm:p-8`}>
                <p className={`text-sm font-medium tracking-wide ${panelLabel}`}>
                  סרטונים להתחלה
                </p>
                <ul className="mt-5 space-y-4">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <Link
                        href={`/watch/${topic.youtubeId}`}
                        className="group flex gap-4 no-underline hover:no-underline"
                      >
                        <span className="relative aspect-video w-28 shrink-0 overflow-hidden border border-foreground/15 bg-black sm:w-32">
                          <Image
                            src={`https://i.ytimg.com/vi/${topic.youtubeId}/hqdefault.jpg`}
                            alt=""
                            fill
                            className="object-cover opacity-90 transition group-hover:opacity-100"
                            sizes="128px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold tracking-tight text-foreground transition group-hover:text-action">
                            {topic.label}
                          </span>
                          <span
                            className={`mt-1 block text-sm leading-relaxed ${secondary}`}
                          >
                            {topic.probe}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={`${panel} p-6 sm:p-8`}>
              <p className={`text-sm font-medium tracking-wide ${panelLabel}`}>
                מאמרים ב{CATEGORY_LABELS[mechanism.category]}
              </p>
              {articles.length === 0 ? (
                <p className={`mt-4 text-sm ${secondary}`}>
                  עדיין אין מאמרים בציר הזה. אפשר להתחיל מחיפוש או מסרטון.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="block no-underline hover:no-underline"
                      >
                        <span className="font-semibold tracking-tight text-foreground transition hover:text-action">
                          {article.title}
                        </span>
                        <span
                          className={`mt-1 block text-sm leading-relaxed ${secondary}`}
                        >
                          {article.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6">
                <Link href="/articles" className="link-arrow">
                  כל המאמרים ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MechanismsPage() {
  const allArticles = getAllArticles();
  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מנגנונים", path: "/mechanisms" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />

      <section aria-labelledby="mechanisms-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          מנגנונים
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-7">
              <Eyebrow onDark>מבנה התוכן</Eyebrow>
              <h1
                id="mechanisms-hero-title"
                className="mt-5 text-fluid-display font-semibold leading-[1.05] tracking-tight"
              >
                מנגנונים, לא רגשות.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
                כל התוכן מאורגן סביב שלושה מנגנונים. רגש הוא תוצאה. מנגנון הוא
                המבנה שמייצר אותה שוב ושוב. מכאן עוברים למאמר, לסרטון או
                לחיפוש.
              </p>
            </div>

            <div className="lg:col-span-5">
              <nav aria-label="שלושת המנגנונים" className="card-dark p-8">
                <p className="text-sm font-medium tracking-wide text-foreground/60">
                  קפיצה למנגנון
                </p>
                <ul className="mt-5 space-y-4">
                  {MECHANISM_DEFINITIONS.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-baseline gap-4 border-t border-foreground/15 pt-4 first:border-t-0 first:pt-0"
                    >
                      <span className="text-sm text-foreground/40">
                        {m.index}
                      </span>
                      <Link
                        href={`#${m.id}`}
                        className="text-xl font-semibold tracking-tight text-foreground no-underline transition hover:text-action hover:no-underline"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="concept-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow>העיקרון</Eyebrow>
              <h2
                id="concept-title"
                className="mt-3 text-fluid-title font-semibold tracking-tight"
              >
                מנגנון הוא תבנית חוזרת.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-lg leading-relaxed">
                כשמסתכלים על רגש, רואים סימפטום. כשמסתכלים על מנגנון, רואים את
                המבנה שמייצר את הסימפטום שוב ושוב. זו אינה עבודה רגשית, אלא
                עבודה לוגית: לזהות את התנאי שמפעיל את התבנית, ולבחור אחרת עוד
                לפני שהרגש מופיע.
              </p>
            </div>
          </div>
        </div>
      </section>

      {MECHANISM_DEFINITIONS.map((m, i) => (
        <MechanismBand
          key={m.id}
          mechanism={m}
          articles={articlesFor(m, allArticles)}
          topics={topicsFor(m)}
          tone={i % 2 === 0 ? "dark" : "light"}
        />
      ))}

      <section
        aria-labelledby="mechanisms-cta-title"
        className="band-paper border-t border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="mechanisms-cta-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-7 lg:text-4xl"
            >
              בחרו ציר והמשיכו לחקירה.
            </h2>
            <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end lg:text-end">
              <ShareExplorationButton
                title="מנגנונים"
                text="חקירה לפי מנגנונים ב-NeverMinde"
                url="/mechanisms"
                className="lg:items-end"
              />
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/search" className="btn btn-primary">
                  לחיפוש
                </Link>
                <Link href="/concepts" className="btn btn-secondary">
                  למדריך המושגים
                </Link>
              </div>
              <Link
                href="/articles"
                className="text-sm text-foreground/70 no-underline hover:text-action hover:no-underline"
              >
                לכל המאמרים
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
