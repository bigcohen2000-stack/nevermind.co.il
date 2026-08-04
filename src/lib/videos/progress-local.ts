"use client";

import {
  VIDEO_PROGRESS_STORAGE_KEY,
  shouldPersistProgress,
  type ContinueWatchingItem,
} from "@/lib/videos/progress-shared";

type StoredMap = Record<string, ContinueWatchingItem>;

/** Cap stored entries so localStorage does not grow unbounded. */
const MAX_STORED_ENTRIES = 24;

function readMap(): StoredMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VIDEO_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function pruneMap(map: StoredMap): StoredMap {
  const entries = Object.values(map).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (entries.length <= MAX_STORED_ENTRIES) return map;
  const next: StoredMap = {};
  for (const item of entries.slice(0, MAX_STORED_ENTRIES)) {
    next[item.youtubeId] = item;
  }
  return next;
}

function writeMap(map: StoredMap) {
  window.localStorage.setItem(
    VIDEO_PROGRESS_STORAGE_KEY,
    JSON.stringify(pruneMap(map)),
  );
}

export function saveLocalVideoProgress(input: {
  youtubeId: string;
  progressSeconds: number;
  durationSeconds: number | null;
  title: string;
  thumbnailUrl: string | null;
}): void {
  if (typeof window === "undefined") return;
  const progressSeconds = Math.floor(input.progressSeconds);
  const durationSeconds =
    input.durationSeconds && input.durationSeconds > 0
      ? Math.floor(input.durationSeconds)
      : null;

  const map = readMap();

  if (!shouldPersistProgress(progressSeconds, durationSeconds)) {
    delete map[input.youtubeId];
    writeMap(map);
    return;
  }

  map[input.youtubeId] = {
    youtubeId: input.youtubeId,
    progressSeconds,
    durationSeconds,
    title: input.title,
    thumbnailUrl: input.thumbnailUrl,
    updatedAt: new Date().toISOString(),
  };
  writeMap(map);
}

export function getLocalVideoProgress(
  youtubeId: string,
): ContinueWatchingItem | null {
  const entry = readMap()[youtubeId];
  return entry ?? null;
}

export function getLatestLocalContinueWatching(): ContinueWatchingItem | null {
  const list = getLocalContinueWatchingList(1);
  return list[0] ?? null;
}

/** Recent in-progress watches, newest first. */
export function getLocalContinueWatchingList(
  limit = 8,
): ContinueWatchingItem[] {
  const entries = Object.values(readMap()).filter(
    (item) => item.progressSeconds >= 5,
  );
  if (entries.length === 0) return [];
  return entries
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, Math.max(1, limit));
}

export function clearLocalVideoProgress(youtubeId: string): void {
  if (typeof window === "undefined") return;
  const map = readMap();
  delete map[youtubeId];
  writeMap(map);
}
