import "server-only";

/**
 * Public site origin for absolute podcast URLs (no trailing slash).
 */
export function getPodcastSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "https://nevermind.co.il";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function getPodcastFeedUrl(): string {
  return `${getPodcastSiteUrl()}/api/podcast.xml`;
}

export function getPodcastAudioUrl(youtubeId: string): string {
  return `${getPodcastSiteUrl()}/api/podcast/audio/${encodeURIComponent(youtubeId)}`;
}

/** Personal club vault feed (token required on every request). */
export function getClubPodcastFeedUrl(rawToken: string): string {
  return `${getPodcastSiteUrl()}/api/club/podcast.xml?token=${encodeURIComponent(rawToken)}`;
}

export function getClubPodcastAudioUrl(
  youtubeId: string,
  rawToken: string,
): string {
  return `${getPodcastSiteUrl()}/api/club/podcast/audio/${encodeURIComponent(youtubeId)}?token=${encodeURIComponent(rawToken)}`;
}

export function getPodcastOwnerEmail(): string {
  return (
    process.env.PODCAST_OWNER_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    "hello@nevermind.co.il"
  );
}
