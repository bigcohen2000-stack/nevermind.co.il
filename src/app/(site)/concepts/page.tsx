import type { Metadata } from "next";
import Link from "next/link";

import { ConceptDirectoryGrid } from "@/components/concepts/concept-directory-grid";
import { ConceptKnowledgeGraphView } from "@/components/concepts/concept-knowledge-graph";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { MECHANISM_DEFINITIONS } from "@/lib/content/mechanisms";
import { getConceptKnowledgeGraph } from "@/lib/concepts/knowledge-graph";
import { shareImageMetadata, shareOgImage } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { listConceptsWithVideoCounts } from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

const CONCEPTS_OG_TITLE = "מדריך המושגים";

export const metadata: Metadata = {
  title: "מושגים",
  description:
    "מדריך מושגים: מפת קשרים בין נושאים, ורשימה עם מספר הסרטונים לכל מושג. לחצו לחיפוש.",
  alternates: {
    canonical: "https://nevermind.co.il/concepts",
  },
  openGraph: {
    title: "מדריך המושגים | NeverMinde",
    description:
      "מפת מושגים ורשימה מסרטוני NeverMinde, עם קישור לחיפוש לכל מושג.",
    url: "https://nevermind.co.il/concepts",
    type: "website",
    images: shareOgImage(CONCEPTS_OG_TITLE),
  },
  twitter: shareImageMetadata(CONCEPTS_OG_TITLE).twitter,
};

export default async function ConceptsPage() {
  const [concepts, graph] = await Promise.all([
    listConceptsWithVideoCounts().catch(() => []),
    getConceptKnowledgeGraph().catch(() => ({ nodes: [], links: [] })),
  ]);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "מושגים",
    description:
      "מדריך מושגים מתוך סרטוני NeverMinde, עם קישור לחיפוש לכל מושג.",
    url: "https://nevermind.co.il/concepts",
    inLanguage: "he-IL",
    numberOfItems: concepts.length,
  };

  const definedTermsLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "מושגי NeverMinde",
    url: "https://nevermind.co.il/concepts",
    inLanguage: "he-IL",
    hasDefinedTerm: concepts.slice(0, 100).map((c) => ({
      "@type": "DefinedTerm",
      name: c.name,
      url: `https://nevermind.co.il/search?q=${encodeURIComponent(c.name)}`,
      description: c.category
        ? `מושג בקטגוריה ${c.category}. מופיע ב-${c.videoCount} סרטונים.`
        : `מושג לחקירה. מופיע ב-${c.videoCount} סרטונים.`,
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "מהו מושג באתר?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "מושג הוא נושא חוזר מתוך הסרטונים. לוחצים עליו כדי לפתוח חיפוש בתוכן הקשור.",
        },
      },
      {
        "@type": "Question",
        name: "איך משתמשים במדריך המושגים?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "בוחרים מושג מהמפה או מהרשימה. החיפוש מציג סרטונים ומושגים הקשורים לאותו נושא.",
        },
      },
      {
        "@type": "Question",
        name: "למה יש קשרים בין מושגים?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "קו בין שני מושגים אומר שהם מופיעים יחד באותו סרטון. זה עוזר לעבור בין נושאים קרובים.",
        },
      },
    ],
  };

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מושגים", path: "/concepts" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />
      <JsonLd data={definedTermsLd} />
      <JsonLd data={faqLd} />

      <section aria-labelledby="concepts-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          מושגים
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>מושגים</Eyebrow>
          <h1
            id="concepts-hero-title"
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            מדריך המושגים
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
            נושאים חוזרים מתוך הסרטונים. מפה מראה מי מופיע עם מי. הרשימה מתחת
            פותחת חיפוש לכל מושג.
          </p>

          <ul className="mt-10 flex flex-wrap gap-2">
            {MECHANISM_DEFINITIONS.map((mech) => (
              <li key={mech.id}>
                <Link
                  href={`/mechanisms#${mech.id}`}
                  className="inline-flex border border-foreground/25 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:border-action hover:text-action"
                >
                  {mech.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/search"
                className="inline-flex border border-foreground/25 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:border-action hover:text-action"
              >
                חיפוש חופשי
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-label="נתוני חקירה"
        className="border-b border-foreground/10 bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <InvestigationFactsStrip
            tone="inline"
            factIds={["concepts", "hours", "levels"]}
            moreHref="/videos"
            moreLabel="לסרטונים"
          />
        </div>
      </section>

      {graph.nodes.length > 0 ? (
        <section
          aria-labelledby="concept-graph-title"
          className="band-dark border-b border-foreground/10"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
            <Eyebrow onDark>מפה</Eyebrow>
            <h2
              id="concept-graph-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              מי מופיע עם מי
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
              קו בין שני מושגים אומר שהם חולקים סרטון. העבירו עכבר להדגשה. לחצו
              על נקודה לחיפוש.
            </p>
            <div className="mt-8">
              <ConceptKnowledgeGraphView graph={graph} />
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="concepts-list-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <Eyebrow>רשימה</Eyebrow>
              <h2
                id="concepts-list-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                כל המושגים
              </h2>
            </div>
            {concepts.length > 0 ? (
              <span className="text-sm text-muted tabular-nums">
                {concepts.length} מושגים
              </span>
            ) : null}
          </div>
          <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
            מסודר לפי כמה סרטונים קשורים. לוחצים על שורה ועוברים לחיפוש.
          </p>

          {concepts.length > 0 ? (
            <ConceptDirectoryGrid items={concepts} />
          ) : (
            <p className="mt-10 text-foreground/70">
              עדיין אין מושגים להצגה. אפשר להתחיל בחיפוש או במנגנונים.
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="concepts-next-title"
        className="band-paper border-t border-foreground/10"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-20">
          <Eyebrow>המשך חקירה</Eyebrow>
          <h2
            id="concepts-next-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            ממושג למנגנון, מסרטון למאמר.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
            המושגים כאן הם נקודות כניסה. שלושת המנגנונים מסדרים את החקירה
            לפי יחסים, קיום וזהות.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/mechanisms" className="link-arrow">
              למנגנונים ←
            </Link>
            <Link href="/videos" className="link-arrow">
              לספריית הווידאו ←
            </Link>
            <Link href="/videos/topics" className="link-arrow">
              לנושאי חקירה ←
            </Link>
            <Link href="/articles" className="link-arrow">
              למאמרים ←
            </Link>
            <Link href="/search" className="link-arrow">
              לחיפוש ←
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
