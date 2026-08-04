import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getPublicSupabaseEnv } from "@/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/my-list";
  // Allow post-signup welcome landing.
  if (raw === "/welcome" || raw.startsWith("/welcome?")) return raw;
  return raw;
}

function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  const out: { name: string; value: string }[] = [];
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      out.push({ name: trimmed, value: "" });
      continue;
    }
    out.push({
      name: trimmed.slice(0, eq),
      // Keep everything after the first "=" (values may contain "=").
      value: trimmed.slice(eq + 1),
    });
  }
  return out;
}

function redirectWithError(requestUrl: URL, reason: string, next: string) {
  const fallback =
    next.startsWith("/welcome") || next.includes("register")
      ? "/profile?mode=register"
      : next.startsWith("/profile")
        ? "/profile"
        : "/my-list";
  const target = new URL(fallback, requestUrl.origin);
  target.searchParams.set("auth_error", reason);
  return NextResponse.redirect(target);
}

/**
 * OAuth / magic-link return. Cookies must be set on the redirect response
 * (Supabase SSR pattern). Silent failures previously looked like "nothing happened".
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError =
    url.searchParams.get("error_description") ||
    url.searchParams.get("error");
  const next = safeNextPath(url.searchParams.get("next"));

  if (oauthError) {
    return redirectWithError(url, oauthError.slice(0, 180), next);
  }

  if (!code) {
    return redirectWithError(url, "missing_code", next);
  }

  const env = getPublicSupabaseEnv();
  const redirectResponse = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie"));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectWithError(url, error.message.slice(0, 180), next);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        is_premium: false,
        has_video_access: false,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

    try {
      const admin = getSupabaseAdmin();
      await admin.from("auth_login_events").insert({
        user_id: user.id,
        email: user.email ?? null,
        event_type: "login",
        user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
      });
    } catch {
      // Never block login if analytics insert fails.
    }
  }

  return redirectResponse;
}
