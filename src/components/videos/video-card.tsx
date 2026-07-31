"use client";

import Image from "next/image";
import Link from "next/link";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import type { Video } from "@/types/supabase";

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  const thumb =
    video.thumbnail_url ??
    `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;

  return (
    <article className="h-full">
      <CardContainer
        containerClassName="py-0 w-full h-full"
        className="inter-var h-full w-full"
      >
        <CardBody className="card group relative flex h-auto min-h-full w-full flex-col overflow-hidden">
          <Link
            href={`/watch/${video.youtube_id}`}
            className="flex h-full flex-col focus-visible:outline-none"
          >
            <CardItem translateZ={40} className="w-full">
              <div className="relative aspect-video border-b border-foreground/10 bg-paper">
                <Image
                  src={thumb}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition group-hover:bg-foreground/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/50 bg-black/55">
                    <span
                      aria-hidden="true"
                      className="ms-0.5 h-0 w-0 border-y-[8px] border-s-[14px] border-y-transparent border-s-foreground"
                    />
                  </span>
                </span>
                {video.is_gated ? (
                  <span className="absolute top-2 start-2 bg-foreground px-2 py-0.5 text-xs text-background">
                    לחברים
                  </span>
                ) : null}
              </div>
            </CardItem>
            <CardItem
              translateZ={50}
              className="flex w-full flex-1 flex-col p-5"
            >
              <h3 className="text-base font-semibold leading-snug tracking-tight">
                {video.title}
              </h3>
              {video.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/70">
                  {video.description}
                </p>
              ) : null}
            </CardItem>
          </Link>
        </CardBody>
      </CardContainer>
    </article>
  );
}
