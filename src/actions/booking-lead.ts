"use server";

import { Resend } from "resend";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "נא למלא שם")
    .max(120, "השם ארוך מדי"),
  phone: z
    .string()
    .trim()
    .min(5, "נא למלא מספר טלפון תקין")
    .max(40, "מספר הטלפון ארוך מדי"),
  email: z
    .string()
    .trim()
    .max(200, "האימייל ארוך מדי")
    .optional()
    .default("")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "נא למלא אימייל תקין",
    ),
  context: z.string().trim().max(2000).optional().default(""),
  source: z.string().trim().max(80).optional().default("site"),
});

/** Placeholder when WhatsApp/SMS lead has no email (column is NOT NULL). */
function emailForLead(email: string, phone: string): string {
  if (email) return email;
  const digits = phone.replace(/\D/g, "").slice(-12) || "unknown";
  return `wa-${digits}@lead.nevermind.internal`;
}

export type BookingLeadInput = z.infer<typeof bookingSchema>;

export type SubmitBookingResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Persists a booking/contact lead to Supabase for Studio, then emails via Resend when configured.
 */
export async function submitBookingLead(
  input: BookingLeadInput,
): Promise<SubmitBookingResult> {
  try {
    const parsed = bookingSchema.safeParse({
      ...input,
      context:
        typeof input.context === "string"
          ? input.context.trim().slice(0, 2000)
          : input.context,
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "הפרטים לא תקינים",
      };
    }

    const { name, phone, email, context, source } = parsed.data;
    const leadEmail = emailForLead(email, phone);

    let saved = false;
    try {
      const admin = getSupabaseAdmin();
      const { error: dbError } = await admin.from("booking_leads").insert({
        name,
        phone,
        email: leadEmail,
        context: context || "",
        source: source || "site",
        status: "new",
      });
      if (!dbError) saved = true;
    } catch {
      // Table missing until migration 33, or admin key absent.
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "NeverMinde <onboarding@resend.dev>";

    let emailed = false;
    if (apiKey && adminEmail) {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        replyTo: email || undefined,
        subject: context
          ? `בקשת תיאום: ${context.slice(0, 80)}`
          : "בקשת תיאום חדשה מ-nevermind.co.il",
        text: [
          "ליד חדש מהאתר.",
          "",
          `שם: ${name}`,
          `טלפון: ${phone}`,
          `אימייל: ${email || "(לא סופק, ערוץ וואטסאפ/SMS)"}`,
          `הקשר: ${context || "(ללא)"}`,
          `מקור: ${source}`,
          "",
          `התקבל: ${new Date().toISOString()}`,
        ].join("\n"),
      });
      if (!error) emailed = true;
    }

    if (saved || emailed) {
      return { ok: true };
    }

    return {
      ok: false,
      error:
        "הפנייה לא נשמרה כרגע. נסה וואטסאפ או SMS, או חזור מאוחר יותר.",
    };
  } catch {
    return {
      ok: false,
      error: "שליחה נכשלה. נסה שוב בעוד רגע.",
    };
  }
}
