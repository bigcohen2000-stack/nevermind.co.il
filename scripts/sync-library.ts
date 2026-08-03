/**
 * In-process YouTube library sync (avoids localhost HTTP timeouts).
 * Usage: npx tsx scripts/sync-library.ts
 */
import { readFileSync, existsSync } from "node:fs";
import Module from "node:module";

// sync.ts imports "server-only"; stub it for CLI runs.
type ModuleLoad = (
  request: string,
  parent: NodeModule | undefined,
  isMain: boolean,
) => unknown;

const moduleApi = Module as unknown as { _load: ModuleLoad };
const originalLoad = moduleApi._load.bind(Module) as ModuleLoad;
moduleApi._load = (request, parent, isMain) => {
  if (request === "server-only") return {};
  return originalLoad(request, parent, isMain);
};

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  loadEnv(".env.local");

  console.log("Progress:");
  console.log("  1) Env loaded");
  console.log("  2) Syncing channel (transcripts skipped this run) ...");

  const { syncYoutubeLibrary } = await import("../src/lib/youtube/sync.ts");
  const result = await syncYoutubeLibrary({
    maxTranscriptFetches: 0,
    skipConcepts: true,
  });

  console.log("  3) Done");
    console.log(
    JSON.stringify(
      {
        ok: true,
        upserted: result.upserted,
        gatedCount: result.gatedCount,
        unlistedCount: result.unlistedCount,
        playlistsSynced: result.playlistsSynced,
        conceptsLinked: result.conceptsLinked,
        transcriptsUpserted: result.transcriptsUpserted,
        removedUnavailable: result.removedUnavailable,
        errorCount: result.errors.length,
        errorsSample: result.errors.slice(0, 8),
      },
      null,
      2,
    ),
  );

  if (result.errors.length > 8) {
    console.log(`  ... +${result.errors.length - 8} more errors`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
