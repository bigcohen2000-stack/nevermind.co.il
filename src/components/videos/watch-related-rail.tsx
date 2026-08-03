import { RelatedVideoCard } from "@/components/videos/related-video-card";
import type { RelatedVideo } from "@/lib/videos/queries";

type WatchRelatedRailProps = {
  videos: RelatedVideo[];
  blurb?: string;
};

/**
 * Related videos rail for watch (sidebar on desktop, early block on mobile).
 */
export function WatchRelatedRail({
  videos,
  blurb = "מאותו נושא, או סרטונים להמשך.",
}: WatchRelatedRailProps) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-action">המשך</p>
      <h2
        id="related-title"
        className="mt-1 text-lg font-semibold tracking-tight sm:text-xl"
      >
        סרטונים להמשך
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{blurb}</p>

      {videos.length > 0 ? (
        <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
          {videos.map((v, i) => (
            <li key={v.id} className="relative">
              <span
                className="absolute -start-0.5 top-2.5 z-[1] flex size-5 items-center justify-center bg-action text-[10px] font-medium text-background sm:size-6 sm:text-[11px]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="ps-4 sm:ps-5">
                <RelatedVideoCard video={v} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">אין עדיין סרטונים קשורים.</p>
      )}
    </div>
  );
}
