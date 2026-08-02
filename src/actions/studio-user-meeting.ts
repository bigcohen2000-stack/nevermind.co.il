"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

const inputSchema = z.object({
  userId: z.string().uuid(),
  heldAt: z.string().min(1),
  note: z.string().max(500).optional(),
});

export type RecordUserMeetingResult =
  | { ok: true; heldAt: string }
  | { ok: false; error: string };

/**
 * Studio-only: append a coaching meeting for a signed-up user.
 */
export async function recordUserMeeting(input: {
  userId: string;
  heldAt: string;
  note?: string;
}): Promise<RecordUserMeetingResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "הסטודיו נעול." };
    }

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "קלט לא תקין." };
    }

    const held = new Date(parsed.data.heldAt);
    if (Number.isNaN(held.getTime())) {
      return { ok: false, error: "תאריך לא תקין." };
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("user_meetings")
      .insert({
        user_id: parsed.data.userId,
        held_at: held.toISOString(),
        note: parsed.data.note?.trim() || null,
      })
      .select("held_at")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/studio/users");
    revalidatePath("/profile");
    return { ok: true, heldAt: data.held_at };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
