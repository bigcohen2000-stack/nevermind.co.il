/**
 * Public podcast destinations (safe for client components).
 * Spotify show is the listed channel. Apple only when env is set.
 */

export const DEFAULT_SPOTIFY_SHOW_URL =
  "https://open.spotify.com/show/4eHh7bqCI1E0GmAUMVsTar";

export function getSpotifyShowUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL?.trim();
  if (fromEnv) return fromEnv.split("?")[0] || fromEnv;
  return DEFAULT_SPOTIFY_SHOW_URL;
}

/** Official Apple Podcasts page only. Empty when not listed yet. */
export function getApplePodcastUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL?.trim();
  return fromEnv || null;
}
