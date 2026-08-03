/**
 * Site color theme (light / dark) for connected visitors.
 * Guests stay on light. Preference: cookie + localStorage, and profiles.theme when signed in.
 */

export const THEME_COOKIE = "nm_theme";
export const THEME_STORAGE_KEY = "nm_theme";

export type SiteTheme = "light" | "dark";

export function parseSiteTheme(raw: string | null | undefined): SiteTheme {
  return raw === "dark" ? "dark" : "light";
}

export function isConnectedForTheme(session: {
  authUserId: string | null;
  clubPhone: string | null;
}): boolean {
  return Boolean(session.authUserId || session.clubPhone);
}

export function applySiteTheme(
  theme: SiteTheme,
  root: HTMLElement = document.documentElement,
): void {
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.removeAttribute("data-theme");
    root.style.colorScheme = "light";
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      "content",
      theme === "dark" ? "#121212" : "#FAFAF8",
    );
  }
}

export function writeThemeCookie(theme: SiteTheme): void {
  const maxAge = 60 * 60 * 24 * 365;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearThemeCookie(): void {
  document.cookie = `${THEME_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Inline bootstrap to avoid light flash before hydration for connected users. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m&&decodeURIComponent(m[1]);if(t!=="dark")return;var h=document.documentElement;h.setAttribute("data-theme","dark");h.style.colorScheme="dark";var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content","#121212");}catch(e){}})();`;
