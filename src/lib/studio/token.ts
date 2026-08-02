/**
 * Edge-safe studio session token (Web Crypto).
 * Must match server cookie value from the same secret.
 */

export const STUDIO_COOKIE = "nm_studio";

/** Default unlock URL slug. Override with STUDIO_GATE_SLUG in env. */
export const DEFAULT_STUDIO_GATE_SLUG = "nm-ops";

export function getStudioUnlockSecret(): string {
  const dedicated = process.env.STUDIO_SECRET?.trim();
  if (dedicated && dedicated.length >= 8) return dedicated;
  return process.env.CRON_SECRET?.trim() ?? "";
}

export function getStudioGateSlug(): string {
  const raw = process.env.STUDIO_GATE_SLUG?.trim();
  if (!raw) return DEFAULT_STUDIO_GATE_SLUG;
  // Path segment only: letters, numbers, hyphen, underscore.
  if (!/^[a-zA-Z0-9_-]{4,64}$/.test(raw)) return DEFAULT_STUDIO_GATE_SLUG;
  return raw;
}

export async function studioSessionTokenAsync(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`nevermind-studio:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidStudioCookieValue(
  cookieValue: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!cookieValue || !secret || secret.length < 8) return false;
  const expected = await studioSessionTokenAsync(secret);
  if (cookieValue.length !== expected.length) return false;
  // Timing-safe-ish compare for equal-length hex strings.
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
