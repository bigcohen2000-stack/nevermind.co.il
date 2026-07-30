import Image from "next/image";
import Link from "next/link";

import type { Video } from "@/types/supabase";

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  const thumb =
    video.thumbnail_url ??
    `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;

  return (
    <Link
      href={`/watch/${video.youtube_id}`}
      className="group card flex h-full flex-col overflow-hidden focus-visible:outline-none"
    >
      <div className="relative aspect-video border-b border-foreground/10 bg-paper">
        <Image
          src={thumb}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition group-hover:bg-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-background/80 bg-foreground/70">
            <span
              aria-hidden="true"
              className="ms-0.5 h-0 w-0 border-y-[8px] border-s-[14px] border-y-transparent border-s-background"
            />
          </span>
        </span>
        {video.is_gated ? (
          <span className="absolute top-2 start-2 bg-foreground px-2 py-0.5 text-xs text-background">
            לחברים
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug tracking-tight">
          {video.title}
        </h3>
        {video.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/70">
            {video.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
