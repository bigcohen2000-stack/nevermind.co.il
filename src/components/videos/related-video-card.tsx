import Image from "next/image";
import Link from "next/link";

import type { RelatedVideo } from "@/lib/videos/queries";
import { ClubBadge } from "@/components/videos/club-badge";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  getTeaserThumbSrc,
  getWatchHref,
} from "@/lib/videos/watch-path";

function formatTimestamp(seconds: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type RelatedVideoCardProps = {
  video: RelatedVideo;
};

export function RelatedVideoCard({ video }: RelatedVideoCardProps) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const stamp = formatTimestamp(video.startTimestamp);
  const href = getWatchHref(video, {
    startSeconds: gated ? null : video.startTimestamp,
  });

  return (
    <article>
      <Link
        href={href}
        className="group flex gap-4 border border-foreground/10 bg-background p-3 transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <div className="relative aspect-video w-36 shrink-0 overflow-hidden border border-foreground/10 bg-paper sm:w-40">
          <Image
            src={thumb}
            alt={video.title}
            fill
            sizes="160px"
            className="object-cover"
          />
          {gated ? <ClubBadge /> : null}
          {gated ? (
            <span
              className="absolute inset-0 z-[1] flex items-center justify-center bg-black/40"
              aria-label="תוכן לחברים"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 text-background"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <rect x="5" y="11" width="14" height="10" rx="1.5" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          ) : null}
          {stamp && !gated ? (
            <span className="absolute bottom-1 end-1 bg-foreground/85 px-1.5 py-0.5 text-[11px] tabular-nums text-background">
              {stamp}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-start">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-action group-focus-visible:text-action sm:text-base">
            {video.title}
          </h3>
          {video.sharedConcept ? (
            <p className="mt-1.5 text-xs text-muted">
              מושג משותף: {video.sharedConcept}
            </p>
          ) : null}
          {stamp && !gated ? (
            <p className="mt-1 text-xs text-foreground/70">
              נקודת כניסה: {stamp}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
