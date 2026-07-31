import Image from "next/image";
import Link from "next/link";

import type { RelatedVideo } from "@/lib/videos/queries";

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
  const thumb =
    video.thumbnail_url ??
    `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;
  const stamp = formatTimestamp(video.startTimestamp);
  const href =
    video.startTimestamp != null
      ? `/watch/${video.youtube_id}?t=${video.startTimestamp}`
      : `/watch/${video.youtube_id}`;

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
          {stamp ? (
            <span className="absolute bottom-1 end-1 bg-foreground/85 px-1.5 py-0.5 text-[11px] tabular-nums text-background">
              {stamp}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-start">
          <h3 className="text-sm font-semibold leading-snug tracking-tight group-hover:text-action sm:text-base">
            {video.title}
          </h3>
          {video.sharedConcept ? (
            <p className="mt-1.5 text-xs text-muted">
              מושג משותף: {video.sharedConcept}
            </p>
          ) : null}
          {stamp ? (
            <p className="mt-1 text-xs text-foreground/70">
              נקודת כניסה: {stamp}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
