"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

const statusSchema = z.enum(["new", "contacted", "closed"]);

async function requireStudio() {
  const ok = await isStudioAuthenticated();
  if (!ok) return { ok: false as const, error: "אין הרשאת Studio." };
  return { ok: true as const };
}

export async function updateBookingLeadStatus(input: {
  id: string;
  status: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(input.id);
  const status = statusSchema.safeParse(input.status);
  if (!id.success || !status.success) {
    return { ok: false, error: "פרטים לא תקינים." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("booking_leads")
      .update({ status: status.data, updated_at: new Date().toISOString() })
      .eq("id", id.data);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/studio/leads");
    return { ok: true };
  } catch {
    return { ok: false, error: "עדכון נכשל." };
  }
}

export async function updatePreMeetingLeadStatus(input: {
  id: string;
  status: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireStudio();
  if (!gate.ok) return gate;

  const id = z.string().uuid().safeParse(input.id);
  const status = statusSchema.safeParse(input.status);
  if (!id.success || !status.success) {
    return { ok: false, error: "פרטים לא תקינים." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("pre_meeting_leads")
      .update({ status: status.data, updated_at: new Date().toISOString() })
      .eq("id", id.data);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/studio/leads");
    return { ok: true };
  } catch {
    return { ok: false, error: "עדכון נכשל. ודא שמיגרציה 33 הוחלה." };
  }
}
