import Image from "next/image";
import Link from "next/link";

import { SaveVideoButton } from "@/components/videos/save-video-button";
import { ClubBadge } from "@/components/videos/club-badge";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  getTeaserThumbSrc,
  getWatchHref,
} from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

type LearningJourneyProps = {
  term: string;
  videos: Video[];
  savedIds?: Set<string>;
};

/**
 * Sequential Learning Journey timeline for a search concept.
 */
export function LearningJourney({
  term,
  videos,
  savedIds = new Set(),
}: LearningJourneyProps) {
  if (videos.length < 3) return null;

  return (
    <section
      aria-labelledby="learning-journey-title"
      className="rounded-[var(--radius-card)] border border-foreground/10 bg-paper/60 p-6 sm:p-8"
    >
      <p className="text-xs font-medium tracking-wide text-action">מסלול למידה</p>
      <h3
        id="learning-journey-title"
        className="mt-2 text-2xl font-semibold tracking-tight"
      >
        Your Journey: {term}
      </h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/70">
        {videos.length} סרטונים בסדר מומלץ. התחילו בראשון והתקדמו צעד אחרי צעד.
      </p>

      <ol className="relative mt-10 space-y-0">
        {videos.map((video, index) => {
          const step = index + 1;
          const isFirst = index === 0;
          const isLast = index === videos.length - 1;
          const gated = isMembersOnlyVideo(video);
          const thumb = getTeaserThumbSrc(video, {
            opaqueThumbPath: video.thumbnail_url,
          });
          const href = getWatchHref(video);
          const canSave = Boolean(video.youtube_id?.trim()) && !gated;

          return (
            <li key={video.id} className="relative flex gap-4 sm:gap-6">
              <div className="relative flex w-10 shrink-0 flex-col items-center sm:w-12">
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold sm:h-12 sm:w-12 ${
                    isFirst
                      ? "border-action bg-action text-background"
                      : "border-foreground/20 bg-background text-foreground"
                  }`}
                >
                  {step}
                </span>
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-10 bottom-0 w-px bg-foreground/15 sm:top-12"
                  />
                ) : null}
              </div>

              <div className={`min-w-0 flex-1 pb-10 ${isLast ? "pb-0" : ""}`}>
                {isFirst ? (
                  <p className="mb-2 inline-flex bg-action px-2 py-0.5 text-xs font-medium tracking-wide text-background">
                    Start Here
                  </p>
                ) : (
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted">
                    שלב {step}
                  </p>
                )}

                <div className="card relative overflow-hidden">
                  {canSave ? (
                    <SaveVideoButton
                      youtubeId={video.youtube_id}
                      initialSaved={savedIds.has(video.youtube_id)}
                    />
                  ) : null}
                  <Link
                    href={href}
                    className="grid text-foreground no-underline hover:no-underline sm:grid-cols-[12rem_1fr]"
                  >
                    <div className="relative aspect-video bg-paper sm:aspect-auto sm:min-h-[6.75rem]">
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 12rem"
                      />
                      {gated ? <ClubBadge /> : null}
                    </div>
                    <div className="flex flex-col justify-center p-4 sm:p-5">
                      <h4 className="text-base font-semibold leading-snug tracking-tight sm:text-lg">
                        {video.title}
                      </h4>
                      {video.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/70">
                          {video.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
