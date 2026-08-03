import "server-only";

import { cookies } from "next/headers";

import type { HeaderSession } from "@/lib/auth/header-session-shared";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isConnectedForTheme,
  parseSiteTheme,
  THEME_COOKIE,
  type SiteTheme,
} from "@/lib/theme/theme";

/**
 * Resolve theme for this request.
 * Guests always light. Connected: profile theme for account users, else cookie.
 */
export async function resolveSiteTheme(
  session: HeaderSession,
): Promise<SiteTheme> {
  if (!isConnectedForTheme(session)) {
    return "light";
  }

  const jar = await cookies();

  if (session.authUserId) {
    try {
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from("profiles")
        .select("theme")
        .eq("id", session.authUserId)
        .maybeSingle();
      if (data?.theme === "dark" || data?.theme === "light") {
        return data.theme;
      }
    } catch {
      // Column or profile missing until migration runs.
    }
  }

  return parseSiteTheme(jar.get(THEME_COOKIE)?.value);
}
