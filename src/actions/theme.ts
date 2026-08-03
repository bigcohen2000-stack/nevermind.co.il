"use server";

import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  parseSiteTheme,
  THEME_COOKIE,
  type SiteTheme,
} from "@/lib/theme/theme";

const MAX_AGE = 60 * 60 * 24 * 365;

async function setThemeCookie(theme: SiteTheme): Promise<void> {
  const jar = await cookies();
  jar.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
}

async function clearThemeCookieServer(): Promise<void> {
  const jar = await cookies();
  jar.delete(THEME_COOKIE);
}

/**
 * Persist theme for a connected visitor.
 * Account users: profiles.theme via service role (theme column only).
 * Club-only: cookie.
 */
export async function setSiteThemePreference(
  raw: string,
): Promise<{ ok: true; theme: SiteTheme } | { ok: false; error: string }> {
  const theme = parseSiteTheme(raw);

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const jar = await cookies();
  const hasClub = Boolean(jar.get("nm_club")?.value);

  if (!userId && !hasClub) {
    await clearThemeCookieServer();
    return { ok: false, error: "התחברו כדי לשנות מצב תצוגה." };
  }

  await setThemeCookie(theme);

  if (userId) {
    try {
      const admin = getSupabaseAdmin();
      const now = new Date().toISOString();
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (existing) {
        await admin
          .from("profiles")
          .update({ theme, updated_at: now })
          .eq("id", userId);
      } else {
        await admin.from("profiles").insert({ id: userId, theme });
      }
    } catch {
      // Cookie still applied if profiles.theme migration is pending.
    }
  }

  return { ok: true, theme };
}

/** Call on logout so guests return to light canvas. */
export async function clearSiteThemePreference(): Promise<void> {
  await clearThemeCookieServer();
}
