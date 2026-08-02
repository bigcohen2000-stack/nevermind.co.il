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
const secret = env.CRON_SECRET;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Progress:");
console.log("  1) CRON_SECRET:", secret ? "OK" : "MISS");
console.log(
  "  2) SERVICE_ROLE:",
  service && service.length > 20 ? "OK" : "MISS — sync will fail ENV/500",
);
console.log("  3) Calling POST /api/admin/sync ...");

if (!secret) {
  console.error("Abort: no CRON_SECRET");
  process.exit(1);
}

// Full channel sync can take many minutes; default fetch abort is too short on some runtimes.
const SYNC_TIMEOUT_MS = Number(process.env.SYNC_TIMEOUT_MS || 20 * 60 * 1000);

try {
  const res = await fetch("http://localhost:3000/api/admin/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maxTranscriptFetches: 0 }),
    signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
  });
  const text = await res.text();
  console.log("  4) HTTP", res.status);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }
} catch (err) {
  console.error(
    "  4) FETCH_FAIL — is npm run dev running? (or sync still running past timeout)",
    err.message,
  );
  process.exit(1);
}
