/**
 * Outbound social profiles. Links only (no embeds, no feed APIs).
 * Env vars override defaults when set.
 */

import { getSpotifyShowUrl } from "@/lib/podcast/links";
import { YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

export const DEFAULT_INSTAGRAM_URL =
  "https://www.instagram.com/nevermind.co.il";
export const DEFAULT_TIKTOK_URL = "https://www.tiktok.com/@nevermind.co.il";
export const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/nevermindyakir";

export type SocialChannel = {
  id: "youtube" | "instagram" | "tiktok" | "facebook" | "spotify";
  label: string;
  href: string;
};

function trimUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function resolveUrl(fromEnv: string | undefined, fallback: string): string {
  return trimUrl(fromEnv) ?? fallback;
}

export function getInstagramUrl(): string {
  return resolveUrl(
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    DEFAULT_INSTAGRAM_URL,
  );
}

export function getTikTokUrl(): string {
  return resolveUrl(process.env.NEXT_PUBLIC_TIKTOK_URL, DEFAULT_TIKTOK_URL);
}

export function getFacebookUrl(): string {
  return resolveUrl(
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    DEFAULT_FACEBOOK_URL,
  );
}

/** Profiles for Person/Organization sameAs and footer outbound row. */
export function getSocialChannels(): SocialChannel[] {
  return [
    { id: "youtube", label: "יוטיוב", href: YOUTUBE_CHANNEL_URL },
    { id: "instagram", label: "אינסטגרם", href: getInstagramUrl() },
    { id: "tiktok", label: "טיקטוק", href: getTikTokUrl() },
    { id: "facebook", label: "פייסבוק", href: getFacebookUrl() },
    { id: "spotify", label: "ספוטיפיי", href: getSpotifyShowUrl() },
  ];
}

/** URLs suitable for schema.org sameAs (social profiles only). */
export function getSocialSameAsUrls(): string[] {
  return getSocialChannels()
    .filter((c) => c.id !== "spotify")
    .map((c) => c.href);
}
