import { BlindSpotInfoTip } from "@/components/search/blind-spot-info-tip";
import { VideoCard } from "@/components/videos/video-card";
import type { Video } from "@/types/supabase";

type BlindSpotSectionProps = {
  premise: string;
  opposite: string;
  tease: string;
  videos: Video[];
  savedIds?: Set<string>;
};

/**
 * Contrasting "blind spot" block above search results:
 * videos for the mapped opposite of the user's search premise.
 */
export function BlindSpotSection({
  premise,
  opposite,
  tease,
  videos,
  savedIds,
}: BlindSpotSectionProps) {
  if (videos.length === 0) return null;

  return (
    <section
      aria-labelledby="blind-spot-title"
      className="border border-action bg-ink px-5 py-6 text-[#FAFAF8] sm:px-7 sm:py-8"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-action">
            כיוון הפוך
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2
              id="blind-spot-title"
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              השטח העיוור שלך
            </h2>
            <BlindSpotInfoTip />
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9CA3AF]">
            חיפשת <span className="text-[#FAFAF8]">{premise}</span>. הכיוון
            ההפוך: <span className="text-action">{opposite}</span>. {tease}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard
              video={video}
              initialSaved={savedIds?.has(video.youtube_id) ?? false}
              tone="dark"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
