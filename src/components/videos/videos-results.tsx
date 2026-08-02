import { VideoCard } from "@/components/videos/video-card";
import { VideosBrowseControls } from "@/components/videos/videos-browse-controls";
import { VideosPagination } from "@/components/videos/videos-pagination";
import { getSavedYoutubeIds } from "@/actions/saved-videos";
import {
  VIDEOS_PAGE_SIZE,
  parsePageParam,
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

export async function VideosResults({
  filter: filterProp,
  sort: sortProp,
  concept: conceptProp,
  breakdown: breakdownProp,
  page: pageProp,
}: VideosResultsProps) {
  const filter = parseFilter(filterProp);
  const sort = parseSort(sortProp);
  const concept = conceptProp?.trim() || undefined;
  const breakdown = isBreakdownLevel(breakdownProp)
    ? breakdownProp
    : undefined;
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

  try {
    const [listed, saved] = await Promise.all([
      listBrowseVideosPage({
        page: requestedPage,
        pageSize: VIDEOS_PAGE_SIZE,
        filter,
        sort,
        concept,
        breakdown,
      }),
      getSavedYoutubeIds(),
    ]);
    videos = listed.videos;
    total = listed.total;
    page = listed.page;
    totalPages = listed.totalPages;
    savedIds = new Set(saved);
  } catch {
    videos = [];
    total = 0;
    page = 1;
    totalPages = 1;
  }

  return (
    <>
      <div className="lg:max-w-2xl">
        <p className="mt-4 max-w-prose leading-relaxed">
          {total === 0
            ? concept
              ? `אין סרטונים להצגה בנושא "${concept}". אפשר לבחור מושג אחר או לנקות את הסינון.`
              : "אין סרטונים להצגה במסנן הנוכחי. אפשר לשנות סינון או לחזור לכאן בהמשך."
            : concept
              ? `מציגים סרטונים בנושא "${concept}" (${total}). סרטוני מועדון מסומנים ומציעים בקשת צפייה בודדת.`
              : `בחרו סרטון. מוצגים עד ${VIDEOS_PAGE_SIZE} בכל עמוד (${total} בסך הכול). סרטוני מועדון מסומנים ומציעים בקשת צפייה בודדת.`}
        </p>
      </div>

      <VideosBrowseControls
        filter={filter}
        sort={sort}
        concept={concept}
        breakdown={breakdown}
      />

      <div id="videos-results" className="scroll-mt-24">
        {videos.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, index) => (
              <li key={v.id}>
                <VideoCard
                  video={v}
                  initialSaved={savedIds.has(v.youtube_id)}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <VideosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={VIDEOS_PAGE_SIZE}
          filter={filter}
          sort={sort}
          concept={concept}
          breakdown={breakdown}
        />
      </div>
    </>
  );
}
