/**
 * Mark YouTube videos as unlisted + gated (club / members library).
 *
 * Public channel sync cannot see unlisted videos. Pass real youtube_ids
 * (CSV file, comma list, or one id per line). Does not invent IDs.
 *
 * Flow:
 *  1) Parse IDs from --file / --ids / positional args
 *  2) POST /api/admin/sync with { unlistedVideoIds } (upserts via videos.list)
 *     OR --db-only: set is_unlisted+is_gated on rows already in Supabase
 *
 * Usage:
 *   node scripts/mark-unlisted.mjs --ids VIDEO_ID_1,VIDEO_ID_2
 *   node scripts/mark-unlisted.mjs --file supabase/imports/unlisted-ids.csv
 *   node scripts/mark-unlisted.mjs --file ids.txt --dry-run
 *   node scripts/mark-unlisted.mjs --ids abc --db-only
 *   node scripts/mark-unlisted.mjs --ids abc --base-url http://localhost:3000
 *
 * Needs .env.local: CRON_SECRET (for sync), and for --db-only also
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * CSV: first column youtube_id (header optional). Lines starting with # ignored.
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
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function parseIdsFromText(text) {
  const ids = [];
  const seen = new Set();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const cells = line.split(/[,;\t ]+/).map((c) => c.trim()).filter(Boolean);
    for (const cell of cells) {
      if (cell.toLowerCase() === "youtube_id") continue;
      if (!YT_ID.test(cell)) continue;
      if (seen.has(cell)) continue;
      seen.add(cell);
      ids.push(cell);
    }
  }
  return ids;
}

function parseArgs(argv) {
  const out = {
    file: null,
    ids: [],
    dryRun: false,
    dbOnly: false,
    baseUrl: "http://localhost:3000",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--db-only") out.dbOnly = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a === "--ids") {
      out.ids.push(...parseIdsFromText((argv[++i] || "").replace(/,/g, "\n")));
    } else if (a === "--base-url") out.baseUrl = (argv[++i] || "").replace(/\/$/, "");
    else if (!a.startsWith("-")) {
      if (a.endsWith(".csv") || a.endsWith(".txt") || existsSync(a)) {
        out.file = a;
      } else {
        out.ids.push(...parseIdsFromText(a.replace(/,/g, "\n")));
      }
    }
  }
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const args = parseArgs(process.argv.slice(2));

let ids = [...args.ids];
if (args.file) {
  const path = resolve(args.file);
  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
  }
  ids.push(...parseIdsFromText(readFileSync(path, "utf8")));
}

ids = [...new Set(ids.filter((id) => YT_ID.test(id)))];

if (ids.length === 0) {
  console.error(`No valid 11-char youtube_ids found.

Usage:
  node scripts/mark-unlisted.mjs --ids VIDEO_ID_1,VIDEO_ID_2
  node scripts/mark-unlisted.mjs --file path/to/ids.csv
  node scripts/mark-unlisted.mjs --file ids.txt --dry-run
  node scripts/mark-unlisted.mjs --ids abc --db-only

Do not invent IDs. Export unlisted IDs from YouTube Studio or a private playlist.`);
  process.exit(1);
}

console.log(`ids: ${ids.length}`);
console.log(ids.map((id) => `  ${id}`).join("\n"));

if (args.dryRun) {
  console.log("dry-run: no writes / no sync");
  process.exit(0);
}

if (args.dbOnly) {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key || key.length < 20) {
    console.error(
      "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for --db-only",
    );
    process.exit(1);
  }
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error } = await admin
    .from("videos")
    .select("id, youtube_id, title, is_unlisted, is_gated")
    .in("youtube_id", ids);
  if (error) {
    console.error(`list: ${error.message}`);
    process.exit(1);
  }
  const rows = existing ?? [];
  const found = new Set(rows.map((r) => r.youtube_id));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length) {
    console.warn(
      `missing in DB (${missing.length}): use sync path instead of --db-only`,
    );
    console.warn(missing.map((id) => `  ${id}`).join("\n"));
  }
  if (rows.length === 0) {
    console.error("No matching rows in videos. Run without --db-only to upsert via sync.");
    process.exit(1);
  }

  const { error: updErr } = await admin
    .from("videos")
    .update({ is_unlisted: true, is_gated: true })
    .in(
      "id",
      rows.map((r) => r.id),
    );
  if (updErr) {
    console.error(`update: ${updErr.message}`);
    process.exit(1);
  }

  const { count: gatedCount } = await admin
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("is_gated", true);
  const { count: unlistedCount } = await admin
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("is_unlisted", true);

  console.log(`updated: ${rows.length}`);
  console.log(`gated total: ${gatedCount ?? "?"}`);
  console.log(`unlisted total: ${unlistedCount ?? "?"}`);
  process.exit(0);
}

const secret = env.CRON_SECRET;
if (!secret) {
  console.error("Need CRON_SECRET in .env.local to call /api/admin/sync");
  process.exit(1);
}

console.log(`POST ${args.baseUrl}/api/admin/sync (unlistedVideoIds=${ids.length})`);
try {
  const res = await fetch(`${args.baseUrl}/api/admin/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Skip full channel crawl: only upsert these unlisted / gated IDs.
      channelIds: [],
      playlistIds: [],
      unlistedVideoIds: ids,
      gatedVideoIds: ids,
      maxTranscriptFetches: 0,
    }),
  });
  const text = await res.text();
  console.log(`HTTP ${res.status}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error(
    `FETCH_FAIL: is the Next server up at ${args.baseUrl}?`,
    err instanceof Error ? err.message : err,
  );
  console.error("Tip: npm run dev, then re-run. Or use --db-only for existing rows.");
  process.exit(1);
}
