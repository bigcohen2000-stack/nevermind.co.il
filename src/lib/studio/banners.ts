import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SiteBanner } from "@/types/supabase";

export {
  BANNER_SLOTS,
  SLOT_LABELS,
  type BannerSlot,
} from "@/lib/studio/banners-shared";

export async function listStudioBanners(): Promise<SiteBanner[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("site_banners")
      .select("*")
      .order("slot", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as SiteBanner[];
  } catch {
    return [];
  }
}

/**
 * Public read via RLS (active rows). Falls back to admin if anon query fails.
 */
export async function getActiveBannerForSlot(
  slot: import("@/lib/studio/banners-shared").BannerSlot,
): Promise<SiteBanner | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_banners")
      .select("*")
      .eq("slot", slot)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data as SiteBanner;
  } catch {
    // Fall through to admin.
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("site_banners")
      .select("*")
      .eq("slot", slot)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as SiteBanner;
  } catch {
    return null;
  }
}
