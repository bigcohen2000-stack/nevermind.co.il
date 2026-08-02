"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

import type { Database } from "@/types/supabase";

const logicFilterSchema = z.object({
  situationText: z
    .string()
    .trim()
    .min(10, "כתוב קצת יותר על המצב")
    .max(8000),
  objectiveFacts: z
    .string()
    .trim()
    .min(3, "הוסף לפחות עובדה אחת")
    .max(4000),
  subjectiveStory: z
    .string()
    .trim()
    .min(3, "הוסף לפחות פרשנות אחת")
    .max(4000),
  name: z.string().trim().min(1, "שם נדרש").max(120),
  phone: z.string().trim().min(5, "טלפון נדרש").max(40),
  email: z
    .string()
    .trim()
    .max(200)
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "אימייל לא תקין",
    )
    .optional()
    .default(""),
  source: z.string().trim().max(80).optional().default("booking-logic-filter"),
});

export type LogicFilterInput = z.infer<typeof logicFilterSchema>;

export type SubmitLogicFilterResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Saves Thought Deconstructor intake to Supabase and notifies admin via Resend.
 * Phone is required. Email is optional (WhatsApp / SMS are the primary channel).
 */
export async function submitLogicFilterLead(
  input: LogicFilterInput,
): Promise<SubmitLogicFilterResult> {
  try {
    const parsed = logicFilterSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }

    const {
      situationText,
      objectiveFacts,
      subjectiveStory,
      name,
      phone,
      email,
      source,
    } = parsed.data;
    const emailOrNull = email.trim() || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !serviceKey) {
      return {
        ok: false,
        error: "שמירה לא מוגדרת. חסרים מפתחות Supabase בשרת.",
      };
    }

    const supabase = createClient<Database>(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: dbError } = await supabase.from("pre_meeting_leads").insert({
      situation_text: situationText,
      objective_facts: objectiveFacts,
      subjective_story: subjectiveStory,
      name,
      phone,
      email: emailOrNull,
      source,
    });

    if (dbError) {
      return { ok: false, error: dbError.message };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL?.trim();
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "NeverMinde <onboarding@resend.dev>";

    // Phone / WhatsApp is primary for the user. Admin email notify is best-effort.
    if (apiKey && adminEmail) {
      const resend = new Resend(apiKey);
      const isDeconstructor =
        source === "thought-deconstructor" || source.startsWith("thought-");
      const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        ...(emailOrNull ? { replyTo: emailOrNull } : {}),
        subject: isDeconstructor
          ? `Thought Deconstructor: ${name} (${phone})`
          : `Logic Filter: ${name} (${phone})`,
        text: [
          isDeconstructor
            ? "Thought Deconstructor: פירוק מחשבה לפני פגישה"
            : "Pre-Meeting Logic Filter: הכנה לפגישה",
          "",
          `שם: ${name}`,
          `טלפון: ${phone}`,
          `אימייל: ${emailOrNull ?? "(לא צוין)"}`,
          `מקור: ${source}`,
          "",
          "--- המצב והמחשבה ---",
          situationText,
          "",
          "--- עובדות אובייקטיביות ---",
          objectiveFacts,
          "",
          "--- הסיפור שלי והפרשנות ---",
          subjectiveStory,
          "",
          `Received: ${new Date().toISOString()}`,
        ].join("\n"),
      });

      if (emailError) {
        // Lead is already saved. Do not fail the user on notify issues.
        console.error("logic-filter-lead notify failed:", emailError.message);
      }
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
