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

export type SetProfileAccessExpiryResult =
  | { ok: true }
  | { ok: false; error: string };

const expirySchema = z.object({
  userId: z.string().uuid(),
});

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

/**
 * Studio-only: set profiles.access_expires_at (null clears expiry).
 */
export async function setProfileAccessExpiry(
  userId: string,
  expiresAt: string | null,
): Promise<SetProfileAccessExpiryResult> {
  try {
    const unlocked = await isStudioAuthenticated();
    if (!unlocked) {
      return { ok: false, error: "הסטודיו נעול." };
    }

    let iso: string | null = null;
    if (expiresAt !== null && expiresAt.trim()) {
      const parsed = new Date(expiresAt.trim());
      if (Number.isNaN(parsed.getTime())) {
        return { ok: false, error: "תאריך לא תקין." };
      }
      iso = parsed.toISOString();
    }

    const validated = expirySchema.safeParse({ userId });
    if (!validated.success) {
      return { ok: false, error: "מזהה משתמש לא תקין." };
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("profiles")
      .update({
        access_expires_at: iso,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/studio/users");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
