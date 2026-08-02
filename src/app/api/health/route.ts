import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight readiness probe for Vercel / uptime checks.
 * Does not expose secrets or row data.
 */
export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "ok";
  let dbError: string | null = null;

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("club_config").select("id").eq("id", 1).maybeSingle();
    if (error) {
      db = "error";
      dbError = error.message;
    }
  } catch (err) {
    db = "error";
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const ok = db === "ok";
  return NextResponse.json(
    {
      ok,
      service: "nevermind",
      db,
      ...(dbError && process.env.NODE_ENV !== "production"
        ? { dbError }
        : {}),
      ms: Date.now() - started,
    },
    { status: ok ? 200 : 503 },
  );
}
