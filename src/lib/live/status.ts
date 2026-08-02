import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type LivePublicStatus = {
  isLive: boolean;
  topic: string;
};

export type LiveStreamRow = {
  is_live: boolean;
  youtube_url: string;
  topic: string;
  started_at: string | null;
  updated_at: string;
};

const EMPTY_STATUS: LivePublicStatus = { isLive: false, topic: "" };

/**
 * Public-safe status: never includes youtube_url.
 */
export async function getLivePublicStatus(): Promise<LivePublicStatus> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("live_stream_config")
      .select("is_live, topic")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return EMPTY_STATUS;

    return {
      isLive: Boolean(data.is_live),
      topic: (data.topic ?? "").trim(),
    };
  } catch {
    return EMPTY_STATUS;
  }
}

/**
 * Studio / gated reveal: full row including URL (service role).
 */
export async function getLiveStreamRow(): Promise<LiveStreamRow | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("live_stream_config")
      .select("is_live, youtube_url, topic, started_at, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
