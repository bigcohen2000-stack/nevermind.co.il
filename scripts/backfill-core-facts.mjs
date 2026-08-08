/**
 * Backfill videos.core_facts via OpenAI for videos that already have transcripts.
 *
 * Usage:
 *   node scripts/backfill-core-facts.mjs
 *   node scripts/backfill-core-facts.mjs --limit=50 --concurrency=2
 *   node scripts/backfill-core-facts.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
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
const openaiKey = (env.OPENAI_API_KEY || "").trim();
const model = (env.OPENAI_CORE_FACTS_MODEL || "gpt-4o-mini").trim();
const limit = argNum("limit", 500);
const concurrency = Math.min(argNum("concurrency", 2), 4);
const dryRun = hasFlag("dry-run");

if (!url || !key || key.length < 20) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!openaiKey) {
  console.error("Need OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SYSTEM_PROMPT =
  "You extract only absolute logical facts from a Hebrew or English transcript. Strip emotion, story, metaphor, and persuasion. Return JSON only.";

const USER_PROMPT = `Extract only the absolute logical facts from this transcript, stripped of any emotion or story. Return as a JSON object with key "facts" whose value is an array of 3 to 5 short sentences.

Transcript:
`;

function parseFactsJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item === "string")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.facts)) {
      return parsed.facts
        .filter((item) => typeof item === "string")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } catch {
    /* fall through */
  }
  return [];
}

async function extractFacts(transcript) {
  const content = transcript.replace(/\s+/g, " ").trim();
  if (content.length < 40) {
    return { ok: false, error: "transcript too short" };
  }
  const truncated =
    content.length > 12000 ? `${content.slice(0, 12000)}...` : content;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${USER_PROMPT}${truncated}` },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `OpenAI ${res.status}: ${detail.slice(0, 200)}` };
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
  const facts = parseFactsJson(raw).slice(0, 5);
  if (facts.length < 1) {
    return { ok: false, error: "no usable facts" };
  }
  return { ok: true, facts };
}

async function loadCandidates(max) {
  const { data: videos, error } = await admin
    .from("videos")
    .select("id, title, core_facts")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(`list videos: ${error.message}`);

  const need = new Set(
    (videos ?? [])
      .filter((v) => !Array.isArray(v.core_facts) || v.core_facts.length === 0)
      .map((v) => v.id),
  );
  if (need.size === 0) return [];

  const { data: transcripts, error: tErr } = await admin
    .from("video_transcripts")
    .select("video_id, content");
  if (tErr) throw new Error(`list transcripts: ${tErr.message}`);

  const byId = new Map((videos ?? []).map((v) => [v.id, v]));
  const out = [];
  for (const row of transcripts ?? []) {
    if (!need.has(row.video_id)) continue;
    const content = (row.content || "").trim();
    if (content.length < 40) continue;
    const video = byId.get(row.video_id);
    if (!video) continue;
    out.push({ id: row.video_id, title: video.title || row.video_id, content });
    if (out.length >= max) break;
  }
  return out;
}

async function mapPool(items, size, fn) {
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

console.log("Core facts backfill");
console.log(`  model=${model} limit=${limit} concurrency=${concurrency} dryRun=${dryRun}`);

const candidates = await loadCandidates(limit);
console.log(`  candidates=${candidates.length}`);

if (dryRun || candidates.length === 0) {
  console.log(JSON.stringify({ ok: true, dryRun, candidates: candidates.length }));
  process.exit(0);
}

let ok = 0;
let failed = 0;
const errors = [];

await mapPool(candidates, concurrency, async (item, idx) => {
  try {
    const result = await extractFacts(item.content);
    if (!result.ok) {
      failed += 1;
      if (errors.length < 12) errors.push({ id: item.id, error: result.error });
      console.log(`FAIL  ${idx + 1}/${candidates.length} ${item.id}: ${result.error}`);
      return;
    }
    const { error } = await admin
      .from("videos")
      .update({ core_facts: result.facts })
      .eq("id", item.id);
    if (error) {
      failed += 1;
      if (errors.length < 12) errors.push({ id: item.id, error: error.message });
      console.log(`FAIL  ${idx + 1}/${candidates.length} ${item.id}: ${error.message}`);
      return;
    }
    ok += 1;
    console.log(`OK    ${idx + 1}/${candidates.length} ${item.id} (${result.facts.length} facts)`);
  } catch (err) {
    failed += 1;
    const msg = err instanceof Error ? err.message : String(err);
    if (errors.length < 12) errors.push({ id: item.id, error: msg });
    console.log(`FAIL  ${idx + 1}/${candidates.length} ${item.id}: ${msg}`);
  }
});

console.log(JSON.stringify({ ok, failed, total: candidates.length, errors }, null, 2));
process.exit(failed > 0 && ok === 0 ? 1 : 0);
