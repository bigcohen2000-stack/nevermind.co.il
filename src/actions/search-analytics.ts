"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const SEARCH_SESSION_COOKIE = "nm_search_sid";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 365;
const FEEDBACK_LOOKBACK_MS = 60 * 60 * 2 * 1000; // 2 hours

export type LogSearchResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type SubmitSearchFeedbackResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const feedbackSchema = z.object({
  searchQuery: z.string().trim().min(1).max(300),
  analyticsId: z.string().uuid().optional(),
  userFeedback: z.boolean(),
  feedbackNote: z.string().trim().max(500).optional(),
});

/**
 * Persist a search event. Safe to fire-and-forget from the client.
 * Authenticated → user_id. Anonymous → stable session cookie.
 * Returns the row id so the UI can attach quality feedback later.
 */
export async function logSearchQuery(
  query: string,
  resultsCount: number,
): Promise<LogSearchResult> {
  try {
    const searchQuery = query?.trim() ?? "";
    if (!searchQuery) {
      return { ok: false, error: "search_query is required" };
    }

    const count = Number.isFinite(resultsCount)
      ? Math.max(0, Math.floor(resultsCount))
      : 0;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let sessionId: string | null = null;
    if (!user) {
      sessionId = await getOrCreateAnonymousSessionId();
    }

    const id = randomUUID();

    const { error } = await supabase.from("search_analytics").insert({
      id,
      search_query: searchQuery,
      user_id: user?.id ?? null,
      session_id: sessionId,
      results_count: count,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const PAGE_VIEW_LOOKBACK_MS = 5 * 60 * 1000; // 5 minutes

/**
 * After /search renders real result counts: update the recent own row
 * (from hero suggest log) or insert a new one. Returns the analytics id
 * for SearchQualityFeedback.
 */
export async function finalizeSearchPageAnalytics(
  query: string,
  resultsCount: number,
): Promise<LogSearchResult> {
  try {
    const searchQuery = query?.trim() ?? "";
    if (!searchQuery) {
      return { ok: false, error: "search_query is required" };
    }

    const count = Number.isFinite(resultsCount)
      ? Math.max(0, Math.floor(resultsCount))
      : 0;

    const identity = await resolveSearchIdentity();
    const admin = getSupabaseAdmin();
    const since = new Date(Date.now() - PAGE_VIEW_LOOKBACK_MS).toISOString();

    let recentQuery = admin
      .from("search_analytics")
      .select("id")
      .eq("search_query", searchQuery)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);

    if (identity.userId) {
      recentQuery = recentQuery.eq("user_id", identity.userId);
    } else if (identity.sessionId) {
      recentQuery = recentQuery.eq("session_id", identity.sessionId);
    } else {
      return { ok: false, error: "No search identity" };
    }

    const { data: recent } = await recentQuery.maybeSingle();

    if (recent?.id) {
      const { error: updateError } = await admin
        .from("search_analytics")
        .update({ results_count: count })
        .eq("id", recent.id);

      if (updateError) {
        return { ok: false, error: updateError.message };
      }
      return { ok: true, id: recent.id };
    }

    const id = randomUUID();
    const { error: insertError } = await admin.from("search_analytics").insert({
      id,
      search_query: searchQuery,
      user_id: identity.userId,
      session_id: identity.userId ? null : identity.sessionId,
      results_count: count,
    });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Update user_feedback (and optional note) on the matching search_analytics row.
 * Prefer analyticsId from the client log. Otherwise resolve the latest own row
 * for this query within the lookback window (create one if missing).
 */
export async function submitSearchFeedback(input: {
  searchQuery: string;
  analyticsId?: string;
  userFeedback: boolean;
  feedbackNote?: string;
}): Promise<SubmitSearchFeedbackResult> {
  try {
    const parsed = feedbackSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid feedback",
      };
    }

    const { searchQuery, analyticsId, userFeedback } = parsed.data;
    const feedbackNote =
      userFeedback === false
        ? (parsed.data.feedbackNote?.trim() || null)
        : null;

    const identity = await resolveSearchIdentity();
    const admin = getSupabaseAdmin();

    let rowId = analyticsId ?? null;

    if (rowId) {
      const { data: existing, error: loadError } = await admin
        .from("search_analytics")
        .select("id, user_id, session_id, search_query")
        .eq("id", rowId)
        .maybeSingle();

      if (loadError) {
        return { ok: false, error: loadError.message };
      }

      if (
        !existing ||
        !ownsSearchRow(existing, identity) ||
        existing.search_query.trim() !== searchQuery
      ) {
        rowId = null;
      }
    }

    if (!rowId) {
      rowId = await findRecentOwnSearchId(admin, searchQuery, identity);
    }

    if (!rowId) {
      const { data: created, error: insertError } = await admin
        .from("search_analytics")
        .insert({
          search_query: searchQuery,
          user_id: identity.userId,
          session_id: identity.userId ? null : identity.sessionId,
          results_count: 0,
          user_feedback: userFeedback,
          feedback_note: feedbackNote,
        })
        .select("id")
        .single();

      if (insertError || !created?.id) {
        return {
          ok: false,
          error: insertError?.message ?? "Could not create search record",
        };
      }
      return { ok: true, id: created.id };
    }

    const { error: updateError } = await admin
      .from("search_analytics")
      .update({
        user_feedback: userFeedback,
        feedback_note: feedbackNote,
      })
      .eq("id", rowId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    return { ok: true, id: rowId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

type SearchIdentity = {
  userId: string | null;
  sessionId: string | null;
};

type SearchRowOwner = {
  user_id: string | null;
  session_id: string | null;
};

function ownsSearchRow(row: SearchRowOwner, identity: SearchIdentity): boolean {
  if (identity.userId && row.user_id === identity.userId) return true;
  if (
    !identity.userId &&
    identity.sessionId &&
    row.session_id === identity.sessionId
  ) {
    return true;
  }
  return false;
}

async function resolveSearchIdentity(): Promise<SearchIdentity> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { userId: user.id, sessionId: null };
  }

  return {
    userId: null,
    sessionId: await getOrCreateAnonymousSessionId(),
  };
}

async function findRecentOwnSearchId(
  admin: ReturnType<typeof getSupabaseAdmin>,
  searchQuery: string,
  identity: SearchIdentity,
): Promise<string | null> {
  const since = new Date(Date.now() - FEEDBACK_LOOKBACK_MS).toISOString();

  let q = admin
    .from("search_analytics")
    .select("id")
    .eq("search_query", searchQuery)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1);

  if (identity.userId) {
    q = q.eq("user_id", identity.userId);
  } else if (identity.sessionId) {
    q = q.eq("session_id", identity.sessionId);
  } else {
    return null;
  }

  const { data, error } = await q.maybeSingle();
  if (error || !data?.id) return null;
  return data.id;
}

async function getOrCreateAnonymousSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SEARCH_SESSION_COOKIE)?.value?.trim();
  if (existing) return existing;

  const sessionId = randomUUID();
  try {
    jar.set(SEARCH_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
  } catch {
    // Cookie may be read-only in some Server Component contexts.
  }
  return sessionId;
}
