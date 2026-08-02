"use server";

import { Resend } from "resend";
import { z } from "zod";

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
    .min(1, "נא למלא אימייל")
    .email("נא למלא אימייל תקין")
    .max(200, "האימייל ארוך מדי"),
  // Contact form may join interest + message. Cap high enough, then truncate.
  context: z.string().trim().max(2000).optional().default(""),
  source: z.string().trim().max(80).optional().default("site"),
});

export type BookingLeadInput = z.infer<typeof bookingSchema>;

export type SubmitBookingResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Sends a booking lead email to the admin via Resend.
 */
export async function submitBookingLead(
  input: BookingLeadInput,
): Promise<SubmitBookingResult> {
  try {
    const parsed = bookingSchema.safeParse({
      ...input,
      // Soft-trim oversized context before Zod so users do not see a hard fail.
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

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "NeverMinde <onboarding@resend.dev>";

    if (!apiKey || !adminEmail) {
      return {
        ok: false,
        error:
          "שליחת המייל לא מוגדרת כרגע. נסה וואטסאפ או SMS, או חזור מאוחר יותר.",
      };
    }

    const { name, phone, email, context, source } = parsed.data;
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: email,
      subject: context
        ? `בקשת תיאום: ${context.slice(0, 80)}`
        : "בקשת תיאום חדשה מ-nevermind.co.il",
      text: [
        "ליד חדש מהאתר.",
        "",
        `שם: ${name}`,
        `טלפון: ${phone}`,
        `אימייל: ${email}`,
        `הקשר: ${context || "(ללא)"}`,
        `מקור: ${source}`,
        "",
        `התקבל: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    if (error) {
      return {
        ok: false,
        error: "שליחת המייל נכשלה. נסה שוב או השתמש בוואטסאפ.",
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? "שליחה נכשלה. נסה שוב בעוד רגע."
          : "שליחה נכשלה. נסה שוב בעוד רגע.",
    };
  }
}
