import { readFileSync, existsSync } from "node:fs";

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

const env = loadEnv(".env.local");
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";

const tables = [
  "videos",
  "concepts",
  "video_concepts",
  "video_transcripts",
  "search_analytics",
  "saved_videos",
  "video_progress",
  "watch_history",
  "pre_meeting_leads",
  "profiles",
  "subscribers",
];

async function probe(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });
  const ok = res.status === 200 || res.status === 206;
  return {
    table,
    ok,
    range: res.headers.get("content-range") || "",
    err: ok ? "" : (await res.text()).slice(0, 100),
  };
}

const results = [];
for (const t of tables) results.push(await probe(t));

const seg = await fetch(
  `${url}/rest/v1/video_transcripts?select=segments&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
const segmentsOk = seg.status === 200 || seg.status === 206;

const core = await fetch(
  `${url}/rest/v1/videos?select=core_facts&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
const coreOk = core.status === 200 || core.status === 206;

for (const r of results) {
  console.log(`${r.ok ? "OK  " : "MISS"} ${r.table} ${r.range} ${r.err}`);
}
console.log(`${segmentsOk ? "OK  " : "MISS"} video_transcripts.segments`);
console.log(`${coreOk ? "OK  " : "MISS"} videos.core_facts`);

const missing = results.filter((r) => !r.ok);
process.exit(missing.length || !segmentsOk ? 1 : 0);
