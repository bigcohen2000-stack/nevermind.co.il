#!/usr/bin/env node
/**
 * Quick env readiness check. Run: node scripts/check-env.mjs
 * Does not print secret values.
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

const requiredBrowse = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const requiredSync = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "YOUTUBE_API_KEY",
  "CRON_SECRET",
];
const recommended = [
  "YOUTUBE_CHANNEL_IDS",
  "YOUTUBE_PLAYLIST_IDS",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_SITE_URL",
];
const optionalOpenAi = ["OPENAI_API_KEY", "OPENAI_CORE_FACTS_MODEL"];
const optionalPush = [
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
];
const optionalBooking = [
  "RESEND_API_KEY",
  "BOOKING_ADMIN_EMAIL",
  "RESEND_FROM_EMAIL",
];

function report(label, keys) {
  console.log(`\n${label}`);
  for (const key of keys) {
    const value = get(key);
    const ok = Boolean(value && !value.includes("YOUR_") && !value.startsWith("your_"));
    console.log(`  ${ok ? "OK " : "MISS"}  ${key}${ok ? ` (${value.length} chars)` : ""}`);
  }
}

console.log(existsSync(envPath) ? "Found .env.local" : "Missing .env.local (copy from .env.example)");
report("Browse / search", requiredBrowse);
report("Sync / studio / cron", requiredSync);
report("Recommended", recommended);
report("OpenAI core_facts", optionalOpenAi);
report("Web Push Daily Resets", optionalPush);
report("Booking email (Resend)", optionalBooking);

const browseOk = requiredBrowse.every((k) => get(k));
const syncOk = [...requiredBrowse, ...requiredSync].every((k) => get(k));
const bookingOk = ["RESEND_API_KEY", "BOOKING_ADMIN_EMAIL"].every((k) => get(k));
console.log("\nNext:");
if (!browseOk) {
  console.log("  1. Fill Supabase URL + anon + service_role in .env.local");
  console.log("  2. Run SQL migrations 01→15 in supabase/migrations/");
  console.log("  3. Optional seed: supabase/seed/01_demo_videos.sql");
} else if (!syncOk) {
  console.log("  Browse keys look present. Add YOUTUBE_API_KEY + CRON_SECRET to enable sync.");
} else {
  console.log("  Keys look present. Start: npm run dev");
  console.log("  Sync once: POST /api/admin/sync with Authorization: Bearer <CRON_SECRET>");
  console.log("  Transcripts: npm run transcripts:backfill");
  console.log("  Heatmap segments: npm run transcripts:backfill -- --refresh-segments");
  if (!bookingOk) {
    console.log("  Booking modal/email: set RESEND_API_KEY + BOOKING_ADMIN_EMAIL when ready.");
  }
  const pushOk = ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"].every((k) => get(k));
  if (!pushOk) {
    console.log("  Daily Resets push: npm run vapid:generate then set VAPID keys + run migration 09_push_subscribers.sql");
  }
  if (!get("OPENAI_API_KEY")) {
    console.log("  core_facts: set OPENAI_API_KEY then re-ingest / sync videos");
  }
}

process.exitCode = browseOk ? 0 : 1;
