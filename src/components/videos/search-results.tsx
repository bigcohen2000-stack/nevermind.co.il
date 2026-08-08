import Link from "next/link";

import { finalizeSearchPageAnalytics } from "@/actions/search-analytics";
import { getCompletedYoutubeIds } from "@/actions/video-completions";
import { getSavedYoutubeIds } from "@/actions/saved-videos";
import { BlindSpotSection } from "@/components/search/blind-spot-section";
import { InvertQuotaTeaser } from "@/components/premium/invert-quota-teaser";
import { SearchJumpLinks } from "@/components/search/search-browse-nav";
import { SearchFilterControls } from "@/components/search/search-filter-controls";
import { SearchMissedHelp } from "@/components/search/search-missed-help";
import { SearchQualityFeedback } from "@/components/search/search-quality-feedback";
import { SearchVideosPagination } from "@/components/search/search-videos-pagination";
import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { LearningJourney } from "@/components/videos/learning-journey";
import { SearchVideoRow } from "@/components/videos/search-video-row";
import { VideoCard } from "@/components/videos/video-card";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { CATEGORY_LABELS } from "@/lib/content/articles";
import { getBlindSpotRecommendation } from "@/lib/search/blind-spot";
import { coreMechanismForConcept } from "@/lib/profile/core-mechanisms";
import {
  SEARCH_PAGE_SIZE,
  clampPage,
  parsePageParam,
  type SearchResultType,
  type SearchVideoFilter,
} from "@/lib/search/search-params";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { getLearningJourney, searchAll } from "@/lib/videos/queries";

type SearchResultsProps = {
  query: string;
  page?: number | string;
  filter?: SearchVideoFilter;
  type?: SearchResultType;
};

export async function SearchResults({
  query,
  page: pageProp,
  filter = "all",
  type = "all",
}: SearchResultsProps) {
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
  let completedIds = new Set<string>();
  let blindSpot: Awaited<ReturnType<typeof getBlindSpotRecommendation>> = null;
  let hasFullAccess = false;

  try {
    const trimmed = query.trim();
    const [searchResult, saved, completed, journeyVideos, blind, access] =
      await Promise.all([
        searchAll(query),
        getSavedYoutubeIds(),
        getCompletedYoutubeIds(),
        trimmed ? getLearningJourney(trimmed, 5) : Promise.resolve([]),
        trimmed
          ? getBlindSpotRecommendation(trimmed, 2)
          : Promise.resolve(null),
        resolveVideoEntitlement().catch(() => null),
      ]);
    results = searchResult;
    savedIds = new Set(saved);
    completedIds = new Set(completed);
    journey = journeyVideos;
    blindSpot = blind;
    hasFullAccess = Boolean(
      access && (access.entitled || access.hasVideoAccess),
    );
  } catch {
    results = { videos: [], concepts: [], articles: [] };
  }

  const { videos, concepts, articles } = results;
  const trimmedQuery = query.trim();
  const showArticles =
    type === "all" || type === "articles" || type === "mechanisms";
  const showConcepts =
    type === "all" || type === "concepts" || type === "mechanisms";
  const showVideos = type === "all" || type === "videos";

  const visibleArticles =
    type === "mechanisms"
      ? articles.filter(
          (a) =>
            a.category === "relationships" ||
            a.category === "existence" ||
            a.category === "identity",
        )
      : showArticles
        ? articles
        : [];

  const visibleConcepts =
    type === "mechanisms"
      ? concepts.filter((c) => coreMechanismForConcept(c.name) != null)
      : showConcepts
        ? concepts
        : [];

  const totalCount = videos.length + concepts.length + articles.length;
  const visibleTotal =
    visibleArticles.length +
    visibleConcepts.length +
    (showVideos ? videos.length : 0);

  let analyticsId: string | null = null;
  if (trimmedQuery) {
    const logged = await finalizeSearchPageAnalytics(
      trimmedQuery,
      totalCount,
    ).catch(() => null);
    if (logged?.ok) analyticsId = logged.id;
  }

  const blindSpotBlock =
    showVideos && blindSpot ? (
      <BlindSpotSection
        premise={blindSpot.premise}
        opposite={blindSpot.opposite}
        tease={blindSpot.tease}
        videos={blindSpot.videos}
        savedIds={savedIds}
        hasFullAccess={hasFullAccess}
      />
    ) : null;

  if (visibleTotal === 0) {
    return (
      <div id="search-results" className="mt-8 scroll-mt-24 space-y-10">
        <SmartEmptyState
          message={
            trimmedQuery
              ? `לא נמצאו תוצאות ל-"${trimmedQuery}"${type !== "all" ? " בסוג שנבחר" : ""}. אפשר להתחיל מאחד ממושגי הליבה.`
              : "בחר מושג, מנגנון, או התחל לכתוב בשדה החיפוש."
          }
        />
        {blindSpotBlock}
        {trimmedQuery ? (
          <>
            <SearchMissedHelp key={trimmedQuery} searchQuery={trimmedQuery} />
            <SearchQualityFeedback
              searchQuery={trimmedQuery}
              analyticsId={analyticsId}
            />
          </>
        ) : null}
      </div>
    );
  }

  const journeyIds = new Set(journey.map((v) => v.id));
  const blindIds = new Set(blindSpot?.videos.map((v) => v.id) ?? []);
  const baseGridVideos = videos.filter(
    (v) => !journeyIds.has(v.id) && !blindIds.has(v.id),
  );

  const freeCount = baseGridVideos.filter((v) => !isMembersOnlyVideo(v)).length;
  const clubCount = baseGridVideos.filter((v) => isMembersOnlyVideo(v)).length;

  const filteredVideos =
    filter === "open"
      ? baseGridVideos.filter((v) => !isMembersOnlyVideo(v))
      : filter === "club"
        ? baseGridVideos.filter((v) => isMembersOnlyVideo(v))
        : baseGridVideos;

  const gridVideos = showVideos ? filteredVideos : [];
  const videoTotal = gridVideos.length;
  const videoTotalPages = Math.max(
    1,
    Math.ceil(videoTotal / SEARCH_PAGE_SIZE) || 1,
  );
  const page = clampPage(requestedPage, videoTotalPages);
  const offset = (page - 1) * SEARCH_PAGE_SIZE;
  const pageVideos = gridVideos.slice(offset, offset + SEARCH_PAGE_SIZE);

  const jumpArticles = visibleArticles.length;
  const jumpConcepts = visibleConcepts.length;
  const jumpVideos =
    (showVideos ? journey.length + (blindSpot?.videos.length ?? 0) : 0) +
    videoTotal;

  return (
    <div id="search-results" className="mt-8 scroll-mt-24 space-y-12 sm:space-y-14">
      <InvertQuotaTeaser hasVideoAccess={hasFullAccess} />
      <SearchJumpLinks
        articles={jumpArticles}
        concepts={jumpConcepts}
        videos={jumpVideos}
      />

      {showVideos && journey.length >= 3 ? (
        <LearningJourney
          term={trimmedQuery}
          videos={journey}
          savedIds={savedIds}
        />
      ) : null}

      {jumpArticles > 0 ? (
        <section
          id="search-articles"
          className="scroll-mt-24"
          aria-labelledby="search-articles-title"
        >
          <h3
            id="search-articles-title"
            className="text-lg font-semibold tracking-tight"
          >
            מאמרים
          </h3>
          <ul className="mt-5 space-y-3">
            {visibleArticles.map((article) => (
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

      {jumpConcepts > 0 ? (
        <section
          id="search-concepts"
          className="scroll-mt-24"
          aria-labelledby="search-concepts-title"
        >
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
                  {jumpConcepts} מושגים
                  <span className="ms-2 group-open:hidden">פתיחה</span>
                  <span className="ms-2 hidden group-open:inline">סגירה</span>
                </span>
              </span>
            </summary>
            <ul className="flex flex-wrap gap-2 border-t border-foreground/10 px-4 py-4 sm:px-5">
              {visibleConcepts.map((concept) => (
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

      {showVideos && (videoTotal > 0 || baseGridVideos.length > 0) ? (
        <section
          id="search-videos"
          className="scroll-mt-24"
          aria-labelledby="search-videos-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
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
            </div>
            {baseGridVideos.length > 0 ? (
              <SearchFilterControls
                q={trimmedQuery}
                filter={filter}
                type={type}
                freeCount={freeCount}
                clubCount={clubCount}
              />
            ) : null}
          </div>

          {videoTotal > 0 ? (
            <>
              <ul className="mt-5 space-y-2 sm:hidden">
                {pageVideos.map((v) => (
                  <li key={v.id}>
                    <SearchVideoRow video={v} />
                  </li>
                ))}
              </ul>
              <ul className="mt-5 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {pageVideos.map((v, index) => (
                  <li key={v.id}>
                    <VideoCard
                      video={v}
                      initialSaved={savedIds.has(v.youtube_id)}
                      initialCompleted={completedIds.has(v.youtube_id)}
                      priority={index === 0}
                      hasFullAccess={hasFullAccess}
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
                filter={filter}
                type={type}
              />
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">
              אין סרטונים בסינון הזה. נסה &quot;הכול&quot; או סינון אחר.
            </p>
          )}
        </section>
      ) : null}

      {blindSpotBlock}

      {trimmedQuery ? (
        <>
          <SearchMissedHelp key={trimmedQuery} searchQuery={trimmedQuery} />
          <SearchQualityFeedback
            searchQuery={trimmedQuery}
            analyticsId={analyticsId}
          />
        </>
      ) : null}
    </div>
  );
}
