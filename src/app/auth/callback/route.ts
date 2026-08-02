import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/my-list";
  const next = nextRaw.startsWith("/") ? nextRaw : "/my-list";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Stub profile. Do not touch entitlement flags on conflict.
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            is_premium: false,
            has_video_access: false,
          },
          { onConflict: "id", ignoreDuplicates: true },
        );

        // Studio analytics: who logged in and when (service role).
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
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/my-list", url.origin));
}
