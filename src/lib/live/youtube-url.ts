/**
 * YouTube Live URL validation for שידור חי מהאין.
 * Accepts youtube.com and youtu.be hosts only.
 */

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export function normalizeYoutubeLiveUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 500) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return null;

  // Force https for storage.
  url.protocol = "https:";
  return url.toString();
}

export function isValidYoutubeLiveUrl(raw: string): boolean {
  return normalizeYoutubeLiveUrl(raw) !== null;
}
