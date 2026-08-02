const STORAGE_PREFIX = "nm_search_analytics_id:";

export function storeSearchAnalyticsId(query: string, id: string): void {
  if (typeof window === "undefined") return;
  const key = storageKey(query);
  if (!key) return;
  try {
    sessionStorage.setItem(key, id);
  } catch {
    /* private mode / quota */
  }
}

export function readStoredSearchAnalyticsId(query: string): string | null {
  if (typeof window === "undefined") return null;
  const key = storageKey(query);
  if (!key) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function clearStoredSearchAnalyticsId(query: string): void {
  if (typeof window === "undefined") return;
  const key = storageKey(query);
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function storageKey(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return `${STORAGE_PREFIX}${trimmed}`;
}
