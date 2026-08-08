"use server";

import { revalidatePath } from "next/cache";

import { resolveVideoEntitlement } from "@/lib/club/access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

export type ClubAssetPublic = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  contentType: string | null;
  byteSize: number | null;
};

export async function listPublishedClubAssets(): Promise<ClubAssetPublic[]> {
  try {
    const entitlement = await resolveVideoEntitlement();
    if (!entitlement.entitled && !entitlement.hasVideoAccess) return [];

    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_assets")
      .select(
        "id, title, description, file_name, content_type, byte_size, is_published, sort_order",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      fileName: row.file_name,
      contentType: row.content_type,
      byteSize: row.byte_size,
    }));
  } catch {
    return [];
  }
}

export async function createClubAssetDownloadUrl(
  assetId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const entitlement = await resolveVideoEntitlement();
    if (!entitlement.entitled && !entitlement.hasVideoAccess) {
      return { ok: false, error: "נדרשת גישת מועדון." };
    }

    const id = assetId.trim();
    if (!id) return { ok: false, error: "מזהה חסר." };

    const admin = getSupabaseAdmin();
    const { data: asset, error } = await admin
      .from("club_assets")
      .select("storage_path, is_published, file_name")
      .eq("id", id)
      .maybeSingle();

    if (error || !asset || !asset.is_published) {
      return { ok: false, error: "הקובץ לא נמצא." };
    }

    const { data: signed, error: signError } = await admin.storage
      .from("club-assets")
      .createSignedUrl(asset.storage_path, 120);

    if (signError || !signed?.signedUrl) {
      return { ok: false, error: "לא ניתן ליצור קישור הורדה." };
    }

    return { ok: true, url: signed.signedUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}

export type StudioClubAsset = ClubAssetPublic & {
  storagePath: string;
  isPublished: boolean;
  sortOrder: number;
};

export async function listStudioClubAssets(): Promise<StudioClubAsset[]> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_assets")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      fileName: row.file_name,
      contentType: row.content_type,
      byteSize: row.byte_size,
      storagePath: row.storage_path,
      isPublished: row.is_published,
      sortOrder: row.sort_order,
    }));
  } catch {
    return [];
  }
}

export async function upsertStudioClubAsset(input: {
  id?: string;
  title: string;
  description?: string;
  storagePath: string;
  fileName: string;
  contentType?: string;
  byteSize?: number;
  sortOrder?: number;
  isPublished?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) return { ok: false, error: "הסטודיו נעול." };

  const title = input.title.trim();
  const storagePath = input.storagePath.trim();
  const fileName = input.fileName.trim();
  if (!title || !storagePath || !fileName) {
    return { ok: false, error: "כותרת, נתיב ושם קובץ חובה." };
  }

  try {
    const admin = getSupabaseAdmin();
    const payload = {
      title,
      description: input.description?.trim() || null,
      storage_path: storagePath,
      file_name: fileName,
      content_type: input.contentType?.trim() || null,
      byte_size: input.byteSize ?? null,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? true,
    };

    if (input.id?.trim()) {
      const { error } = await admin
        .from("club_assets")
        .update(payload)
        .eq("id", input.id.trim());
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await admin.from("club_assets").insert(payload);
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/members/vault");
    revalidatePath("/studio");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאת שרת.",
    };
  }
}
