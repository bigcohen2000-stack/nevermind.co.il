"use client";

type WatchPlayerProps = {
  youtubeId: string;
  startSeconds?: number;
  title?: string;
};

/**
 * Standard YouTube iframe embed with ?start= for timestamp deep-links (?t=).
 * Remounts when youtubeId or startSeconds change.
 */
export function WatchPlayer({
  youtubeId,
  startSeconds = 0,
  title = "נגן YouTube",
}: WatchPlayerProps) {
  const start = Math.max(0, Math.floor(startSeconds));
  const src = new URL(`https://www.youtube.com/embed/${youtubeId}`);
  src.searchParams.set("rel", "0");
  src.searchParams.set("modestbranding", "1");
  src.searchParams.set("playsinline", "1");
  src.searchParams.set("hl", "he");
  if (start > 0) {
    src.searchParams.set("start", String(start));
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-foreground/15 bg-ink">
      <iframe
        key={`${youtubeId}-${start}`}
        title={title}
        src={src.toString()}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
