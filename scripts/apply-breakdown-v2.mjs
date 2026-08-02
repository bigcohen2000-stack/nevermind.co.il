/**
 * Apply breakdown L1-4 constraint + set club seeds to archive_shards.
 * Prefers DATABASE_URL / DIRECT_URL if present. Otherwise prints SQL path.
 *
 * Usage:
 *   node scripts/apply-breakdown-v2.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const dbUrl = env.DATABASE_URL || env.DIRECT_URL || "";
const sqlPath = resolve(
  "supabase/imports/apply_breakdown_v2_and_seed_levels.sql",
);

const clubSeeds = [
  "mlBIRDAVZNM",
  "Kxx_Sh84zVY",
  "Oc82GRQPjOc",
  "7kCUlOdqwQs",
  "2C3Bcj_-taE",
];

async function tryPg() {
  if (!dbUrl) return false;
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const sql = readFileSync(sqlPath, "utf8");
  await client.query(sql);
  await client.end();
  console.log("Applied via DATABASE_URL:", sqlPath);
  return true;
}

async function tryRestUpdate() {
  if (!url || !key) {
    console.error("Need Supabase URL + service role");
    process.exit(1);
  }
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin
    .from("videos")
    .update({ breakdown_level: "archive_shards" })
    .in("youtube_id", clubSeeds);

  if (error) {
    console.error("REST update failed (constraint likely missing archive_shards):");
    console.error(error.message);
    console.error("\nPaste and run this file in Supabase SQL Editor:");
    console.error(`  ${sqlPath}`);
    const ref = url.split("//")[1]?.split(".")[0];
    if (ref) {
      console.error(
        `  https://supabase.com/dashboard/project/${ref}/sql/new`,
      );
    }
    process.exit(2);
  }

  const { data } = await admin
    .from("videos")
    .select("youtube_id, breakdown_level, is_gated, is_unlisted")
    .in("youtube_id", clubSeeds);
  console.log(JSON.stringify({ ok: true, rows: data }, null, 2));
}

const viaPg = await tryPg().catch((err) => {
  console.warn("DATABASE_URL apply failed:", err.message);
  return false;
});
if (!viaPg) await tryRestUpdate();
