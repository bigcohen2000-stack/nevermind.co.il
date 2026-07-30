import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/env";
import type { Database } from "@/types/supabase";

/**
 * Bypasses RLS. Use ONLY from protected API routes (e.g. /api/admin/sync).
 */
export function createAdminClient() {
  const env = getServerEnv();
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

/** Lazy singleton for sync routes. */
let adminSingleton: ReturnType<typeof createAdminClient> | null = null;

export function getSupabaseAdmin() {
  if (!adminSingleton) {
    adminSingleton = createAdminClient();
  }
  return adminSingleton;
}
