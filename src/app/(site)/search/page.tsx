import type { Metadata } from "next";
import { Suspense } from "react";

import { RabbitHoleSearchBridge } from "@/components/premium/rabbit-hole-search-bridge";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow } from "@/components/ui/editorial";
import { SearchResults } from "@/components/videos/search-results";
import { VideoGridSkeleton } from "@/components/videos/video-grid-skeleton";
import { resolveVideoEntitlement } from "@/lib/club/access";
import {
  parseSearchPageParams,
  searchHref,
} from "@/lib/search/search-params";
import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q, page } = parseSearchPageParams(await searchParams);
  const query = q.trim();
  const titleParts = [query ? `חיפוש: ${query}` : "חיפוש"];
  if (page > 1) titleParts.push(`עמוד ${page}`);

  const canonicalPath = searchHref({ q: query, page });

  return {
    title: titleParts.join(" | "),
    description: query
      ? `תוצאות חיפוש עבור ${query}. מאמרים, מושגים וסרטונים ב-NeverMinde.`
      : "חקירה לפי נושא: מאמרים, מושגים וסרטונים ב-NeverMinde.",
    alternates: {
      canonical: `https://nevermind.co.il${canonicalPath}`,
    },
    ...(page > 1
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page } = parseSearchPageParams(await searchParams);
  const query = q;
  const access = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    hasVideoAccess: false,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NeverMinde",
    url: "https://nevermind.co.il",
    inLanguage: "he-IL",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://nevermind.co.il/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="w-full bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
        <RabbitHoleSearchBridge
          query={query}
          hasVideoAccess={access.entitled || access.hasVideoAccess}
        />
        <Eyebrow>חיפוש</Eyebrow>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-5xl">
          חקירה לפי נושא
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-foreground/75">
          חפש מאמר, מושג או סרטון. סרטוני מועדון מופיעים עם מנעול. הצפייה נפתחת
          אחרי כניסה מאושרת.
        </p>

        <div className="mt-8 sm:mt-10">
          <HeroSearchSection initialQuery={query} syncUrl />
        </div>

        <section className="mt-10 sm:mt-14" aria-labelledby="results-title">
          <h2 id="results-title" className="text-lg font-semibold tracking-tight sm:text-xl">
            {query ? `תוצאות עבור "${query}"` : "תוכן אחרון לחקירה"}
          </h2>

          <Suspense fallback={<VideoGridSkeleton count={9} className="mt-6 sm:mt-8" />}>
            <SearchResults query={query} page={page} />
          </Suspense>
        </section>

        {query ? (
          <aside
            className="mt-14 border border-action/40 bg-paper p-6 sm:p-8"
            aria-labelledby="search-booking-title"
          >
            <p
              id="search-booking-title"
              className="text-xs font-medium tracking-wide text-action"
            >
              תיאום שיחה
            </p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground sm:text-lg">
              רוצה לדבר על מה שחיפשת:{" "}
              <span className="font-semibold">{query}</span>? שלח הודעה בטלפון.
              וואטסאפ או SMS.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppHref(
                  [
                    "היי יקיר, הגעתי מחיפוש באתר.",
                    `חיפשתי: ${query}`,
                    "אשמח לתאם שיחה.",
                  ].join("\n"),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                וואטסאפ
              </a>
              <a
                href={buildSmsHref(
                  [
                    "היי יקיר, הגעתי מחיפוש באתר.",
                    `חיפשתי: ${query}`,
                    "אשמח לתאם שיחה.",
                  ].join("\n"),
                )}
                className="btn btn-secondary"
              >
                SMS
              </a>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
