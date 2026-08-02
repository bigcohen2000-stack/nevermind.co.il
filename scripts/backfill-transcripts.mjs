/**
 * Efficient transcript backfill — NO YouTube Data API quota.
 * Uses youtube-transcript captions + Supabase service role.
 *
 * Usage:
 *   node scripts/backfill-transcripts.mjs
 *   node scripts/backfill-transcripts.mjs --limit=40 --concurrency=3
 *   node scripts/backfill-transcripts.mjs --refresh-segments --limit=40
 *
 * Default: skips videos that already have a transcript row.
 * --refresh-segments: also re-fetch rows whose segments array is empty.
 * Does not call OpenAI (core_facts deferred).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { YoutubeTranscript } from "youtube-transcript";

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

function argNum(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const n = Number(hit.slice(name.length + 3));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const limit = argNum("limit", 40);
const concurrency = Math.min(argNum("concurrency", 3), 5);
const refreshSegments = hasFlag("refresh-segments");

if (!url || !key || key.length < 20) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function segmentsEmpty(raw) {
  return !Array.isArray(raw) || raw.length === 0;
}

async function fetchCandidates(max) {
  const { data: videos, error } = await admin
    .from("videos")
    .select("id, youtube_id, title")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) throw new Error(`list videos: ${error.message}`);

  const { data: existing, error: tErr } = await admin
    .from("video_transcripts")
    .select("video_id, segments");

  if (tErr) throw new Error(`list transcripts: ${tErr.message}`);

  const byVideo = new Map((existing ?? []).map((r) => [r.video_id, r]));
  const out = [];

  for (const video of videos ?? []) {
    if (out.length >= max) break;
    const row = byVideo.get(video.id);
    if (!row) {
      out.push(video);
      continue;
    }
    if (refreshSegments && segmentsEmpty(row.segments)) {
      out.push(video);
    }
  }

  return out;
}

async function upsertOne(video) {
  const youtubeId = video.youtube_id;
  try {
    const raw = await YoutubeTranscript.fetchTranscript(youtubeId);
    const segments = raw
      .map((segment) => ({
        offsetMs: Math.max(0, Math.round(Number(segment.offset) || 0)),
        durationMs: Math.max(0, Math.round(Number(segment.duration) || 0)),
        text: (segment.text ?? "").replace(/\s+/g, " ").trim(),
      }))
      .filter((segment) => segment.text.length > 0);

    const content = segments
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!content) {
      return { ok: false, youtubeId, error: "empty captions" };
    }

    let { error } = await admin.from("video_transcripts").upsert(
      { video_id: video.id, content, segments },
      { onConflict: "video_id" },
    );

    // If segments column missing (migration 11 not applied), content-only.
    if (error && /segments/i.test(error.message)) {
      ({ error } = await admin.from("video_transcripts").upsert(
        { video_id: video.id, content },
        { onConflict: "video_id" },
      ));
    }

    if (error) {
      return { ok: false, youtubeId, error: error.message };
    }
    return {
      ok: true,
      youtubeId,
      chars: content.length,
      segments: segments.length,
    };
  } catch (err) {
    return {
      ok: false,
      youtubeId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function mapPool(items, size, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
      await sleep(150);
    }
  }
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results;
}

console.log("Transcript backfill (no YouTube Data API quota)");
console.log(
  `  limit=${limit} concurrency=${concurrency} refreshSegments=${refreshSegments}`,
);

const missing = await fetchCandidates(limit);
console.log(`  candidates this run: ${missing.length}`);

if (missing.length === 0) {
  console.log(
    refreshSegments
      ? "Nothing to do (no missing transcripts / empty segments)."
      : "Nothing to do. Tip: --refresh-segments fills empty segments arrays.",
  );
  process.exit(0);
}

const started = Date.now();
let ok = 0;
let fail = 0;

await mapPool(missing, concurrency, async (video, idx) => {
  const r = await upsertOne(video);
  if (r.ok) {
    ok += 1;
    console.log(
      `  [${idx + 1}/${missing.length}] OK ${r.youtubeId} (${r.chars} chars, ${r.segments} segments)`,
    );
  } else {
    fail += 1;
    console.log(`  [${idx + 1}/${missing.length}] SKIP ${r.youtubeId}: ${r.error}`);
  }
  return r;
});

const { count } = await admin
  .from("video_transcripts")
  .select("*", { count: "exact", head: true });

console.log(
  JSON.stringify(
    {
      ok,
      fail,
      attempted: missing.length,
      transcriptsNow: count ?? null,
      elapsedMs: Date.now() - started,
      hint:
        fail > 0
          ? "Some videos have no captions (normal). Re-run to continue."
          : refreshSegments
            ? "Re-run with --refresh-segments until candidates=0."
            : "Re-run until candidates=0, or add --refresh-segments.",
    },
    null,
    2,
  ),
);
