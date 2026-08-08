import "server-only";

type Bucket = { fails: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_FAILS = 5;

const buckets = new Map<string, Bucket>();

/** Public renewal mark: counts every accepted call, not only failures. */
const RENEWAL_WINDOW_MS = 60 * 60 * 1000;
const RENEWAL_MAX_MARKS = 4;
const renewalBuckets = new Map<string, Bucket>();

function prune(map: Map<string, Bucket>, now: number) {
  if (map.size < 500) return;
  for (const [key, value] of map) {
    if (value.resetAt <= now) map.delete(key);
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
  prune(buckets, now);

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

/**
 * Counting limit for the member facing "sent on WhatsApp" mark.
 * Every accepted call is counted, so the banner cannot be used to hammer the DB.
 */
export function assertClubRenewalMarkRateLimit(keys: string[]): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  const now = Date.now();
  prune(renewalBuckets, now);

  const live = keys.map((raw) => raw.trim()).filter(Boolean);

  for (const key of live) {
    const bucket = renewalBuckets.get(key);
    if (bucket && bucket.resetAt > now && bucket.fails >= RENEWAL_MAX_MARKS) {
      return {
        ok: false,
        error: "הבקשה כבר נרשמה. אפשר לנסות שוב מאוחר יותר.",
      };
    }
  }

  for (const key of live) {
    const bucket = renewalBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      renewalBuckets.set(key, { fails: 1, resetAt: now + RENEWAL_WINDOW_MS });
    } else {
      bucket.fails += 1;
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
