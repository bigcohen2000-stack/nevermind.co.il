/**
 * Align videos.is_gated / is_unlisted with the sync rule:
 *   is_unlisted = YouTube privacyStatus "unlisted" (when --refresh-privacy)
 *              OR youtube_id in YOUTUBE_UNLISTED_VIDEO_IDS
 *   is_gated    = true when is_unlisted
 *              OR title contains מועדון
 *              OR youtube_id in YOUTUBE_GATED_VIDEO_IDS
 *              OR playlist_id in GATED_PLAYLIST_IDS
 *   is_gated    = false otherwise (clears description-only false positives)
 *
 * Usage:
 *   npm run gated:backfill
 *   npm run gated:backfill -- --dry-run
 *   npm run gated:backfill -- --refresh-privacy
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * --refresh-privacy also needs YOUTUBE_API_KEY
 *
 * Note: channel uploads sync cannot list unlisted videos with an API key.
 * Put club playlist IDs in GATED_PLAYLIST_IDS (and/or YOUTUBE_PLAYLIST_IDS)
 * so unlisted items are ingested, then auto-gated.
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

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
const dryRun = process.argv.includes("--dry-run");
const refreshPrivacy = process.argv.includes("--refresh-privacy");

if (!url || !key || key.length < 20) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CLUB_TITLE = "מועדון";
const gatedVideoIds = new Set(splitCsv(env.YOUTUBE_GATED_VIDEO_IDS));
const gatedPlaylists = new Set(splitCsv(env.GATED_PLAYLIST_IDS));
const forcedUnlistedIds = new Set(splitCsv(env.YOUTUBE_UNLISTED_VIDEO_IDS));

function shouldGate(row) {
  if (gatedVideoIds.has(row.youtube_id)) return true;
  if (row.playlist_id && gatedPlaylists.has(row.playlist_id)) return true;
  if (row.is_unlisted) return true;
  if (forcedUnlistedIds.has(row.youtube_id)) return true;
  return (row.title ?? "").includes(CLUB_TITLE);
}

async function refreshUnlistedFromYoutube(videos) {
  const apiKey = env.YOUTUBE_API_KEY || "";
  if (!apiKey) {
    console.warn("skip privacy refresh: no YOUTUBE_API_KEY");
    return { updated: 0, unlistedNow: 0 };
  }

  let updated = 0;
  let unlistedNow = 0;
  const byId = new Map(videos.map((v) => [v.youtube_id, v]));

  for (const ids of chunk([...byId.keys()], 50)) {
    const qs = new URLSearchParams({
      part: "status",
      id: ids.join(","),
      key: apiKey,
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${qs}`,
    );
    if (!res.ok) {
      throw new Error(`YouTube videos.list ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    for (const item of json.items ?? []) {
      const id = item.id;
      const row = byId.get(id);
      if (!row) continue;
      const privacy = item.status?.privacyStatus;
      if (privacy === "private") continue;
      const isUnlisted =
        privacy === "unlisted" || forcedUnlistedIds.has(id);
      if (isUnlisted) unlistedNow += 1;
      if (Boolean(row.is_unlisted) === isUnlisted) continue;
      row.is_unlisted = isUnlisted;
      if (isUnlisted) row.is_gated = true;
      updated += 1;
      if (!dryRun) {
        const patch = isUnlisted
          ? { is_unlisted: true, is_gated: true }
          : { is_unlisted: false };
        const { error } = await admin
          .from("videos")
          .update(patch)
          .eq("id", row.id);
        if (error) throw new Error(`privacy update ${id}: ${error.message}`);
      }
    }
  }

  for (const id of forcedUnlistedIds) {
    const row = byId.get(id);
    if (!row || row.is_unlisted) continue;
    row.is_unlisted = true;
    row.is_gated = true;
    updated += 1;
    unlistedNow += 1;
    if (!dryRun) {
      const { error } = await admin
        .from("videos")
        .update({ is_unlisted: true, is_gated: true })
        .eq("id", row.id);
      if (error) throw new Error(`force unlisted ${id}: ${error.message}`);
    }
  }

  return { updated, unlistedNow };
}

async function main() {
  const { data: videos, error } = await admin
    .from("videos")
    .select(
      "id, youtube_id, title, description, playlist_id, is_unlisted, is_gated",
    );

  if (error) throw new Error(`list videos: ${error.message}`);
  const rows = videos ?? [];

  console.log(`videos total: ${rows.length}`);
  console.log(`env gated video ids: ${gatedVideoIds.size}`);
  console.log(`env gated playlists: ${gatedPlaylists.size}`);
  console.log(`env forced unlisted ids: ${forcedUnlistedIds.size}`);

  if (refreshPrivacy) {
    const privacy = await refreshUnlistedFromYoutube(rows);
    console.log(
      `privacy refresh: flipped is_unlisted on ${privacy.updated} (dry=${dryRun})`,
    );
    console.log(
      `unlisted seen in this YouTube page set: ${privacy.unlistedNow}`,
    );
  }

  const toForceUnlistedFlag = rows.filter(
    (v) => forcedUnlistedIds.has(v.youtube_id) && !v.is_unlisted,
  );

  const toGate = rows.filter((v) => shouldGate(v) && !v.is_gated);
  const toUngate = rows.filter((v) => !shouldGate(v) && v.is_gated);
  const alreadyCorrect = rows.filter(
    (v) => shouldGate(v) === Boolean(v.is_gated),
  ).length;

  console.log(`already correct gate: ${alreadyCorrect}`);
  console.log(`to mark gated: ${toGate.length}`);
  console.log(`to clear gated: ${toUngate.length}`);
  console.log(`to force is_unlisted (env ids): ${toForceUnlistedFlag.length}`);

  if (dryRun) {
    for (const v of toGate.slice(0, 20)) {
      console.log(
        `  would gate: ${v.youtube_id} | unlisted=${v.is_unlisted} | ${v.title}`,
      );
    }
    for (const v of toUngate.slice(0, 20)) {
      console.log(
        `  would ungate: ${v.youtube_id} | unlisted=${v.is_unlisted} | ${v.title}`,
      );
    }
    for (const v of toForceUnlistedFlag.slice(0, 20)) {
      console.log(`  would set unlisted: ${v.youtube_id} | ${v.title}`);
    }
    if (toGate.length > 20) console.log(`  ... +${toGate.length - 20} more gate`);
    if (toUngate.length > 20)
      console.log(`  ... +${toUngate.length - 20} more ungate`);
    console.log("dry-run: no writes");
    return;
  }

  if (toForceUnlistedFlag.length > 0) {
    const { error: unlistedErr } = await admin
      .from("videos")
      .update({ is_unlisted: true, is_gated: true })
      .in(
        "id",
        toForceUnlistedFlag.map((v) => v.id),
      );
    if (unlistedErr)
      throw new Error(`force unlisted update: ${unlistedErr.message}`);
    for (const v of toForceUnlistedFlag) {
      v.is_unlisted = true;
      v.is_gated = true;
    }
  }

  const toGateFinal = rows.filter((v) => shouldGate(v) && !v.is_gated);
  const toUngateFinal = rows.filter((v) => !shouldGate(v) && v.is_gated);

  if (toGateFinal.length > 0) {
    const { error: gateErr } = await admin
      .from("videos")
      .update({ is_gated: true })
      .in(
        "id",
        toGateFinal.map((v) => v.id),
      );
    if (gateErr) throw new Error(`gate update: ${gateErr.message}`);
  }

  if (toUngateFinal.length > 0) {
    const { error: ungateErr } = await admin
      .from("videos")
      .update({ is_gated: false })
      .in(
        "id",
        toUngateFinal.map((v) => v.id),
      );
    if (ungateErr) throw new Error(`ungate update: ${ungateErr.message}`);
  }

  // Safety net: any remaining is_unlisted without is_gated.
  const { error: syncUnlistedErr } = await admin
    .from("videos")
    .update({ is_gated: true })
    .eq("is_unlisted", true)
    .eq("is_gated", false);
  if (syncUnlistedErr)
    throw new Error(`unlisted→gated sync: ${syncUnlistedErr.message}`);

  const { count: gatedCount, error: countErr } = await admin
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("is_gated", true);
  if (countErr) throw new Error(`count gated: ${countErr.message}`);

  const { count: unlistedCount, error: unlistedCountErr } = await admin
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("is_unlisted", true);
  if (unlistedCountErr)
    throw new Error(`count unlisted: ${unlistedCountErr.message}`);

  console.log(`updated gate+: ${toGateFinal.length}`);
  console.log(`updated gate-: ${toUngateFinal.length}`);
  console.log(`forced unlisted+: ${toForceUnlistedFlag.length}`);
  console.log(`gated total now: ${gatedCount ?? "?"}`);
  console.log(`unlisted total now: ${unlistedCount ?? "?"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
