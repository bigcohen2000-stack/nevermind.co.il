import "server-only";

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60_000;
/** Max magic-link sends per key in the window. */
const MAX_SENDS = 5;

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 800) return;
  for (const [key, value] of buckets) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort in-memory rate limit for email magic-link sends (IP + email).
 * Soft on serverless: still cuts burst abuse on a warm isolate.
 */
export function assertMagicLinkRateLimit(keys: string[]): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  const now = Date.now();
  prune(now);

  for (const raw of keys) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    const bucket = buckets.get(key);
    if (bucket && bucket.resetAt > now && bucket.count >= MAX_SENDS) {
      return {
        ok: false,
        error: "נשלחו יותר מדי קישורים. נסו שוב בעוד כמה דקות.",
      };
    }
  }

  return { ok: true };
}

export function recordMagicLinkSend(keys: string[]): void {
  const now = Date.now();
  for (const raw of keys) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      existing.count += 1;
    }
  }
}
