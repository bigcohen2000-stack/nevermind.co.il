import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = {};
for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  )
    v = v.slice(1, -1);
  env[t.slice(0, i).trim()] = v;
}
const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const probes = [
  ["31", "profiles?select=theme&limit=1"],
  ["32", "live_video_likes?select=user_id&limit=1"],
  ["32", "live_video_requests?select=id&limit=1"],
  ["33", "booking_leads?select=id&limit=1"],
  ["33", "pre_meeting_leads?select=status&limit=1"],
  ["34", "user_meetings?select=status,confirmation_token,confirmed_at&limit=1"],
  ["30", "studio_quotes?select=id&limit=1"],
  ["30", "site_banners?select=id&limit=1"],
  ["29", "live_stream_config?select=id,is_live&limit=1"],
  ["29", "profiles?select=age_confirmed_at&limit=1"],
  ["28", "profiles?select=watch_time_seconds&limit=1"],
  ["28", "videos?select=teaser_youtube_id&limit=1"],
  ["27", "club_feed_tokens?select=id&limit=1"],
  ["26", "video_featured_comments?select=id&limit=1"],
  ["25", "videos?select=breakdown_level&limit=1"],
  ["24", "club_members?select=phone&limit=1"],
  ["23", "site_presence?select=session_key&limit=1"],
  ["21", "single_video_leads?select=id&limit=1"],
  ["14", "profiles?select=has_video_access&limit=1"],
];

for (const [mig, path] of probes) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers });
  const body = await res.text();
  const short = path.split("?")[0];
  const msg = res.ok
    ? "OK"
    : (JSON.parse(body).message || body).toString().slice(0, 100);
  console.log(`${res.ok ? "PASS" : "FAIL"}  mig=${mig}  ${short}  ${msg}`);
}
