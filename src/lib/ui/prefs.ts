export const UI_PREFS_COOKIE = "nm_ui_prefs";

export type UiDensity = "comfortable" | "compact";

export type UiPrefs = {
  /** Remember preferred focus mode for /watch visits. */
  focusDefault: boolean;
  density: UiDensity;
};

export const DEFAULT_UI_PREFS: UiPrefs = {
  focusDefault: false,
  density: "comfortable",
};

export function parseUiPrefsCookie(raw: string | undefined | null): UiPrefs {
  if (!raw) return { ...DEFAULT_UI_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      focusDefault: Boolean(parsed.focusDefault),
      density: parsed.density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

export function serializeUiPrefs(prefs: UiPrefs): string {
  return JSON.stringify({
    focusDefault: Boolean(prefs.focusDefault),
    density: prefs.density === "compact" ? "compact" : "comfortable",
  });
}

/** Client-side cookie write (readable on next navigation / hydrate). */
export function writeUiPrefsClient(prefs: UiPrefs): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(serializeUiPrefs(prefs));
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${UI_PREFS_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function readUiPrefsClient(): UiPrefs {
  if (typeof document === "undefined") return { ...DEFAULT_UI_PREFS };
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${UI_PREFS_COOKIE}=`));
  if (!match) return { ...DEFAULT_UI_PREFS };
  try {
    return parseUiPrefsCookie(
      decodeURIComponent(match.split("=").slice(1).join("=")),
    );
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}
