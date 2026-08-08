import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { InfoTip } from "@/components/ui/info-tip";
import { VideoCard } from "@/components/videos/video-card";
import { VideosBrowseControls } from "@/components/videos/videos-browse-controls";
import { VideosPagination } from "@/components/videos/videos-pagination";
import { getCompletedYoutubeIds } from "@/actions/video-completions";
import { getSavedYoutubeIds } from "@/actions/saved-videos";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { INFO_TIPS } from "@/lib/content/info-tips";
import {
  VIDEOS_PAGE_SIZE,
  isVideoBrowseDuration,
  parsePageParam,
  type VideoBrowseDuration,
} from "@/lib/videos/browse-params";
import { isBreakdownLevel, type BreakdownLevel } from "@/lib/videos/investigation";
import {
  listBrowseVideosPage,
  type VideoBrowseFilter,
  type VideoBrowseSort,
} from "@/lib/videos/queries";

type VideosResultsProps = {
  filter?: VideoBrowseFilter;
  sort?: VideoBrowseSort;
  concept?: string;
  breakdown?: BreakdownLevel | string;
  duration?: VideoBrowseDuration | string;
  page?: number | string;
};

function parseFilter(value: string | undefined): VideoBrowseFilter {
  if (value === "open" || value === "club" || value === "all") return value;
  return "all";
}

function parseSort(value: string | undefined): VideoBrowseSort {
  if (
    value === "newest" ||
    value === "oldest" ||
    value === "title" ||
    value === "longest"
  ) {
    return value;
  }
  return "newest";
}

function summaryLine(total: number, concept: string | undefined): string {
  const n = total.toLocaleString("he-IL");
  if (concept) {
    return `מציגים ${n} סרטונים בנושא ${concept}.`;
  }
  return `מציגים ${n} סרטונים.`;
}

function filterLine(filter: VideoBrowseFilter): string {
  if (filter === "open") return "מוצגים סרטונים פתוחים.";
  if (filter === "club") return "מוצגים סרטוני מועדון.";
  return "מוצגים סרטוני מועדון וסרטונים פתוחים.";
}

export async function VideosResults({
  filter: filterProp,
  sort: sortProp,
  concept: conceptProp,
  breakdown: breakdownProp,
  duration: durationProp,
  page: pageProp,
}: VideosResultsProps) {
  const filter = parseFilter(filterProp);
  const sort = parseSort(sortProp);
  const concept = conceptProp?.trim() || undefined;
  const breakdown = isBreakdownLevel(breakdownProp)
    ? breakdownProp
    : undefined;
  const duration: VideoBrowseDuration = isVideoBrowseDuration(durationProp)
    ? durationProp
    : "all";
  const requestedPage =
    typeof pageProp === "number"
      ? Math.max(1, Math.floor(pageProp) || 1)
      : parsePageParam(
          pageProp === undefined || pageProp === null
            ? undefined
            : String(pageProp),
        );

  let videos: Awaited<ReturnType<typeof listBrowseVideosPage>>["videos"] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let savedIds = new Set<string>();
  let completedIds = new Set<string>();
  let hasFullAccess = false;

  try {
    const [listed, saved, completed, access] = await Promise.all([
      listBrowseVideosPage({
        page: requestedPage,
        pageSize: VIDEOS_PAGE_SIZE,
        filter,
        sort,
        concept,
        breakdown,
        duration,
      }),
      getSavedYoutubeIds(),
      getCompletedYoutubeIds(),
      resolveVideoEntitlement().catch(() => null),
    ]);
    videos = listed.videos;
    total = listed.total;
    page = listed.page;
    totalPages = listed.totalPages;
    savedIds = new Set(saved);
    completedIds = new Set(completed);
    hasFullAccess = Boolean(
      access && (access.entitled || access.hasVideoAccess),
    );
  } catch {
    videos = [];
    total = 0;
    page = 1;
    totalPages = 1;
  }

  return (
    <>
      <div className="lg:max-w-2xl">
        <p
          className="mt-4 max-w-prose leading-relaxed"
          aria-live="polite"
          aria-atomic="true"
        >
          {total === 0
            ? concept
              ? `אין סרטונים להצגה בנושא ${concept}. אפשר לבחור מושג אחר או לנקות את הסינון.`
              : "אין סרטונים להצגה במסנן הנוכחי. אפשר לשנות סינון או לחזור לכאן בהמשך."
            : summaryLine(total, concept)}
        </p>
        <p className="mt-2 inline-flex max-w-prose flex-wrap items-center gap-1.5 text-sm leading-relaxed text-muted">
          <span>{filterLine(filter)}</span>
          {filter !== "open" ? (
            <InfoTip label={INFO_TIPS.clubVideo.label}>
              {INFO_TIPS.clubVideo.text}
            </InfoTip>
          ) : null}
        </p>
      </div>

      <VideosBrowseControls
        filter={filter}
        sort={sort}
        concept={concept}
        breakdown={breakdown}
        duration={duration}
      />

      <div id="videos-results" className="scroll-mt-24">
        {videos.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, index) => (
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
        ) : (
          <SmartEmptyState
            message={
              concept
                ? `אין סרטונים להצגה בנושא "${concept}". אפשר לבחור מושג אחר מהרשימה, או לנקות סינון.`
                : "אין סרטונים להצגה במסנן הנוכחי. אפשר להתחיל מאחד ממושגי הליבה."
            }
          />
        )}

        <VideosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={VIDEOS_PAGE_SIZE}
          filter={filter}
          sort={sort}
          concept={concept}
          breakdown={breakdown}
          duration={duration}
        />
      </div>
    </>
  );
}
