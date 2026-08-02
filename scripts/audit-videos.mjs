#!/usr/bin/env node
/**
 * Reconcile YouTube-discoverable videos vs Supabase `videos` rows.
 *
 *   npm run videos:audit
 *   npm run videos:audit -- --sample 40
 *
 * Quota (approx, one channel + a few playlists):
 *   channels.list (1) + playlistItems pages for uploads (~ceil(n/50))
 *   + optional playlist pages for env playlists
 *   + videos.list only for a small missing-ID sample (not the full set)
 *
 * Needs .env.local:
 *   YOUTUBE_API_KEY, YOUTUBE_CHANNEL_IDS
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: YOUTUBE_PLAYLIST_IDS, GATED_PLAYLIST_IDS, YOUTUBE_UNLISTED_VIDEO_IDS
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

function splitCsv(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  if (!next || next.startsWith("-")) return fallback;
  return next;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const apiKey = env.YOUTUBE_API_KEY || "";
const channelIds = splitCsv(env.YOUTUBE_CHANNEL_IDS);
const envPlaylists = [
  ...splitCsv(env.YOUTUBE_PLAYLIST_IDS),
  ...splitCsv(env.GATED_PLAYLIST_IDS),
];
const unlistedIds = splitCsv(env.YOUTUBE_UNLISTED_VIDEO_IDS);
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
const sampleLimit = Math.max(1, Number(argValue("--sample", "30")) || 30);
const walkExtraPlaylists = !process.argv.includes("--uploads-only");

if (!apiKey) {
  console.error("Missing YOUTUBE_API_KEY in .env.local");
  process.exit(1);
}
if (channelIds.length === 0) {
  console.error("Missing YOUTUBE_CHANNEL_IDS in .env.local");
  process.exit(1);
}
if (!url || !serviceKey || serviceKey.length < 20) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ytGet(pathname, params) {
  const qs = new URLSearchParams({ ...params, key: apiKey });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${pathname}?${qs}`);
  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText;
    throw new Error(`${pathname}: ${msg}`);
  }
  return body;
}

/**
 * Walk playlistItems; return public+unlisted video IDs (skip private / empty).
 * Does not call videos.list (saves quota).
 */
async function collectPlaylistVideoIds(playlistId) {
  const ids = [];
  let pageToken = "";
  let pages = 0;
  let skippedPrivate = 0;
  let skippedEmpty = 0;

  do {
    const params = {
      part: "contentDetails,status",
      playlistId,
      maxResults: "50",
    };
    if (pageToken) params.pageToken = pageToken;
    const data = await ytGet("playlistItems", params);
    pages += 1;
    for (const item of data.items || []) {
      const id =
        item.contentDetails?.videoId ||
        item.snippet?.resourceId?.videoId ||
        null;
      if (!id) {
        skippedEmpty += 1;
        continue;
      }
      if (item.status?.privacyStatus === "private") {
        skippedPrivate += 1;
        continue;
      }
      ids.push(id);
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return {
    playlistId,
    ids: [...new Set(ids)],
    pages,
    skippedPrivate,
    skippedEmpty,
  };
}

async function fetchAllDbYoutubeIds() {
  const ids = new Set();
  let from = 0;
  const pageSize = 1000;
  for (;;) {
    const { data, error } = await admin
      .from("videos")
      .select("youtube_id, is_gated, is_unlisted")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`supabase videos: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row.youtube_id) ids.add(row.youtube_id);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const [total, gated, unlisted, publicOpen] = await Promise.all([
    admin.from("videos").select("*", { count: "exact", head: true }),
    admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("is_gated", true),
    admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("is_unlisted", true),
    admin
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("is_gated", false)
      .eq("is_unlisted", false),
  ]);

  return {
    ids,
    counts: {
      total: total.count ?? ids.size,
      gated: gated.count ?? null,
      unlisted: unlisted.count ?? null,
      publicOpen: publicOpen.count ?? null,
      errors: [total.error, gated.error, unlisted.error, publicOpen.error]
        .filter(Boolean)
        .map((e) => e.message),
    },
  };
}

async function main() {
  console.log("videos:audit — YouTube vs Supabase\n");

  const db = await fetchAllDbYoutubeIds();
  console.log("Supabase videos:");
  console.log(`  total:       ${db.counts.total}`);
  console.log(`  publicOpen:  ${db.counts.publicOpen}`);
  console.log(`  is_gated:    ${db.counts.gated}`);
  console.log(`  is_unlisted: ${db.counts.unlisted}`);
  if (db.counts.errors.length) {
    console.log(`  errors: ${db.counts.errors.join("; ")}`);
  }

  const youtubeDiscoverable = new Set();
  const channelReports = [];

  for (const channelId of channelIds) {
    const ch = await ytGet("channels", {
      part: "snippet,statistics,contentDetails",
      id: channelId,
    });
    const item = ch.items?.[0];
    if (!item) {
      console.log(`\nChannel ${channelId}: NOT FOUND`);
      continue;
    }
    const title = item.snippet?.title || channelId;
    const videoCount = Number(item.statistics?.videoCount ?? NaN);
    const uploads = item.contentDetails?.relatedPlaylists?.uploads || null;

    console.log(`\nYouTube channel: ${title}`);
    console.log(`  channelId:            ${channelId}`);
    console.log(
      `  statistics.videoCount: ${Number.isFinite(videoCount) ? videoCount : "n/a"}`,
    );
    console.log(`  uploads playlist:     ${uploads || "MISSING"}`);
    console.log(
      "  note: videoCount is PUBLIC videos only (API key). Unlisted/private are NOT in this number.",
    );

    let uploadsReport = null;
    if (uploads) {
      uploadsReport = await collectPlaylistVideoIds(uploads);
      for (const id of uploadsReport.ids) youtubeDiscoverable.add(id);
      console.log(
        `  uploads playlist items (public+unlisted visible): ${uploadsReport.ids.length} (pages=${uploadsReport.pages}, skippedPrivate=${uploadsReport.skippedPrivate})`,
      );
    }

    channelReports.push({
      channelId,
      title,
      videoCount,
      uploads,
      uploadsItemCount: uploadsReport?.ids.length ?? null,
    });
  }

  const playlistReports = [];
  if (walkExtraPlaylists && envPlaylists.length > 0) {
    console.log(`\nEnv playlists (${envPlaylists.length}):`);
    for (const playlistId of envPlaylists) {
      try {
        const report = await collectPlaylistVideoIds(playlistId);
        for (const id of report.ids) youtubeDiscoverable.add(id);
        playlistReports.push(report);
        console.log(
          `  ${playlistId}: ${report.ids.length} ids (pages=${report.pages}, skippedPrivate=${report.skippedPrivate})`,
        );
      } catch (err) {
        console.log(
          `  ${playlistId}: ERROR ${err instanceof Error ? err.message : String(err)}`,
        );
        playlistReports.push({
          playlistId,
          ids: [],
          pages: 0,
          skippedPrivate: 0,
          skippedEmpty: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } else if (!walkExtraPlaylists) {
    console.log("\nEnv playlists: skipped (--uploads-only)");
  }

  for (const id of unlistedIds) youtubeDiscoverable.add(id);

  const missingFromDb = [...youtubeDiscoverable].filter((id) => !db.ids.has(id));
  const extraInDb = [...db.ids].filter((id) => !youtubeDiscoverable.has(id));

  const publicVideoCountSum = channelReports.reduce(
    (sum, r) => sum + (Number.isFinite(r.videoCount) ? r.videoCount : 0),
    0,
  );
  const uploadsSum = channelReports.reduce(
    (sum, r) => sum + (r.uploadsItemCount ?? 0),
    0,
  );

  console.log("\nReconciliation:");
  console.log(`  YT statistics.videoCount (public):     ${publicVideoCountSum}`);
  console.log(`  YT uploads playlist unique IDs:        ${uploadsSum}`);
  console.log(
    `  YT discoverable (uploads+env PLs+unlisted env): ${youtubeDiscoverable.size}`,
  );
  console.log(`  DB videos:                             ${db.counts.total}`);
  console.log(
    `  delta (discoverable - DB):              ${youtubeDiscoverable.size - db.counts.total}`,
  );
  console.log(
    `  in discoverable but NOT in DB:          ${missingFromDb.length}`,
  );
  console.log(
    `  in DB but NOT in this discoverable set: ${extraInDb.length}`,
  );

  if (missingFromDb.length > 0) {
    console.log(`\nMissing from DB (sample up to ${sampleLimit}):`);
    console.log(`  ${missingFromDb.slice(0, sampleLimit).join(", ")}`);
  }

  if (extraInDb.length > 0) {
    console.log(
      `\nIn DB only (sample up to ${sampleLimit}) — often older playlist/unlisted IDs not in current env sources:`,
    );
    console.log(`  ${extraInDb.slice(0, sampleLimit).join(", ")}`);
  }

  console.log("\nLikely gaps if Studio shows more than DB:");
  console.log(
    "  - Unlisted/private club videos: not in statistics.videoCount; need playlist IDs or YOUTUBE_UNLISTED_VIDEO_IDS",
  );
  console.log(
    "  - Unlisted/private playlists: invisible to API key unless you paste GATED_PLAYLIST_IDS / YOUTUBE_PLAYLIST_IDS",
  );
  console.log("  - Private videos: never ingestible with API key");
  console.log("  - Deleted / 'Deleted video' tombstones: pruned on sync");
  console.log(
    "  - Shorts vs long-form: both count if public; Studio filters may differ from API videoCount",
  );

  console.log("\nNext commands:");
  console.log("  npm run videos:sync          # metadata sync (no transcripts)");
  console.log("  npm run transcripts:backfill # optional captions backfill");
  console.log("  npm run videos:audit         # re-run this audit");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
