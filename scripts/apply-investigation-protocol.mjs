/**
 * Apply-check + backfill for investigation protocol (migration 24).
 *
 * 1) Probes videos.breakdown_level / club_teaser_*
 * 2) If missing: prints SQL Editor link and exits 2 (DDL must be run in Dashboard)
 * 3) If present: fills null breakdown_level from title/description/gate flags
 *    and sets concepts.category = 'investigation' for curated tags
 *
 * Usage:
 *   node scripts/apply-investigation-protocol.mjs
 *   node scripts/apply-investigation-protocol.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const INVESTIGATION_TAGS = [
  "משמעות עודפת",
  "הפרדה",
  "היגיון מינימלי",
  "תכלית הקיום",
  "היפוך מחשבה",
  "צורה מול מהות",
  "סוד הגלוי",
];

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

function inferBreakdownLevel(row) {
  const haystack = `${row.title || ""}\n${row.description || ""}`.toLowerCase();

  // Level 4 intent: club / unlisted. Until migration 25 is applied on the
  // live DB, archive_shards is rejected by check constraint — use unfiltered
  // as the writable stand-in, then run:
  //   supabase/imports/apply_breakdown_v2_and_seed_levels.sql
  if (
    row.is_unlisted ||
    row.is_gated ||
    haystack.includes("לא רשום") ||
    haystack.includes("ללא פילטר") ||
    haystack.includes("מועדון") ||
    haystack.includes("הפירוק הגולמי")
  ) {
    return process.env.BREAKDOWN_ALLOW_ARCHIVE_SHARDS === "1"
      ? "archive_shards"
      : "unfiltered";
  }

  if (
    haystack.includes("אין-הבדל") ||
    haystack.includes("אין הבדל") ||
    haystack.includes("אין הבדלים") ||
    haystack.includes("מהות המציאות") ||
    haystack.includes("בחירה חופשית")
  ) {
    return "no_difference";
  }

  if (
    haystack.includes("פודקאסט") ||
    haystack.includes("podcast") ||
    haystack.includes("שיחת עומק") ||
    haystack.includes("שיחות עומק") ||
    haystack.includes("לייב ארוך")
  ) {
    return "unfiltered";
  }

  return "primary";
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const dryRun = process.argv.includes("--dry-run");

if (!url || !key) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ref = url.split("//")[1]?.split(".")[0] || "YOUR_PROJECT";
const sqlEditor = `https://supabase.com/dashboard/project/${ref}/sql/new`;

console.log("project:", url);
if (dryRun) console.log("mode: dry-run");

const probe = await admin
  .from("videos")
  .select("id, breakdown_level, club_teaser_label, club_teaser_href")
  .limit(1);

if (probe.error) {
  console.error("\nCOLUMNS MISSING on this project.");
  console.error("Error:", probe.error.message);
  console.error("\nOpen SQL Editor for EXACTLY this project:");
  console.error(`  ${sqlEditor}`);
  console.error(
    "\nPaste and run: supabase/migrations/24_investigation_protocol.sql",
  );
  console.error("Then re-run: node scripts/apply-investigation-protocol.mjs\n");
  process.exit(2);
}

console.log("columns: present");

const pageSize = 500;
let scanned = 0;
let updated = 0;
const byLevel = {
  primary: 0,
  no_difference: 0,
  unfiltered: 0,
  archive_shards: 0,
};

for (;;) {
  // Always take the first page of remaining nulls (updates shrink the set).
  const { data, error } = await admin
    .from("videos")
    .select("id, title, description, is_unlisted, is_gated, breakdown_level")
    .is("breakdown_level", null)
    .range(0, pageSize - 1);

  if (error) {
    console.error("fetch failed:", error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  if (rows.length === 0) break;

  for (const row of rows) {
    scanned += 1;
    const level = inferBreakdownLevel(row);
    byLevel[level] += 1;
    if (dryRun) continue;
    const { error: upErr } = await admin
      .from("videos")
      .update({ breakdown_level: level })
      .eq("id", row.id);
    if (upErr) {
      console.error(`update ${row.id}:`, upErr.message);
      process.exit(1);
    }
    updated += 1;
  }

  if (dryRun) break;
  if (rows.length < pageSize) break;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      dryRun,
      nullBreakdownScanned: scanned,
      updated,
      byLevel,
    },
    null,
    2,
  ),
);

let tagsUpserted = 0;
for (const name of INVESTIGATION_TAGS) {
  if (dryRun) {
    tagsUpserted += 1;
    continue;
  }
  const { error } = await admin
    .from("concepts")
    .upsert({ name, category: "investigation" }, { onConflict: "name" });
  if (error) {
    console.error(`concept ${name}:`, error.message);
    continue;
  }
  tagsUpserted += 1;
}

console.log(`investigation tags upserted: ${tagsUpserted}/${INVESTIGATION_TAGS.length}`);
console.log("done");
