#!/usr/bin/env node
/**
 * Lightweight route timing smoke check (no Lighthouse install required).
 *
 * Usage:
 *   npm run perf:check
 *   npm run perf:check -- http://localhost:3000
 *
 * Measures TTFB + total download time for key public routes.
 * Exit code 1 if any route fails or exceeds PERF_MAX_MS (default 8000).
 */

const base = (process.argv[2] || process.env.PERF_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const maxMs = Number(process.env.PERF_MAX_MS || 8000);

const ROUTES = [
  "/",
  "/search",
  "/videos",
  "/concepts",
  "/articles",
];

async function timeRoute(path) {
  const url = `${base}${path}`;
  const started = performance.now();
  let ttfbMs = null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), maxMs + 2000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/html" },
      redirect: "follow",
    });
    ttfbMs = Math.round(performance.now() - started);
    const body = await res.text();
    const totalMs = Math.round(performance.now() - started);
    return {
      path,
      ok: res.ok,
      status: res.status,
      ttfbMs,
      totalMs,
      bytes: Buffer.byteLength(body, "utf8"),
      error: null,
    };
  } catch (err) {
    const totalMs = Math.round(performance.now() - started);
    return {
      path,
      ok: false,
      status: 0,
      ttfbMs,
      totalMs,
      bytes: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

console.log(`perf:check against ${base} (budget ${maxMs}ms)\n`);

const results = [];
for (const path of ROUTES) {
  const result = await timeRoute(path);
  results.push(result);
  const status = result.ok ? "ok" : "FAIL";
  const timing = `ttfb ${result.ttfbMs ?? "-"}ms / total ${result.totalMs}ms`;
  const size = result.bytes ? `${Math.round(result.bytes / 1024)}kb` : "-";
  const extra = result.error ? ` (${result.error})` : "";
  console.log(`[${status}] ${path.padEnd(12)} ${timing}  ${size}${extra}`);
}

const failures = results.filter(
  (r) => !r.ok || (r.totalMs != null && r.totalMs > maxMs),
);

console.log("");
if (failures.length) {
  console.error(
    `perf:check failed: ${failures.length}/${results.length} routes over budget or errored.`,
  );
  process.exit(1);
}

console.log(`perf:check passed: ${results.length}/${results.length} routes.`);
