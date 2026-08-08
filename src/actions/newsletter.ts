"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

import {
  assertNewsletterRateLimit,
  recordNewsletterSignup,
} from "@/lib/auth/rate-limit";
import {
  resolveSubscribeOutcome,
  subscribeOutcomeIsSuccess,
} from "@/lib/newsletter/subscribe-result";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "נא למלא אימייל")
    .email("נא למלא אימייל תקין")
    .max(200, "האימייל ארוך מדי"),
  source: z.string().trim().max(80).optional().default("site"),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSchema>;

export type NewsletterSubscribeResult =
  | {
      ok: true;
      /** Fresh save or re-activate after unsubscribe. */
      status: "saved" | "reactivated";
    }
  | {
      ok: false;
      /** Client can render V/X by code. */
      code: "invalid" | "already_subscribed" | "rate_limited" | "save_failed";
      error: string;
    };

export type NewsletterUnsubscribeResult =
  | { ok: true; email?: string }
  | { ok: false; error: string };

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

function resendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>"
  );
}

async function notifyAdminNewSubscriber(input: {
  email: string;
  source: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
  if (!apiKey || !adminEmail) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: resendFromEmail(),
    to: [adminEmail],
    replyTo: input.email,
    subject: "הרשמה לעדכון במייל מ-nevermind.co.il",
    text: [
      "הרשמה חדשה לעדכון במייל.",
      "",
      `אימייל: ${input.email}`,
      `מקור: ${input.source}`,
      "",
      `התקבל: ${new Date().toISOString()}`,
    ].join("\n"),
  });
}

async function sendSubscriberConfirmation(input: {
  email: string;
  unsubscribeUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: resendFromEmail(),
    to: [input.email],
    subject: "נרשמת לעדכון במייל ב-NeverMind",
    text: [
      "שלום,",
      "",
      "נרשמת לעדכון במייל מאתר NeverMind (השם לא משנה).",
      "עדיין לא שולחים מיילים אוטומטיים. נעדכן כשיתחילו.",
      "",
      "לביטול הרשמה:",
      input.unsubscribeUrl,
      "",
      "NeverMind (nevermind.co.il)",
    ].join("\n"),
  });
}

/**
 * Saves an email to newsletter_subscribers. Success only when DB write succeeds.
 * Duplicate active emails count as success (idempotent).
 */
export async function subscribeNewsletter(
  input: NewsletterSubscribeInput,
): Promise<NewsletterSubscribeResult> {
  try {
    const parsed = newsletterSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: "invalid",
        error: parsed.error.issues[0]?.message ?? "האימייל לא תקין",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const source = parsed.data.source || "site";
    const headerList = await headers();
    const ip = clientIp(headerList);
    const limitKeys = [`newsletter:ip:${ip}`, `newsletter:email:${email}`];
    const limited = assertNewsletterRateLimit(limitKeys);
    if (!limited.ok) {
      return {
        ok: false,
        code: "rate_limited",
        error: limited.error,
      };
    }

    const admin = getSupabaseAdmin();
    const unsubscribeToken = randomUUID();
    let inserted = false;
    let duplicate = false;
    let wasUnsubscribed = false;
    let dbError: string | null = null;
    let tokenForEmail: string = unsubscribeToken;

    const { error: insertError } = await admin
      .from("newsletter_subscribers")
      .insert({
        email,
        source,
        status: "active",
        unsubscribe_token: unsubscribeToken,
      });

    if (!insertError) {
      inserted = true;
    } else {
      const msg = insertError.message?.toLowerCase() ?? "";
      const isDuplicate =
        msg.includes("duplicate") ||
        msg.includes("unique") ||
        insertError.code === "23505";

      if (isDuplicate) {
        duplicate = true;
        const { data: existing, error: fetchError } = await admin
          .from("newsletter_subscribers")
          .select("status, unsubscribe_token")
          .eq("email", email)
          .maybeSingle();

        if (fetchError || !existing) {
          dbError = fetchError?.message || "duplicate_lookup_failed";
        } else {
          wasUnsubscribed = existing.status === "unsubscribed";
          tokenForEmail = String(existing.unsubscribe_token);

          if (wasUnsubscribed) {
            const newToken = randomUUID();
            const { error: updateError } = await admin
              .from("newsletter_subscribers")
              .update({
                status: "active",
                unsubscribed_at: null,
                unsubscribe_token: newToken,
                source,
              })
              .eq("email", email);

            if (updateError) {
              dbError = updateError.message;
            } else {
              tokenForEmail = newToken;
            }
          }
        }
      } else {
        dbError = insertError.message || "insert_failed";
      }
    }

    const outcome = resolveSubscribeOutcome({
      inserted,
      duplicate,
      wasUnsubscribed,
      dbError,
    });

    if (!subscribeOutcomeIsSuccess(outcome)) {
      return {
        ok: false,
        code: "save_failed",
        error:
          "ההרשמה לא נשמרה כרגע. נסה שוב מאוחר יותר, או פנה בוואטסאפ.",
      };
    }

    if (outcome.kind === "already_active") {
      return {
        ok: false,
        code: "already_subscribed",
        error: "האימייל כבר רשום במערכת לעדכון במייל.",
      };
    }

    recordNewsletterSignup(limitKeys);

    const origin = siteOrigin(headerList);
    const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(tokenForEmail)}`;

    if (outcome.kind === "inserted" || outcome.kind === "reactivated") {
      try {
        await notifyAdminNewSubscriber({ email, source });
      } catch {
        // Admin notify is optional. DB save already succeeded.
      }
      try {
        await sendSubscriberConfirmation({ email, unsubscribeUrl });
      } catch {
        // Confirmation is optional when Resend is down.
      }
    }

    return {
      ok: true,
      status: outcome.kind === "reactivated" ? "reactivated" : "saved",
    };
  } catch {
    return {
      ok: false,
      code: "save_failed",
      error: "שליחה נכשלה. נסה שוב בעוד רגע.",
    };
  }
}

/** Unsubscribe by token from confirmation email or manual link. */
export async function unsubscribeNewsletter(
  token: string,
): Promise<NewsletterUnsubscribeResult> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length > 80) {
    return { ok: false, error: "קישור ביטול לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .select("email, status")
      .eq("unsubscribe_token", trimmed)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, error: "קישור ביטול לא נמצא או שפג תוקפו." };
    }

    if (data.status === "unsubscribed") {
      return { ok: true, email: data.email };
    }

    const { error: updateError } = await admin
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("unsubscribe_token", trimmed);

    if (updateError) {
      return {
        ok: false,
        error: "ביטול ההרשמה נכשל. נסו שוב או פנו בוואטסאפ.",
      };
    }

    return { ok: true, email: data.email };
  } catch {
    return {
      ok: false,
      error: "ביטול ההרשמה נכשל. נסו שוב בעוד רגע.",
    };
  }
}
