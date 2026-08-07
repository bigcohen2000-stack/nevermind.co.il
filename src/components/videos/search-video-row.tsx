import Image from "next/image";
import Link from "next/link";

import { ClubBadge } from "@/components/videos/club-badge";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  getTeaserThumbSrc,
  getWatchHref,
} from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";
import { cn } from "@/lib/utils";

type SearchVideoRowProps = {
  video: Video;
  className?: string;
  tone?: "light" | "dark";
};

/**
 * Compact horizontal video row for search / mobile. Prefer over full cards on small screens.
 */
export function SearchVideoRow({
  video,
  className,
  tone = "light",
}: SearchVideoRowProps) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const dark = tone === "dark";

  return (
    <Link
      href={getWatchHref(video)}
      className={cn(
        "group flex gap-3 border p-2.5 no-underline transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
        dark
          ? "border-white/15 bg-white/5 hover:border-action"
          : "border-foreground/10 bg-background hover:border-foreground/25",
        className,
      )}
    >
      <span
        className={cn(
          "relative aspect-video w-28 shrink-0 overflow-hidden border sm:w-32",
          dark ? "border-white/15 bg-white/5" : "border-foreground/10 bg-paper",
        )}
      >
        <Image
          src={thumb}
          alt={video.title}
          fill
          sizes="128px"
          className="object-cover"
        />
        {gated ? <ClubBadge /> : null}
      </span>
      <span className="min-w-0 flex-1 self-center text-start">
        <span
          className={cn(
            "line-clamp-2 text-sm font-semibold leading-snug tracking-tight group-hover:text-action",
            dark ? "text-[#FAFAF8]" : "text-foreground",
          )}
        >
          {video.title}
        </span>
        {gated ? (
          <span
            className={cn(
              "mt-1 block text-xs",
              dark ? "text-white/55" : "text-muted",
            )}
          >
            נפתח במועדון. הצפייה אחרי בקשת גישה.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
