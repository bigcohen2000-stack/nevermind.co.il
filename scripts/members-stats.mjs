#!/usr/bin/env node
/**
 * Print live /members library stats + schema checks.
 *
 *   npm run members:stats
 *
 * Needs .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function count(label, builder) {
  const { count, error } = await builder;
  if (error) {
    return { label, count: null, error: error.message };
  }
  return { label, count: count ?? 0, error: null };
}

const probe = await admin
  .from("profiles")
  .select("id, has_video_access, is_premium")
  .limit(1);

const hasVideoAccessOk = !probe.error;
const schemaError = probe.error?.message ?? null;

const rows = await Promise.all([
  count(
    "total_videos",
    admin.from("videos").select("*", { count: "exact", head: true }),
  ),
  count(
    "club_videos",
    admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .or("is_gated.eq.true,is_unlisted.eq.true"),
  ),
  count(
    "public_videos",
    admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("is_gated", false)
      .eq("is_unlisted", false),
  ),
  count(
    "concepts",
    admin.from("concepts").select("*", { count: "exact", head: true }),
  ),
  hasVideoAccessOk
    ? count(
        "members_with_access",
        admin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("has_video_access", true),
      )
    : Promise.resolve({
        label: "members_with_access",
        count: null,
        error: "column missing",
      }),
]);

console.log("project:", url);
console.log("");
console.log(
  "has_video_access:",
  hasVideoAccessOk ? "OK" : `MISSING (${schemaError})`,
);
console.log("");
for (const row of rows) {
  if (row.error) {
    console.log(`${row.label}: ERROR ${row.error}`);
  } else {
    console.log(`${row.label}: ${row.count}`);
  }
}

if (!hasVideoAccessOk) {
  console.log("");
  console.log("Fix: In THIS Supabase project SQL Editor, run:");
  console.log(
    "  alter table public.profiles add column if not exists has_video_access boolean not null default false;",
  );
  process.exit(2);
}

process.exit(0);
