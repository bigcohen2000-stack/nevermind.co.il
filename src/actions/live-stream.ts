"use server";

import { revalidatePath } from "next/cache";

import { normalizeYoutubeLiveUrl } from "@/lib/live/youtube-url";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LiveActionResult =
  | { ok: true; message?: string; youtubeUrl?: string }
  | { ok: false; error: string };

function revalidateLivePaths() {
  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/studio");
}

/**
 * Studio: save URL/topic and set is_live = true.
 */
export async function startLiveStream(input: {
  youtubeUrl: string;
  topic?: string;
}): Promise<LiveActionResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  const youtubeUrl = normalizeYoutubeLiveUrl(input.youtubeUrl);
  if (!youtubeUrl) {
    return {
      ok: false,
      error: "קישור YouTube לא תקין. השתמשו ב-youtube.com או youtu.be.",
    };
  }

  const topic = (input.topic ?? "").trim().slice(0, 300);
  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("live_stream_config").upsert(
      {
        id: 1,
        is_live: true,
        youtube_url: youtubeUrl,
        topic,
        started_at: now,
        updated_at: now,
      },
      { onConflict: "id" },
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateLivePaths();
    return { ok: true, message: "השידור פעיל. הקישור זמין ב-/live אחרי הרשמה ו-18+." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בשמירה.",
    };
  }
}

/**
 * Studio: end live (keeps last URL for next time).
 */
export async function endLiveStream(): Promise<LiveActionResult> {
  if (!(await isStudioAuthenticated())) {
    return { ok: false, error: "Studio session required." };
  }

  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("live_stream_config")
      .update({ is_live: false, updated_at: now })
      .eq("id", 1);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateLivePaths();
    return { ok: true, message: "השידור הסתיים." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בעדכון.",
    };
  }
}

/**
 * Signed-in user confirms 18+.
 */
export async function confirmLiveAge(): Promise<LiveActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "נדרשת התחברות." };
  }

  const now = new Date().toISOString();

  try {
    const admin = getSupabaseAdmin();

    const { data: existing } = await admin
      .from("profiles")
      .select("id, age_confirmed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await admin.from("profiles").insert({
        id: user.id,
        is_premium: false,
        has_video_access: false,
        age_confirmed_at: now,
        updated_at: now,
      });
      if (insertError) {
        return { ok: false, error: insertError.message };
      }
    } else if (!existing.age_confirmed_at) {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ age_confirmed_at: now, updated_at: now })
        .eq("id", user.id);
      if (updateError) {
        return { ok: false, error: updateError.message };
      }
    }

    revalidatePath("/live");
    return { ok: true, message: "אושר." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה באישור גיל.",
    };
  }
}

/**
 * Reveal unlisted live URL only when: stream is live, user signed in, age confirmed.
 */
export async function revealLiveStreamUrl(): Promise<LiveActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "נדרשת הרשמה חינם כדי לקבל את הקישור." };
  }

  try {
    const admin = getSupabaseAdmin();

    const [{ data: profile }, { data: live, error: liveError }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("age_confirmed_at")
          .eq("id", user.id)
          .maybeSingle(),
        admin
          .from("live_stream_config")
          .select("is_live, youtube_url")
          .eq("id", 1)
          .maybeSingle(),
      ]);

    if (liveError || !live) {
      return { ok: false, error: "אין שידור פעיל כרגע." };
    }

    if (!live.is_live || !live.youtube_url?.trim()) {
      return { ok: false, error: "אין שידור פעיל כרגע." };
    }

    if (!profile?.age_confirmed_at) {
      return { ok: false, error: "נדרש אישור גיל 18+." };
    }

    const youtubeUrl = normalizeYoutubeLiveUrl(live.youtube_url);
    if (!youtubeUrl) {
      return { ok: false, error: "קישור השידור אינו תקין. פנו לצוות." };
    }

    return { ok: true, youtubeUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בטעינת הקישור.",
    };
  }
}
