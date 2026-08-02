"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import type { BannerSlot } from "@/lib/studio/banners-shared";
import { BANNER_SLOTS } from "@/lib/studio/banners-shared";
import type { SiteBanner } from "@/types/supabase";

export type StudioBannerActionResult =
  | { ok: true; banner?: SiteBanner; message?: string }
  | { ok: false; error: string };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function isValidSlot(slot: string): slot is BannerSlot {
  return (BANNER_SLOTS as readonly string[]).includes(slot);
}

export async function upsertBanner(input: {
  id?: string;
  slot: BannerSlot;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<StudioBannerActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "חסר כותרת." };
  }
  if (!isValidSlot(input.slot)) {
    return { ok: false, error: "מיקום לא תקין." };
  }

  const now = new Date().toISOString();
  const row = {
    slot: input.slot,
    title,
    body: input.body?.trim() ?? "",
    cta_label: input.ctaLabel?.trim() || null,
    cta_href: input.ctaHref?.trim() || null,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? false,
    updated_at: now,
  };

  try {
    const admin = getSupabaseAdmin();

    if (input.id?.trim()) {
      const bannerId = input.id.trim();
      if (!isUuid(bannerId)) {
        return { ok: false, error: "מזהה לא תקין." };
      }

      if (row.is_active) {
        await admin
          .from("site_banners")
          .update({ is_active: false, updated_at: now })
          .eq("slot", row.slot)
          .neq("id", bannerId);
      }

      const { data, error } = await admin
        .from("site_banners")
        .update(row)
        .eq("id", bannerId)
        .select("*")
        .single();

      if (error || !data) {
        return {
          ok: false,
          error: error?.message ?? "עדכון הבאנר נכשל.",
        };
      }

      return { ok: true, banner: data as SiteBanner, message: "הבאנר עודכן." };
    }

    if (row.is_active) {
      await admin
        .from("site_banners")
        .update({ is_active: false, updated_at: now })
        .eq("slot", row.slot);
    }

    const { data, error } = await admin
      .from("site_banners")
      .insert(row)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "יצירת הבאנר נכשלה.",
      };
    }

    return { ok: true, banner: data as SiteBanner, message: "הבאנר נוצר." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function setBannerActive(
  id: string,
  active: boolean,
): Promise<StudioBannerActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const bannerId = id.trim();
  if (!isUuid(bannerId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: existing, error: fetchError } = await admin
      .from("site_banners")
      .select("*")
      .eq("id", bannerId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { ok: false, error: "הבאנר לא נמצא." };
    }

    const now = new Date().toISOString();

    if (active) {
      await admin
        .from("site_banners")
        .update({ is_active: false, updated_at: now })
        .eq("slot", existing.slot)
        .neq("id", bannerId);
    }

    const { data, error } = await admin
      .from("site_banners")
      .update({ is_active: active, updated_at: now })
      .eq("id", bannerId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: error?.message ?? "עדכון הבאנר נכשל.",
      };
    }

    return {
      ok: true,
      banner: data as SiteBanner,
      message: active ? "הבאנר הופעל." : "הבאנר הושבת.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export async function deleteBanner(
  id: string,
): Promise<StudioBannerActionResult> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return { ok: false, error: "Studio locked." };
  }

  const bannerId = id.trim();
  if (!isUuid(bannerId)) {
    return { ok: false, error: "מזהה לא תקין." };
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("site_banners")
      .delete()
      .eq("id", bannerId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, message: "הבאנר נמחק." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
