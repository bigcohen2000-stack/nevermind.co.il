import "server-only";

import { cookies } from "next/headers";

import { resolveVideoEntitlement } from "@/lib/club/access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const INVERT_TOOL = "invert" as const;
export const FREE_INVERT_QUOTA_PER_MONTH = 5;
export const TOOL_SUBJECT_COOKIE = "nm_tool_sid";

export type ToolSubject = {
  subjectKey: string;
  userId: string | null;
  setCookie: string | null;
};

export type ToolQuotaStatus = {
  entitled: boolean;
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  subjectKey: string;
  userId: string | null;
};

function monthStartIso(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
  ).toISOString();
}

function randomSubjectId(): string {
  return `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * Resolve quota subject: authenticated user id, else sticky anon cookie.
 */
export async function resolveToolSubject(): Promise<ToolSubject> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return {
        subjectKey: `user:${user.id}`,
        userId: user.id,
        setCookie: null,
      };
    }
  } catch {
    // fall through to anon
  }

  const jar = await cookies();
  const existing = jar.get(TOOL_SUBJECT_COOKIE)?.value?.trim();
  if (existing) {
    return {
      subjectKey: `anon:${existing}`,
      userId: null,
      setCookie: null,
    };
  }

  const fresh = randomSubjectId();
  return {
    subjectKey: `anon:${fresh}`,
    userId: null,
    setCookie: fresh,
  };
}

export async function getInvertQuotaStatus(
  subject?: ToolSubject,
): Promise<ToolQuotaStatus> {
  const resolved = subject ?? (await resolveToolSubject());
  const entitlement = await resolveVideoEntitlement().catch(() => null);
  const unlimited = Boolean(
    entitlement && (entitlement.entitled || entitlement.hasVideoAccess),
  );

  if (unlimited) {
    return {
      entitled: true,
      unlimited: true,
      used: 0,
      limit: FREE_INVERT_QUOTA_PER_MONTH,
      remaining: FREE_INVERT_QUOTA_PER_MONTH,
      subjectKey: resolved.subjectKey,
      userId: resolved.userId,
    };
  }

  let used = 0;
  try {
    const admin = getSupabaseAdmin();
    const { count } = await admin
      .from("tool_usage_events")
      .select("id", { count: "exact", head: true })
      .eq("tool", INVERT_TOOL)
      .eq("subject_key", resolved.subjectKey)
      .gte("created_at", monthStartIso());
    used = count ?? 0;
  } catch {
    used = 0;
  }

  const remaining = Math.max(0, FREE_INVERT_QUOTA_PER_MONTH - used);
  return {
    entitled: false,
    unlimited: false,
    used,
    limit: FREE_INVERT_QUOTA_PER_MONTH,
    remaining,
    subjectKey: resolved.subjectKey,
    userId: resolved.userId,
  };
}

export type ConsumeQuotaResult =
  | { ok: true; status: ToolQuotaStatus }
  | { ok: false; status: ToolQuotaStatus; reason: "quota_exceeded" };

/**
 * Club / has_video_access: unlimited.
 * Others: consume one monthly invert credit when under limit.
 */
export async function consumeInvertQuota(
  subject?: ToolSubject,
): Promise<ConsumeQuotaResult> {
  const resolved = subject ?? (await resolveToolSubject());
  const status = await getInvertQuotaStatus(resolved);
  if (status.unlimited) {
    return { ok: true, status };
  }
  if (status.remaining <= 0) {
    return { ok: false, status, reason: "quota_exceeded" };
  }

  try {
    const admin = getSupabaseAdmin();
    await admin.from("tool_usage_events").insert({
      tool: INVERT_TOOL,
      user_id: status.userId,
      subject_key: status.subjectKey,
    });
  } catch {
    // Soft-fail open if table missing so search is not bricked pre-migration.
    return { ok: true, status };
  }

  return {
    ok: true,
    status: {
      ...status,
      used: status.used + 1,
      remaining: Math.max(0, status.remaining - 1),
    },
  };
}
