import "server-only";

type Bucket = { fails: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_FAILS = 5;
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 200) return;
  for (const [key, value] of buckets) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}

export function assertStudioUnlockRateLimit(ip: string): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  const key = `studio:${ip || "unknown"}`;
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (bucket && bucket.resetAt > now && bucket.fails >= MAX_FAILS) {
    return { ok: false, error: "נסיונות רבים מדי. נסו שוב בעוד דקה." };
  }
  return { ok: true };
}

export function recordStudioUnlockFailure(ip: string): void {
  const key = `studio:${ip || "unknown"}`;
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { fails: 1, resetAt: now + WINDOW_MS });
  } else {
    existing.fails += 1;
  }
}

export function clearStudioUnlockFailures(ip: string): void {
  buckets.delete(`studio:${ip || "unknown"}`);
}
