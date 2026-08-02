import Link from "next/link";

import { finalizeSearchPageAnalytics } from "@/actions/search-analytics";
import { getSavedYoutubeIds } from "@/actions/saved-videos";
import { BlindSpotSection } from "@/components/search/blind-spot-section";
import { SearchQualityFeedback } from "@/components/search/search-quality-feedback";
import { SearchVideosPagination } from "@/components/search/search-videos-pagination";
import { LearningJourney } from "@/components/videos/learning-journey";
import { VideoCard } from "@/components/videos/video-card";
import { CATEGORY_LABELS } from "@/lib/content/articles";
import { getBlindSpotRecommendation } from "@/lib/search/blind-spot";
import {
  SEARCH_PAGE_SIZE,
  clampPage,
  parsePageParam,
} from "@/lib/search/search-params";
import { getLearningJourney, searchAll } from "@/lib/videos/queries";

type SearchResultsProps = {
  query: string;
  page?: number | string;
};

export async function SearchResults({ query, page: pageProp }: SearchResultsProps) {
  const requestedPage =
    typeof pageProp === "number"
      ? Math.max(1, Math.floor(pageProp) || 1)
      : parsePageParam(
          pageProp === undefined || pageProp === null
            ? undefined
            : String(pageProp),
        );

  let results: Awaited<ReturnType<typeof searchAll>> = {
    videos: [],
    concepts: [],
    articles: [],
  };
  let journey: Awaited<ReturnType<typeof getLearningJourney>> = [];
  let savedIds = new Set<string>();
  let blindSpot: Awaited<ReturnType<typeof getBlindSpotRecommendation>> = null;

  try {
    const trimmed = query.trim();
    const [searchResult, saved, journeyVideos, blind] = await Promise.all([
      searchAll(query),
      getSavedYoutubeIds(),
      trimmed ? getLearningJourney(trimmed, 5) : Promise.resolve([]),
      trimmed ? getBlindSpotRecommendation(trimmed, 2) : Promise.resolve(null),
    ]);
    results = searchResult;
    savedIds = new Set(saved);
    journey = journeyVideos;
    blindSpot = blind;
  } catch {
    results = { videos: [], concepts: [], articles: [] };
  }

  const { videos, concepts, articles } = results;
  const trimmedQuery = query.trim();
  const totalCount = videos.length + concepts.length + articles.length;

  let analyticsId: string | null = null;
  if (trimmedQuery) {
    const logged = await finalizeSearchPageAnalytics(
      trimmedQuery,
      totalCount,
    ).catch(() => null);
    if (logged?.ok) analyticsId = logged.id;
  }

  const blindSpotBlock = blindSpot ? (
    <BlindSpotSection
      premise={blindSpot.premise}
      opposite={blindSpot.opposite}
      tease={blindSpot.tease}
      videos={blindSpot.videos}
      savedIds={savedIds}
    />
  ) : null;

  const empty = totalCount === 0;

  if (empty) {
    return (
      <div className="mt-8 space-y-10">
        {blindSpotBlock}
        <div className="space-y-3">
          <p className="text-foreground/70">
            {trimmedQuery
              ? `לא נמצאו תוצאות ל-"${trimmedQuery}".`
              : "אין תוצאות להצגה."}
          </p>
          <p className="text-sm text-muted">
            נסה מושג אחר, עבור ל{" "}
            <Link href="/concepts" className="text-action">
              מדריך המושגים
            </Link>
            , או ל{" "}
            <Link href="/mechanisms" className="text-action">
              מנגנונים
            </Link>
            .
          </p>
        </div>
        {trimmedQuery ? (
          <SearchQualityFeedback
            searchQuery={trimmedQuery}
            analyticsId={analyticsId}
          />
        ) : null}
      </div>
    );
  }

  const journeyIds = new Set(journey.map((v) => v.id));
  const blindIds = new Set(blindSpot?.videos.map((v) => v.id) ?? []);
  const gridVideos = videos.filter(
    (v) => !journeyIds.has(v.id) && !blindIds.has(v.id),
  );

  const videoTotal = gridVideos.length;
  const videoTotalPages = Math.max(1, Math.ceil(videoTotal / SEARCH_PAGE_SIZE) || 1);
  const page = clampPage(requestedPage, videoTotalPages);
  const offset = (page - 1) * SEARCH_PAGE_SIZE;
  const pageVideos = gridVideos.slice(offset, offset + SEARCH_PAGE_SIZE);

  return (
    <div className="mt-10 space-y-14">
      {blindSpotBlock}

      {journey.length >= 3 ? (
        <LearningJourney
          term={trimmedQuery}
          videos={journey}
          savedIds={savedIds}
        />
      ) : null}

      {articles.length > 0 ? (
        <section aria-labelledby="search-articles-title">
          <h3
            id="search-articles-title"
            className="text-lg font-semibold tracking-tight"
          >
            מאמרים
          </h3>
          <ul className="mt-5 space-y-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="card card-hover block p-5 text-foreground no-underline hover:no-underline"
                >
                  <span className="text-xs font-medium tracking-wide text-muted">
                    {CATEGORY_LABELS[article.category]}
                  </span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight">
                    {article.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-foreground/75">
                    {article.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {concepts.length > 0 ? (
        <section aria-labelledby="search-concepts-title">
          <details className="group border border-foreground/15 bg-paper open:bg-background">
            <summary className="cursor-pointer list-none px-4 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <h3
                  id="search-concepts-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  מושגים
                </h3>
                <span className="text-xs text-muted">
                  {concepts.length} מושגים
                  <span className="ms-2 group-open:hidden">פתיחה</span>
                  <span className="ms-2 hidden group-open:inline">סגירה</span>
                </span>
              </span>
            </summary>
            <ul className="flex flex-wrap gap-2 border-t border-foreground/10 px-4 py-4 sm:px-5">
              {concepts.map((concept) => (
                <li key={concept.id}>
                  <Link
                    href={`/search?q=${encodeURIComponent(concept.name)}`}
                    className="inline-flex border border-foreground/15 px-3 py-1.5 text-sm text-foreground/85 transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                  >
                    {concept.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </section>
      ) : null}

      {videoTotal > 0 ? (
        <section
          id="search-videos"
          className="scroll-mt-24"
          aria-labelledby="search-videos-title"
        >
          <h3
            id="search-videos-title"
            className="text-lg font-semibold tracking-tight"
          >
            {journey.length >= 3 ? "סרטונים נוספים" : "סרטונים"}
          </h3>
          {videoTotal > SEARCH_PAGE_SIZE ? (
            <p className="mt-2 text-sm text-foreground/70">
              מוצגים עד {SEARCH_PAGE_SIZE} בכל עמוד ({videoTotal} בסך הכול).
            </p>
          ) : null}
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageVideos.map((v, index) => (
              <li key={v.id}>
                <VideoCard
                  video={v}
                  initialSaved={savedIds.has(v.youtube_id)}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
          <SearchVideosPagination
            page={page}
            totalPages={videoTotalPages}
            total={videoTotal}
            pageSize={SEARCH_PAGE_SIZE}
            q={trimmedQuery}
          />
        </section>
      ) : null}

      {trimmedQuery ? (
        <SearchQualityFeedback
          searchQuery={trimmedQuery}
          analyticsId={analyticsId}
        />
      ) : null}
    </div>
  );
}
