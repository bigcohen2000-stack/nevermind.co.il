"use client";

import { useEffect, useState } from "react";

import {
  listUserSearchHistory,
  pushUserSearchHistory,
} from "@/actions/search-history";
import {
  pushRecentSearch as pushLocalRecentSearch,
  readRecentSearches,
} from "@/lib/recent-searches";

function mergeRecent(local: string[], remote: string[], limit = 5): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of [...remote, ...local]) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Recent searches: localStorage for guests; merge + sync DB when signed in.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return readRecentSearches();
  });

  useEffect(() => {
    let cancelled = false;
    void listUserSearchHistory()
      .then((remote) => {
        if (cancelled || remote.length === 0) return;
        setRecent((local) => mergeRecent(local, remote));
      })
      .catch(() => {
        /* stay on local */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function pushRecent(term: string): string[] {
    const nextLocal = pushLocalRecentSearch(term);
    setRecent(nextLocal);
    void pushUserSearchHistory(term)
      .then((remote) => {
        if (remote.length === 0) return;
        setRecent(mergeRecent(nextLocal, remote));
      })
      .catch(() => {
        /* ignore */
      });
    return nextLocal;
  }

  return { recent, setRecent, pushRecent, readLocal: readRecentSearches };
}
