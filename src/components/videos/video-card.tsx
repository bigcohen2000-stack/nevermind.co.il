"use client";

import Image from "next/image";
import Link from "next/link";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ClubBadge } from "@/components/videos/club-badge";
import { SaveVideoButton } from "@/components/videos/save-video-button";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
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

function CardCover({
  video,
  thumb,
  isDark,
  with3d,
  gated,
}: {
  video: Video;
  thumb: string;
  isDark: boolean;
  with3d: boolean;
  gated: boolean;
}) {
  const cover = (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden border-b",
        isDark ? "border-zinc-700 bg-zinc-800" : "border-foreground/10 bg-paper",
      )}
    >
      <Image
        src={thumb}
        alt={video.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      {gated ? <ClubBadge /> : null}
      {gated ? <LockOverlay /> : null}
      {!gated ? (
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
  );

  if (!with3d) return cover;
  return (
    <CardItem translateZ={40} className="w-full">
      {cover}
    </CardItem>
  );
}

function CardCopy({
  video,
  isDark,
  with3d,
}: {
  video: Video;
  isDark: boolean;
  with3d: boolean;
}) {
  const metaLine = formatVideoMetaLine(video);

  const body = (
    <>
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
    </>
  );

  if (!with3d) {
    return <div className="flex w-full flex-1 flex-col p-4 sm:p-5">{body}</div>;
  }

  return (
    <CardItem translateZ={50} className="flex w-full flex-1 flex-col p-4 sm:p-5">
      {body}
    </CardItem>
  );
}

export function VideoCard({
  video,
  initialSaved = false,
  tone = "light",
}: VideoCardProps) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const href = getWatchHref(video);
  const canSave = Boolean(video.youtube_id?.trim()) && !gated;
  const isDark = tone === "dark";
  const shellClass = cn(
    "group relative flex h-auto min-h-full w-full flex-col overflow-hidden",
    isDark
      ? "rounded-[var(--radius-card)] border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-none"
      : "card",
  );

  const inner = (
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
        <CardCover
          video={video}
          thumb={thumb || GATED_LOCK_IMAGE}
          isDark={isDark}
          with3d={!gated}
          gated={gated}
        />
        <CardCopy video={video} isDark={isDark} with3d={!gated} />
      </Link>
    </div>
  );

  // Gated cards stay flat: 3D motion hurts INP on list pages.
  if (gated) {
    return (
      <article className="h-full">
        <div className={cn(shellClass, "h-full w-full")}>
          <SingleVideoRequestCta title={video.title} videoId={video.id} />
          {inner}
        </div>
      </article>
    );
  }

  return (
    <article className="h-full">
      <CardContainer
        containerClassName="py-0 w-full h-full"
        className="inter-var h-full w-full"
      >
        <CardBody className={shellClass}>{inner}</CardBody>
      </CardContainer>
    </article>
  );
}
