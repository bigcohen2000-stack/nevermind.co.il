import type { Metadata } from "next";

import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow } from "@/components/ui/editorial";
import { VideoCard } from "@/components/videos/video-card";
import { searchVideos } from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `חיפוש: ${query}` : "חיפוש",
    description: "חיפוש סרטונים ומושגים ב־NeverMinde.",
    alternates: {
      canonical: "https://nevermind.co.il/search",
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let videos: Awaited<ReturnType<typeof searchVideos>> = [];

  try {
    videos = await searchVideos(query);
  } catch {
    videos = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NeverMinde",
    url: "https://nevermind.co.il",
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

      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <Eyebrow>חיפוש</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          חקירה לפי נושא
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
          חפש סרטון או מושג. תוכן לחברים מוצג רק למשתמשים מחוברים.
        </p>

        <div className="mt-10">
          <HeroSearchSection initialQuery={query} />
        </div>

        <section className="mt-14" aria-labelledby="results-title">
          <h2 id="results-title" className="text-xl font-semibold tracking-tight">
            {query ? `תוצאות עבור «${query}»` : "סרטונים אחרונים"}
          </h2>

          {videos.length === 0 ? (
            <p className="mt-6 text-foreground/70">
              אין תוצאות להצגה. נסה מושג אחר, או עבור לעמוד הווידאו.
            </p>
          ) : (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id}>
                  <VideoCard video={v} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
