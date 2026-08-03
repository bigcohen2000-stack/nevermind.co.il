/**
 * Import creator-hearted comments from CSV into video_featured_comments.
 *
 * Usage:
 *   node scripts/import-featured-comments.mjs --file=supabase/imports/featured-comments-seeds.csv
 *
 * CSV columns: youtube_id,author_name,body,timestamp_seconds,sort_order,is_creator_hearted
 * Lines starting with # are ignored.
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

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];

  function splitCsvLine(line) {
    const cols = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === "," && !inQuotes) {
        cols.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  }

  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const obj = {};
    header.forEach((h, i) => {
      let v = cols[i] ?? "";
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      obj[h] = v.trim();
    });
    rows.push(obj);
  }
  return rows;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const filePath =
  fileArg?.slice("--file=".length) ||
  "supabase/imports/featured-comments-seeds.csv";

if (!url || !key) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!existsSync(filePath)) {
  console.error(`Missing file: ${filePath}`);
  console.error(
    "Copy supabase/imports/featured-comments-seeds.template.csv → featured-comments-seeds.csv and paste rows.",
  );
  process.exit(2);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const parsed = parseCsv(readFileSync(filePath, "utf8"));
if (parsed.length === 0) {
  console.error("No data rows in CSV.");
  process.exit(2);
}

const youtubeIds = [...new Set(parsed.map((r) => r.youtube_id).filter(Boolean))];
const { data: videos, error: vErr } = await admin
  .from("videos")
  .select("id, youtube_id")
  .in("youtube_id", youtubeIds);

if (vErr) {
  console.error(vErr.message);
  process.exit(1);
}

const idByYt = new Map((videos ?? []).map((v) => [v.youtube_id, v.id]));
let inserted = 0;
const missing = [];

for (const row of parsed) {
  const videoId = idByYt.get(row.youtube_id);
  if (!videoId) {
    missing.push(row.youtube_id);
    continue;
  }
  const body = (row.body || "").trim();
  if (!body) continue;

  const payload = {
    video_id: videoId,
    author_name: row.author_name?.trim() || null,
    body,
    timestamp_seconds: row.timestamp_seconds
      ? Number(row.timestamp_seconds)
      : null,
    sort_order: row.sort_order ? Number(row.sort_order) : 0,
    is_creator_hearted:
      String(row.is_creator_hearted || "true").toLowerCase() !== "false",
  };

  const { error } = await admin.from("video_featured_comments").insert(payload);
  if (error) {
    console.error(`insert ${row.youtube_id}:`, error.message);
    process.exit(1);
  }
  inserted += 1;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      inserted,
      missingYoutubeIds: [...new Set(missing)],
    },
    null,
    2,
  ),
);
