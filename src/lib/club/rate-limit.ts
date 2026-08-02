import "server-only";

type Bucket = { fails: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_FAILS = 5;

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, value] of buckets) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}

/**
 * In-memory rate limit for club password attempts (per IP and/or phone).
 * Best-effort on serverless: limits burst abuse on a warm isolate.
 */
export function assertClubLoginRateLimit(keys: string[]): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  const now = Date.now();
  prune(now);

  for (const raw of keys) {
    const key = raw.trim();
    if (!key) continue;
    const bucket = buckets.get(key);
    if (bucket && bucket.resetAt > now && bucket.fails >= MAX_FAILS) {
      return {
        ok: false,
        error: "נסיונות רבים מדי. נסו שוב בעוד דקה.",
      };
    }
  }

  return { ok: true };
}

export function recordClubLoginFailure(keys: string[]): void {
  const now = Date.now();
  for (const raw of keys) {
    const key = raw.trim();
    if (!key) continue;
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { fails: 1, resetAt: now + WINDOW_MS });
    } else {
      existing.fails += 1;
    }
  }
}

export function clearClubLoginFailures(keys: string[]): void {
  for (const raw of keys) {
    const key = raw.trim();
    if (!key) continue;
    buckets.delete(key);
  }
}
