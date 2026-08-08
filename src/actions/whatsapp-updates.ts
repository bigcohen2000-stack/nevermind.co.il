"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

import {
  assertNewsletterRateLimit,
  recordNewsletterSignup,
} from "@/lib/auth/rate-limit";
import { normalizeClubPhone, maskClubPhone } from "@/lib/club/phone";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validatePhone } from "@/lib/forms/validators";

const schema = z.object({
  phone: z.string().trim().min(1, "חסר טלפון").max(40),
  source: z.string().trim().max(80).optional().default("site"),
});

export type WhatsAppUpdatesSubscribeResult =
  | {
      ok: true;
      status: "saved" | "reactivated";
      maskedPhone: string;
    }
  | {
      ok: false;
      code: "invalid" | "already_subscribed" | "rate_limited" | "save_failed";
      error: string;
    };

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

function resendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "NeverMinde <onboarding@resend.dev>"
  );
}

async function notifyAdminPhone(input: {
  phone: string;
  source: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
  if (!apiKey || !adminEmail) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: resendFromEmail(),
    to: [adminEmail],
    subject: "הרשמה לערוץ עדכונים בוואטסאפ",
    text: [
      "הרשמת טלפון לערוץ העדכונים.",
      "",
      `טלפון: ${input.phone}`,
      `מקור: ${input.source}`,
      "",
      `התקבל: ${new Date().toISOString()}`,
    ].join("\n"),
  });
}

/**
 * Save phone for WhatsApp updates community. Idempotent duplicate → X.
 */
export async function subscribeWhatsAppUpdates(input: {
  phone: string;
  source?: string;
}): Promise<WhatsAppUpdatesSubscribeResult> {
  try {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: "invalid",
        error: parsed.error.issues[0]?.message ?? "הטלפון לא תקין",
      };
    }

    const clientError = validatePhone(parsed.data.phone);
    if (clientError) {
      return { ok: false, code: "invalid", error: clientError };
    }

    const phone = normalizeClubPhone(parsed.data.phone);
    if (!phone) {
      return {
        ok: false,
        code: "invalid",
        error: "נראה לא תקין. לדוגמה: 05xxxxxxxx.",
      };
    }

    const source = parsed.data.source || "site";
    const headerList = await headers();
    const ip = clientIp(headerList);
    const limitKeys = [
      `wa-updates:ip:${ip}`,
      `wa-updates:phone:${phone}`,
    ];
    const limited = assertNewsletterRateLimit(limitKeys);
    if (!limited.ok) {
      return {
        ok: false,
        code: "rate_limited",
        error: limited.error,
      };
    }

    const admin = getSupabaseAdmin();
    const { error: insertError } = await admin
      .from("whatsapp_update_subscribers")
      .insert({
        phone,
        source,
        status: "active",
      });

    if (!insertError) {
      recordNewsletterSignup(limitKeys);
      try {
        await notifyAdminPhone({ phone, source });
      } catch {
        /* optional */
      }
      return {
        ok: true,
        status: "saved",
        maskedPhone: maskClubPhone(phone),
      };
    }

    const msg = insertError.message?.toLowerCase() ?? "";
    const isDuplicate =
      msg.includes("duplicate") ||
      msg.includes("unique") ||
      insertError.code === "23505";

    if (!isDuplicate) {
      return {
        ok: false,
        code: "save_failed",
        error: "ההרשמה לא נשמרה כרגע. נסו שוב מאוחר יותר.",
      };
    }

    const { data: existing, error: fetchError } = await admin
      .from("whatsapp_update_subscribers")
      .select("status")
      .eq("phone", phone)
      .maybeSingle();

    if (fetchError || !existing) {
      return {
        ok: false,
        code: "save_failed",
        error: "ההרשמה לא נשמרה כרגע. נסו שוב מאוחר יותר.",
      };
    }

    if (existing.status === "active") {
      return {
        ok: false,
        code: "already_subscribed",
        error: "המספר כבר רשום במערכת לערוץ העדכונים.",
      };
    }

    const { error: updateError } = await admin
      .from("whatsapp_update_subscribers")
      .update({
        status: "active",
        unsubscribed_at: null,
        source,
      })
      .eq("phone", phone);

    if (updateError) {
      return {
        ok: false,
        code: "save_failed",
        error: "ההרשמה לא נשמרה כרגע. נסו שוב מאוחר יותר.",
      };
    }

    recordNewsletterSignup(limitKeys);
    try {
      await notifyAdminPhone({ phone, source });
    } catch {
      /* optional */
    }

    return {
      ok: true,
      status: "reactivated",
      maskedPhone: maskClubPhone(phone),
    };
  } catch {
    return {
      ok: false,
      code: "save_failed",
      error: "שליחה נכשלה. נסו שוב בעוד רגע.",
    };
  }
}
