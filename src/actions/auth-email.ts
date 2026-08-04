"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  assertMagicLinkRateLimit,
  recordMagicLinkSend,
} from "@/lib/auth/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type SendMagicLinkResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const schema = z.object({
  email: z.string().trim().email().max(254),
  nextPath: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v.startsWith("/") && !v.startsWith("//"), {
      message: "nextPath invalid",
    }),
  intent: z.enum(["login", "register"]).optional(),
});

function clientIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 80);
  }
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 80);
  return "unknown";
}

function siteOrigin(headerList: Headers): string {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "https";
  if (host) {
    const hostname = host.split(":")[0] ?? host;
    if (
      hostname.endsWith("nevermind.co.il") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  return envSite || "https://nevermind.co.il";
}

/**
 * Email magic-link sign-in / register with IP + email rate limits.
 */
export async function sendMagicLink(input: {
  email: string;
  nextPath: string;
  intent?: "login" | "register";
}): Promise<SendMagicLinkResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "כתובת אימייל לא תקינה." };
  }

  const email = parsed.data.email.toLowerCase();
  const nextPath =
    parsed.data.intent === "register" ? "/welcome" : parsed.data.nextPath;

  const headerList = await headers();
  const ip = clientIp(headerList);
  const limitKeys = [`ip:${ip}`, `email:${email}`];
  const limited = assertMagicLinkRateLimit(limitKeys);
  if (!limited.ok) return limited;

  try {
    const supabase = await createClient();
    const origin = siteOrigin(headerList);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        ok: false,
        error: error.message || "שליחת הקישור נכשלה. נסו שוב.",
      };
    }

    recordMagicLinkSend(limitKeys);
    return {
      ok: true,
      message:
        parsed.data.intent === "register"
          ? "נשלח קישור להשלמת הרשמה. בדקו את תיבת הדואר (גם ספאם)."
          : "נשלח קישור התחברות לאימייל. בדקו את תיבת הדואר (גם ספאם).",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שליחת הקישור נכשלה.",
    };
  }
}
