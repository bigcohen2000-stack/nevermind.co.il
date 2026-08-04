import "server-only";

/**
 * IndexNow ping (Bing, Yandex, and compatible AI crawlers).
 * Key file must live at https://nevermind.co.il/{key}.txt
 */

export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() || "nm-yakir-cohen-index-2026";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = "nevermind.co.il";

export type IndexNowResult =
  | { ok: true; submitted: number }
  | { ok: false; error: string; status?: number };

/** Normalize to absolute https URLs on nevermind.co.il. */
export function normalizeIndexNowUrls(urls: string[]): string[] {
  const out: string[] = [];
  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    try {
      const u = new URL(
        trimmed.startsWith("http")
          ? trimmed
          : `https://${HOST}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`,
      );
      if (u.hostname !== HOST && u.hostname !== `www.${HOST}`) continue;
      u.hash = "";
      out.push(u.toString());
    } catch {
      // skip invalid
    }
  }
  return Array.from(new Set(out));
}

export async function submitIndexNow(
  urls: string[],
): Promise<IndexNowResult> {
  const key = INDEXNOW_KEY;
  if (!key) {
    return { ok: false, error: "INDEXNOW_KEY missing" };
  }

  const list = normalizeIndexNowUrls(urls);
  if (list.length === 0) {
    return { ok: false, error: "No valid URLs" };
  }

  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: list,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    // 200 / 202 are success for IndexNow.
    if (res.status === 200 || res.status === 202) {
      return { ok: true, submitted: list.length };
    }

    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      error: text || `IndexNow HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "IndexNow request failed",
    };
  }
}
