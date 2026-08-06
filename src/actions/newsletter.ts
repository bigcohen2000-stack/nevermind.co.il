"use server";

import { Resend } from "resend";
import { z } from "zod";

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
  | { ok: true; alreadySubscribed?: boolean }
  | { ok: false; error: string };

/**
 * Saves an email to newsletter_subscribers and notifies admin via Resend when configured.
 * Duplicate emails count as success (idempotent).
 */
export async function subscribeNewsletter(
  input: NewsletterSubscribeInput,
): Promise<NewsletterSubscribeResult> {
  try {
    const parsed = newsletterSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "האימייל לא תקין",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const source = parsed.data.source || "site";

    let saved = false;
    let alreadySubscribed = false;

    try {
      const admin = getSupabaseAdmin();
      const { error: dbError } = await admin
        .from("newsletter_subscribers")
        .insert({ email, source });

      if (!dbError) {
        saved = true;
      } else {
        const msg = dbError.message?.toLowerCase() ?? "";
        if (
          msg.includes("duplicate") ||
          msg.includes("unique") ||
          dbError.code === "23505"
        ) {
          alreadySubscribed = true;
          saved = true;
        }
      }
    } catch {
      // Table missing until migration 38, or admin key absent.
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "NeverMinde <onboarding@resend.dev>";

    let emailed = false;
    if (apiKey && adminEmail && !alreadySubscribed) {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        replyTo: email,
        subject: "הרשמה לניוזלטר מ-nevermind.co.il",
        text: [
          "הרשמה חדשה לניוזלטר.",
          "",
          `אימייל: ${email}`,
          `מקור: ${source}`,
          "",
          `התקבל: ${new Date().toISOString()}`,
        ].join("\n"),
      });
      if (!error) emailed = true;
    }

    if (saved || emailed || alreadySubscribed) {
      return { ok: true, alreadySubscribed: alreadySubscribed || undefined };
    }

    return {
      ok: false,
      error:
        "ההרשמה לא נשמרה כרגע. נסה שוב מאוחר יותר, או פנה בוואטסאפ.",
    };
  } catch {
    return {
      ok: false,
      error: "שליחה נכשלה. נסה שוב בעוד רגע.",
    };
  }
}
