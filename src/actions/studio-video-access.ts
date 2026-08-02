"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

const inputSchema = z.object({
  userId: z.string().uuid(),
  enabled: z.boolean(),
});

export type SetStudioVideoAccessResult =
  | { ok: true; enabled: boolean }
  | { ok: false; error: string };

/**
 * Studio-only: toggle profiles.has_video_access for a signed-up user.
 * Service role bypasses RLS (users cannot self-grant).
 */
export async function setStudioVideoAccess(
  userId: string,
  enabled: boolean,
): Promise<SetStudioVideoAccessResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "Studio is locked." };
    }

    const parsed = inputSchema.safeParse({ userId, enabled });
    if (!parsed.success) {
      return { ok: false, error: "Invalid user id." };
    }

    const admin = getSupabaseAdmin();

    const { error } = await admin.from("profiles").upsert(
      {
        id: parsed.data.userId,
        has_video_access: parsed.data.enabled,
        // Keep legacy flag aligned for older readers.
        is_premium: parsed.data.enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/studio/users");
    return { ok: true, enabled: parsed.data.enabled };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
