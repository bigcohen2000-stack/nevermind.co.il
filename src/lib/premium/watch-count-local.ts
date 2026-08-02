"use client";

import { ACCESS_GATE_DISMISS_DAYS } from "@/lib/premium/access-gate-copy";

const STORAGE_KEY = "nm_watched_videos_v1";
const FREE_THRESHOLD = 3;
const DISMISS_UNTIL_KEY = "nm_access_gate_dismiss_until";
/** Legacy session key (migrated into the 14-day window on read). */
const DISMISS_SESSION_KEY = "nm_rabbit_hole_dismissed";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Record a distinct watched video id. Returns the new unique count. */
export function recordLocalWatchedVideo(youtubeId: string): number {
  if (typeof window === "undefined") return 0;
  const id = youtubeId.trim();
  if (!id) return 0;
  const ids = readIds();
  if (!ids.includes(id)) {
    ids.push(id);
    writeIds(ids);
  }
  return ids.length;
}

export function getLocalWatchedCount(): number {
  return readIds().length;
}

export function hasReachedFreeWatchLimit(
  threshold = FREE_THRESHOLD,
): boolean {
  return getLocalWatchedCount() >= threshold;
}

export const FREE_WATCH_THRESHOLD = FREE_THRESHOLD;

/**
 * True when the user dismissed the free access gate and the cool-down
 * window (default 14 days) has not elapsed.
 */
export function wasAccessGateDismissedRecently(
  days = ACCESS_GATE_DISMISS_DAYS,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_UNTIL_KEY);
    if (raw) {
      const until = Number(raw);
      if (Number.isFinite(until) && Date.now() < until) return true;
    }
    // Legacy: one dismiss this session → treat as capped for `days`.
    if (window.sessionStorage.getItem(DISMISS_SESSION_KEY) === "1") {
      dismissAccessGate(days);
      window.sessionStorage.removeItem(DISMISS_SESSION_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Persist dismiss so the free gate stays closed for `days`. */
export function dismissAccessGate(days = ACCESS_GATE_DISMISS_DAYS) {
  if (typeof window === "undefined") return;
  try {
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(DISMISS_UNTIL_KEY, String(until));
  } catch {
    /* private mode */
  }
}

/** @deprecated Prefer wasAccessGateDismissedRecently */
export function wasRabbitHoleDismissedThisSession(): boolean {
  return wasAccessGateDismissedRecently();
}

/** @deprecated Prefer dismissAccessGate */
export function dismissRabbitHoleThisSession() {
  dismissAccessGate();
}
