/**
 * Link investigation tags to videos when the name appears in title/description.
 * Usage: node scripts/link-investigation-tags.mjs
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

const env = { ...loadEnv(".env.local"), ...process.env };
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ""),
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: tags, error: tagErr } = await admin
  .from("concepts")
  .select("id, name")
  .eq("category", "investigation");

if (tagErr || !tags?.length) {
  console.error("No investigation tags:", tagErr?.message);
  process.exit(1);
}

const pageSize = 500;
let from = 0;
let linked = 0;
let scanned = 0;

for (;;) {
  const { data: videos, error } = await admin
    .from("videos")
    .select("id, title, description")
    .range(from, from + pageSize - 1);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const rows = videos ?? [];
  if (rows.length === 0) break;

  for (const video of rows) {
    scanned += 1;
    const hay = `${video.title || ""}\n${video.description || ""}`;
    for (const tag of tags) {
      if (!hay.includes(tag.name)) continue;
      const { error: linkErr } = await admin.from("video_concepts").upsert(
        {
          video_id: video.id,
          concept_id: tag.id,
          start_timestamp: null,
        },
        { onConflict: "video_id,concept_id" },
      );
      if (!linkErr) linked += 1;
    }
  }

  if (rows.length < pageSize) break;
  from += pageSize;
}

console.log(JSON.stringify({ ok: true, scanned, linked, tags: tags.length }, null, 2));
