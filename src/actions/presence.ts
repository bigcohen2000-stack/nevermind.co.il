"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import {
  formatHeaderAuthLabel,
  formatHeaderClubLabel,
} from "@/lib/auth/header-session-shared";
import { readClubSession } from "@/lib/club/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PresencePingResult = { ok: true } | { ok: false; error: string };

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 40);
}

/**
 * Heartbeat from signed-in account or club session. Studio reads last_seen.
 */
export async function pingPresence(path?: string): Promise<PresencePingResult> {
  try {
    let kind: "auth" | "club" | null = null;
    let sessionKey = "";
    let displayLabel = "";
    let userId: string | null = null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      kind = "auth";
      userId = user.id;
      sessionKey = hashKey(`auth:${user.id}`);
      displayLabel =
        formatHeaderAuthLabel(user.email ?? user.phone ?? null) ?? "חשבון";
    } else {
      const club = await readClubSession();
      if (club?.phone) {
        kind = "club";
        sessionKey = hashKey(`club:${club.phone}`);
        displayLabel = formatHeaderClubLabel(club.phone) ?? "מועדון";
      }
    }

    if (!kind || !sessionKey) {
      return { ok: false, error: "not signed in" };
    }

    let safePath: string | null = null;
    if (typeof path === "string" && path.startsWith("/") && path.length < 200) {
      safePath = path;
    } else {
      try {
        const h = await headers();
        const referer = h.get("referer");
        if (referer) {
          const url = new URL(referer);
          safePath = url.pathname.slice(0, 200);
        }
      } catch {
        // ignore
      }
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from("site_presence").upsert(
      {
        session_key: sessionKey,
        kind,
        display_label: displayLabel,
        user_id: userId,
        path: safePath,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "session_key" },
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "presence failed",
    };
  }
}
