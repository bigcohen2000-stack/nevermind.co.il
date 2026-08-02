import type { Metadata } from "next";
import Link from "next/link";

import { ConceptDirectoryGrid } from "@/components/concepts/concept-directory-grid";
import { ConceptKnowledgeGraphView } from "@/components/concepts/concept-knowledge-graph";
import { Eyebrow } from "@/components/ui/editorial";
import { getConceptKnowledgeGraph } from "@/lib/concepts/knowledge-graph";
import { listConceptsWithVideoCounts } from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "מושגים",
  description:
    "מדריך מושגים: מפת קשרים בין נושאים, ורשימה עם מספר הסרטונים לכל מושג.",
  alternates: {
    canonical: "https://nevermind.co.il/concepts",
  },
  openGraph: {
    title: "מדריך המושגים | NeverMinde",
    description:
      "מפת מושגים אינטראקטיבית ורשימה מסרטוני NeverMinde, עם קישור לחיפוש.",
    url: "https://nevermind.co.il/concepts",
    type: "website",
  },
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
          text: "מושג הוא נושא חוזר מתוך הסרטונים והמאמרים. אפשר לחפש אותו כדי למצוא תוכן קשור.",
        },
      },
      {
        "@type": "Question",
        name: "איך משתמשים במדריך המושגים?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "בוחרים מושג מהמפה או מהרשימה. החיפוש מציג מאמרים, מושגים וסרטונים הקשורים לאותו נושא.",
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

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <Eyebrow>מושגים</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          מדריך המושגים
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
          מפה של קשרים בין מושגים (סרטון משותף = קו). לחצו על נקודה כדי לפתוח
          חיפוש. מתחת: אותה רשימה בכרטיסים.
        </p>

        {graph.nodes.length > 0 ? (
          <section className="mt-10" aria-labelledby="concept-graph-title">
            <h2
              id="concept-graph-title"
              className="text-lg font-semibold tracking-tight"
            >
              מפת ידע
            </h2>
            <div className="mt-4">
              <ConceptKnowledgeGraphView graph={graph} />
            </div>
          </section>
        ) : null}

        {concepts.length > 0 ? (
          <section className="mt-14" aria-label="רשימת מושגים">
            <h2 className="text-lg font-semibold tracking-tight">רשימה</h2>
            <ConceptDirectoryGrid items={concepts} />
          </section>
        ) : (
          <p className="mt-10 text-foreground/70">
            עדיין אין מושגים להצגה. לאחר סנכרון סרטונים הם יופיעו כאן.
          </p>
        )}

        <p className="mt-12 text-sm text-muted">
          מחפשים את המפה לפי יחסים, קיום וזהות?{" "}
          <Link href="/mechanisms" className="text-action">
            מנגנונים
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
