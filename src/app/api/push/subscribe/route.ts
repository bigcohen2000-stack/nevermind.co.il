import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  notify_live: z.boolean().optional(),
  notify_daily: z.boolean().optional(),
});

const prefsSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  notify_live: z.boolean().optional(),
  notify_daily: z.boolean().optional(),
});

/**
 * POST /api/push/subscribe
 * Body: PushSubscription JSON (+ optional notify_live / notify_daily).
 */
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return NextResponse.json(
      { error: "Push is not configured (missing VAPID public key)." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid PushSubscription", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { endpoint, keys, notify_live, notify_daily } = parsed.data;
  const userAgent = req.headers.get("user-agent")?.slice(0, 400) ?? null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const row: {
      endpoint: string;
      p256dh: string;
      auth: string;
      user_agent: string | null;
      user_id?: string | null;
      notify_live?: boolean;
      notify_daily?: boolean;
    } = {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent,
    };

    if (user?.id) row.user_id = user.id;
    if (typeof notify_live === "boolean") row.notify_live = notify_live;
    if (typeof notify_daily === "boolean") row.notify_daily = notify_daily;

    const { error } = await supabase.from("subscribers").upsert(row, {
      onConflict: "endpoint",
    });

    if (error) {
      // Prefs columns may be missing until migration 36. Retry without them.
      if (
        typeof notify_live === "boolean" ||
        typeof notify_daily === "boolean" ||
        user?.id
      ) {
        const { error: bareError } = await supabase.from("subscribers").upsert(
          {
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            user_agent: userAgent,
          },
          { onConflict: "endpoint" },
        );
        if (!bareError) {
          return NextResponse.json({
            ok: true,
            warning: "prefs_columns_missing",
          });
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Subscribe failed",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/push/subscribe
 * Update notify_live / notify_daily for an existing endpoint.
 * Requires PushSubscription keys so callers must prove ownership.
 */
export async function PATCH(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = prefsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid prefs", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { endpoint, keys, notify_live, notify_daily } = parsed.data;
  if (typeof notify_live !== "boolean" && typeof notify_daily !== "boolean") {
    return NextResponse.json(
      { error: "notify_live or notify_daily required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Service role only to verify ownership keys (no public SELECT on subscribers).
    const admin = getSupabaseAdmin();
    const { data: existing, error: loadError } = await admin
      .from("subscribers")
      .select("endpoint, p256dh, auth")
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    if (existing.p256dh !== keys.p256dh || existing.auth !== keys.auth) {
      return NextResponse.json({ error: "Subscription keys mismatch" }, { status: 403 });
    }

    const patch: {
      notify_live?: boolean;
      notify_daily?: boolean;
      user_id?: string;
    } = {};
    if (typeof notify_live === "boolean") patch.notify_live = notify_live;
    if (typeof notify_daily === "boolean") patch.notify_daily = notify_daily;
    if (user?.id) patch.user_id = user.id;

    const { error } = await admin
      .from("subscribers")
      .update(patch)
      .eq("endpoint", endpoint);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Prefs update failed",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Body: { endpoint: string }
 */
export async function DELETE(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint =
    json && typeof json === "object" && "endpoint" in json
      ? String((json as { endpoint: unknown }).endpoint ?? "")
      : "";

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("subscribers")
      .delete()
      .eq("endpoint", endpoint);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unsubscribe failed",
      },
      { status: 500 },
    );
  }
}
