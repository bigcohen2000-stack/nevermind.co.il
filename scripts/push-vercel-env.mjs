/**
 * Push NeverMind .env.local keys to the linked Vercel project (nevermind.co.il).
 * Does not print secret values. Skips YakirCohen / unrelated projects by using .vercel link.
 *
 * Usage: node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

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

if (!existsSync(".vercel/project.json")) {
  console.error("Missing .vercel/project.json — link nevermind.co.il first");
  process.exit(1);
}

const link = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
if (link.projectName !== "nevermind.co.il") {
  console.error(
    `Refusing to push: linked project is "${link.projectName}", expected nevermind.co.il`,
  );
  process.exit(1);
}

const env = loadEnv(".env.local");

const overrides = {
  NEXT_PUBLIC_SITE_URL: "https://nevermind.co.il",
  NEXT_PUBLIC_USE_MOCK_SEARCH: "false",
};

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "YOUTUBE_API_KEY",
  "CRON_SECRET",
  "YOUTUBE_CHANNEL_IDS",
  "YOUTUBE_PLAYLIST_IDS",
  "GATED_PLAYLIST_IDS",
  "YOUTUBE_UNLISTED_VIDEO_IDS",
  "YOUTUBE_GATED_VIDEO_IDS",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_USE_MOCK_SEARCH",
  "CLUB_GATE_SECRET",
  "STUDIO_SECRET",
  "STUDIO_GATE_SLUG",
  "STUDIO_REQUIRE_CF_ACCESS",
  "STUDIO_ALLOWED_EMAILS",
  // optional — only if present
  "RESEND_API_KEY",
  "BOOKING_ADMIN_EMAIL",
  "RESEND_FROM_EMAIL",
  "RESEND_NOTIFY_EMAIL",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "OPENAI_API_KEY",
];

const sensitive = new Set([
  "SUPABASE_SERVICE_ROLE_KEY",
  "YOUTUBE_API_KEY",
  "CRON_SECRET",
  "CLUB_GATE_SECRET",
  "STUDIO_SECRET",
  "RESEND_API_KEY",
  "VAPID_PRIVATE_KEY",
  "OPENAI_API_KEY",
]);

// Production first. Preview often fails on Windows CLI warnings for NEXT_PUBLIC_*.
const targets = ["production", "development"];

console.log(`Target Vercel project: ${link.projectName} (${link.projectId})`);

let added = 0;
let skipped = 0;
let failed = 0;

for (const key of keys) {
  const value = overrides[key] ?? env[key];
  if (!value || value.includes("YOUR_") || value.startsWith("your_")) {
    console.log(`SKIP  ${key} (empty / placeholder)`);
    skipped += 1;
    continue;
  }

  for (const target of targets) {
    const args = [
      "vercel",
      "env",
      "add",
      key,
      target,
      "--value",
      value,
      "--force",
      "--yes",
      "--non-interactive",
    ];
    if (sensitive.has(key) && target !== "development") {
      args.push("--sensitive");
    }

    const res = spawnSync("npx", args, {
      encoding: "utf8",
      shell: true,
    });
    const out = `${res.stdout || ""}${res.stderr || ""}`;
    if (res.status === 0) {
      console.log(`OK    ${key} → ${target}`);
      added += 1;
    } else {
      console.log(`FAIL  ${key} → ${target}: ${out.split(/\r?\n/).filter(Boolean).slice(-2).join(" | ")}`);
      failed += 1;
    }
  }
}

console.log(JSON.stringify({ added, skipped, failed, project: link.projectName }));
process.exit(failed > 0 ? 1 : 0);
