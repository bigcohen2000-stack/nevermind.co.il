#!/usr/bin/env node
/**
 * Schema validation on boot: verifies Supabase is reachable and `videos` exists.
 * Run: node scripts/check-schema.mjs
 * Exit 0 = OK (or mock mode / soft warn). Exit 1 = hard failure when STRICT_SCHEMA_CHECK=1.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const envPath = resolve(root, ".env.local");

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = loadDotEnv(envPath);
const get = (key) => process.env[key] || fileEnv[key] || "";

const mock = get("NEXT_PUBLIC_USE_MOCK_SEARCH") === "true";
const strict = get("STRICT_SCHEMA_CHECK") === "1";
const url = get("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const anon = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");

function fail(message) {
  console.error(`[schema] FAIL  ${message}`);
  if (strict) process.exitCode = 1;
  console.warn("[schema] Soft mode: continuing (set STRICT_SCHEMA_CHECK=1 to hard-fail).");
  process.exitCode = 0;
}

function ok(message) {
  console.log(`[schema] OK    ${message}`);
  process.exitCode = 0;
}

if (mock) {
  ok("NEXT_PUBLIC_USE_MOCK_SEARCH=true — skipping live schema check");
}

if (!existsSync(envPath)) {
  fail("Missing .env.local — copy from .env.example");
}

if (!url || !anon || url.includes("YOUR_") || anon.includes("your_")) {
  fail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const endpoint = `${url}/rest/v1/videos?select=id&limit=1`;

try {
  const res = await fetch(endpoint, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      Prefer: "count=exact",
    },
  });

  if (res.status === 404 || res.status === 406) {
    fail(
      `Table public.videos missing or inaccessible (HTTP ${res.status}). Run supabase/migrations/01_init.sql`,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    fail(`Supabase videos probe failed HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const range = res.headers.get("content-range");
  const countMatch = range?.match(/\/(\d+|\*)/);
  const count =
    countMatch && countMatch[1] !== "*" ? Number(countMatch[1]) : null;

  if (count === 0) {
    console.warn(
      "[schema] WARN  videos table exists but is empty — run POST /api/admin/sync to seed",
    );
  }

  ok(
    count == null
      ? "videos table reachable"
      : `videos table reachable (${count} rows)`,
  );
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}

process.exit();
