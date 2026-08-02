/**
 * Backfill videos.published_at + duration_seconds from YouTube Data API.
 *
 * Usage:
 *   node scripts/backfill-video-meta.mjs
 *   node scripts/backfill-video-meta.mjs --dry-run
 *   node scripts/backfill-video-meta.mjs --limit 100
 *
 * Requires columns from supabase/migrations/20_video_publish_duration.sql
 * on the SAME project as NEXT_PUBLIC_SUPABASE_URL in .env.local.
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

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, size + i));
  return out;
}

function parseYoutubeDuration(iso) {
  if (!iso) return null;
  const m = String(iso).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!m) return null;
  const seconds =
    Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
  return seconds > 0 ? seconds : null;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const apiKey = env.YOUTUBE_API_KEY || "";
const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) || 0 : 0;

if (!url || !key || !apiKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("project:", url);

const probe = await admin
  .from("videos")
  .select("id, published_at, duration_seconds")
  .limit(1);

if (probe.error) {
  console.error("\nCOLUMNS MISSING on this project.");
  console.error("Error:", probe.error.message);
  const ref = url.split("//")[1]?.split(".")[0] || "YOUR_PROJECT";
  console.error("\nOpen SQL Editor for EXACTLY this project:");
  console.error(`  https://supabase.com/dashboard/project/${ref}/sql/new`);
  console.error("\nPaste and run supabase/migrations/20_video_publish_duration.sql");
  console.error("Then re-run: npm run videos:meta\n");
  process.exitCode = 2;
  process.exit(2);
}

let query = admin
  .from("videos")
  .select("id, youtube_id, published_at, duration_seconds")
  .not("youtube_id", "eq", "")
  .order("created_at", { ascending: false });

if (limit > 0) query = query.limit(limit);

const { data: videos, error: listError } = await query;
if (listError) {
  console.error(listError.message);
  process.exit(1);
}

const rows = (videos || []).filter(
  (v) => v.youtube_id && (!v.published_at || !v.duration_seconds),
);

console.log(`videos needing meta: ${rows.length} / ${(videos || []).length}`);

let updated = 0;
let failed = 0;

for (const batch of chunk(rows, 50)) {
  const ids = batch.map((v) => v.youtube_id).join(",");
  const qs = new URLSearchParams({
    part: "snippet,contentDetails",
    id: ids,
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${qs}`);
  if (!res.ok) {
    console.error("YouTube error", res.status, await res.text());
    failed += batch.length;
    continue;
  }
  const json = await res.json();
  const byId = new Map((json.items || []).map((item) => [item.id, item]));

  for (const row of batch) {
    const item = byId.get(row.youtube_id);
    if (!item) {
      failed += 1;
      continue;
    }
    const published_at = item.snippet?.publishedAt ?? null;
    const duration_seconds = parseYoutubeDuration(
      item.contentDetails?.duration,
    );
    if (!published_at && !duration_seconds) continue;
    if (dryRun) {
      updated += 1;
      continue;
    }
    const { error } = await admin
      .from("videos")
      .update({ published_at, duration_seconds })
      .eq("id", row.id);
    if (error) {
      console.error("update", row.youtube_id, error.message);
      failed += 1;
    } else {
      updated += 1;
    }
  }
}

console.log({ updated, failed, dryRun });
