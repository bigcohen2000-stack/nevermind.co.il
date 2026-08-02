import "server-only";

import { hashClubFeedToken } from "@/lib/club/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ClubFeedAuth = {
  tokenId: string;
  phone: string;
};

/**
 * Validate a raw personal feed token against club_feed_tokens + club_members.
 * Touches last_used_at on success (best-effort).
 */
export async function authenticateClubFeedToken(
  rawToken: string | null | undefined,
): Promise<ClubFeedAuth | null> {
  const raw = (rawToken ?? "").trim();
  if (raw.length < 16) return null;

  try {
    const tokenHash = hashClubFeedToken(raw);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_feed_tokens")
      .select("id, phone, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !data || data.revoked_at) return null;

    const { data: member } = await admin
      .from("club_members")
      .select("phone")
      .eq("phone", data.phone)
      .maybeSingle();

    if (!member?.phone) return null;

    void admin
      .from("club_feed_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);

    return { tokenId: data.id, phone: data.phone };
  } catch {
    return null;
  }
}

export function extractFeedTokenFromRequest(req: Request): string | null {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("token")?.trim();
  if (fromQuery) return fromQuery;

  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim() || null;
  }
  return null;
}
