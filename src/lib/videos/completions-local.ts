"use client";

import { VIDEO_COMPLETIONS_STORAGE_KEY } from "@/lib/videos/progress-shared";

type StoredCompletions = Record<string, string>;

const MAX_ENTRIES = 48;

function readMap(): StoredCompletions {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VIDEO_COMPLETIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredCompletions;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: StoredCompletions) {
  const entries = Object.entries(map).sort(
    (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
  );
  const next: StoredCompletions = {};
  for (const [id, at] of entries.slice(0, MAX_ENTRIES)) {
    next[id] = at;
  }
  window.localStorage.setItem(
    VIDEO_COMPLETIONS_STORAGE_KEY,
    JSON.stringify(next),
  );
}

export function markLocalVideoCompleted(youtubeId: string): void {
  if (typeof window === "undefined") return;
  const id = youtubeId.trim();
  if (!id) return;
  const map = readMap();
  map[id] = new Date().toISOString();
  writeMap(map);
}

export function isLocalVideoCompleted(youtubeId: string): boolean {
  return Boolean(readMap()[youtubeId.trim()]);
}

export function getLocalCompletedYoutubeIds(): string[] {
  return Object.entries(readMap())
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .map(([id]) => id);
}
