import Image from "next/image";
import Link from "next/link";

import { ClubBadge } from "@/components/videos/club-badge";
import { SaveVideoButton } from "@/components/videos/save-video-button";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
import { videoIsNew } from "@/lib/content/is-new";
import { cn } from "@/lib/utils";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { formatVideoMetaLine } from "@/lib/videos/format-meta";
import {
  getTeaserThumbSrc,
  getWatchHref,
  GATED_LOCK_IMAGE,
} from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

type VideoCardProps = {
  video: Video;
  initialSaved?: boolean;
  /** Dark surface for /my-list and other ink pages. */
  tone?: "light" | "dark";
  /** First above-fold card on browse grids (LCP). */
  priority?: boolean;
  /** Club / video access unlocked: no buy CTA, no lock overlay. */
  hasFullAccess?: boolean;
};

function LockOverlay() {
  return (
    <span
      className="absolute inset-0 z-[1] flex items-center justify-center bg-black/40"
      aria-label="תוכן לחברים"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-7 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <rect x="5" y="11" width="14" height="10" rx="1.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    </span>
  );
}

function MemberAccessStrip({ tone }: { tone: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "border border-b-0 px-3 py-2.5",
        tone === "dark"
          ? "border-zinc-700 bg-zinc-950"
          : "border-foreground/15 bg-paper",
      )}
    >
      <p
        className={cn(
          "text-xs leading-snug",
          tone === "dark" ? "text-zinc-300" : "text-foreground/85",
        )}
      >
        יש לך גישה מלאה כחבר אתר
      </p>
    </div>
  );
}

/**
 * Flat video teaser card (RSC). Save / request CTAs stay client islands.
 * 3D hover was removed from list grids to protect INP and client JS.
 */
export function VideoCard({
  video,
  initialSaved = false,
  tone = "light",
  priority = false,
  hasFullAccess = false,
}: VideoCardProps) {
  const membersOnly = isMembersOnlyVideo(video);
  const locked = membersOnly && !hasFullAccess;
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const href = getWatchHref(video);
  const canSave = Boolean(video.youtube_id?.trim()) && !locked;
  const isDark = tone === "dark";
  const metaLine = formatVideoMetaLine(video);
  const showNew = videoIsNew(video);
  const shellClass = cn(
    "group relative flex h-auto min-h-full w-full flex-col overflow-hidden",
    isDark
      ? "rounded-[var(--radius-card)] border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-none"
      : "card",
  );

  return (
    <article className="h-full">
      <div className={cn(shellClass, "h-full w-full")}>
        {membersOnly && hasFullAccess ? (
          <MemberAccessStrip tone={tone} />
        ) : null}
        {locked ? (
          <SingleVideoRequestCta title={video.title} videoId={video.id} />
        ) : null}
        <div className="relative flex h-full flex-col">
          {canSave ? (
            <SaveVideoButton
              youtubeId={video.youtube_id}
              initialSaved={initialSaved}
            />
          ) : null}
          <Link
            href={href}
            className="flex h-full flex-col focus-visible:outline-none"
          >
            <div
              className={cn(
                "relative aspect-video w-full overflow-hidden border-b",
                isDark
                  ? "border-zinc-700 bg-zinc-800"
                  : "border-foreground/10 bg-paper",
              )}
            >
              <Image
                src={thumb || GATED_LOCK_IMAGE}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority={priority}
              />
              {membersOnly ? <ClubBadge /> : null}
              {locked ? <LockOverlay /> : null}
              {showNew ? (
                <span className="absolute start-2 top-2 z-[2] border border-background/40 bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-background">
                  חדש
                </span>
              ) : null}
              {!locked ? (
                <span
                  className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  aria-hidden="true"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-background/40 bg-black/50">
                    <span className="ms-0.5 h-0 w-0 border-y-[7px] border-s-[12px] border-y-transparent border-s-background" />
                  </span>
                </span>
              ) : null}
            </div>
            <div className="flex w-full flex-1 flex-col p-4 sm:p-5">
              <h3
                className={cn(
                  "line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors",
                  "group-hover:text-action group-focus-within:text-action",
                  isDark ? "text-zinc-100" : "text-foreground",
                )}
              >
                {video.title}
              </h3>
              {metaLine ? (
                <p
                  className={cn(
                    "mt-1.5 text-xs tabular-nums",
                    isDark ? "text-zinc-500" : "text-muted",
                  )}
                >
                  {metaLine}
                </p>
              ) : null}
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
