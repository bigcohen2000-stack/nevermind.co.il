import Link from "next/link";

import {
  getApplePodcastUrl,
  getSpotifyShowUrl,
} from "@/lib/podcast/links";
import { cn } from "@/lib/utils";

type PodcastSubscribeProps = {
  className?: string;
  /** Dark band vs paper surface. */
  variant?: "dark" | "light";
};

/**
 * Podcast listen CTAs. Spotify is the listed show.
 * Apple appears only when NEXT_PUBLIC_APPLE_PODCAST_URL is set.
 * RSS is the site feed for apps that add by URL.
 */
export function PodcastSubscribe({
  className,
  variant = "light",
}: PodcastSubscribeProps) {
  const spotifyUrl = getSpotifyShowUrl();
  const appleUrl = getApplePodcastUrl();
  const onDark = variant === "dark";

  return (
    <div className={cn("space-y-4", className)}>
      <p
        className={cn(
          "text-sm leading-relaxed",
          onDark ? "text-foreground/75" : "text-foreground/70",
        )}
      >
        פודקאסט מרפסת. פרקים להאזנה בספוטיפיי. אותו ניתוח, בפורמט אודיו.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={spotifyUrl}
          className={cn("btn", onDark ? "btn-on-dark" : "btn-primary")}
          rel="noopener noreferrer"
          target="_blank"
        >
          האזנה בספוטיפיי
        </a>
        {appleUrl ? (
          <a
            href={appleUrl}
            className={cn("btn", onDark ? "btn-on-dark" : "btn-secondary")}
            rel="noopener noreferrer"
            target="_blank"
          >
            Apple Podcasts
          </a>
        ) : null}
        <Link
          href="/api/podcast.xml"
          className={cn(
            "inline-flex min-h-12 items-center text-sm underline-offset-4 hover:underline",
            onDark ? "text-foreground/80" : "text-foreground/75",
          )}
        >
          פיד RSS
        </Link>
      </div>
    </div>
  );
}
