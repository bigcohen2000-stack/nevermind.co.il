/**
 * Build a clickable caption keyword cloud from transcript text.
 * Prefers investigation tags, then frequent Hebrew tokens.
 * Attaches first-hit startSeconds when timed segments are available.
 */

import { firstConceptOffsetSeconds } from "@/lib/videos/heatmap";
import type { TranscriptSegment } from "@/lib/videos/heatmap";
import { INVESTIGATION_TAGS } from "@/lib/videos/investigation";

export type CaptionTag = {
  label: string;
  count: number;
  kind: "investigation" | "transcript";
  /** First transcript hit in seconds, when segments are known. */
  startSeconds?: number | null;
};

const STOPWORDS = new Set([
  "של",
  "את",
  "על",
  "זה",
  "זו",
  "זאת",
  "אם",
  "או",
  "גם",
  "כי",
  "לא",
  "כן",
  "יש",
  "אין",
  "מה",
  "מי",
  "כל",
  "עם",
  "אז",
  "רק",
  "אבל",
  "הוא",
  "היא",
  "הם",
  "הן",
  "אני",
  "אנחנו",
  "אתה",
  "אתם",
  "שהוא",
  "שהיא",
  "כמו",
  "יותר",
  "פחות",
  "פה",
  "שם",
  "כאן",
  "עוד",
  "כבר",
  "מאוד",
  "דבר",
  "דברים",
  "אנשים",
  "אחד",
  "אחת",
  "שני",
  "שתי",
]);

const INVESTIGATION_SET = new Set<string>(INVESTIGATION_TAGS);

function tokenizeHebrew(text: string): string[] {
  return text
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\-־]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

export function buildCaptionTagCloud(
  transcriptText: string | null | undefined,
  conceptNames: string[] = [],
  limit = 24,
  segments: TranscriptSegment[] = [],
): CaptionTag[] {
  const text = (transcriptText ?? "").trim();
  const counts = new Map<string, number>();

  for (const tag of INVESTIGATION_TAGS) {
    if (!text) continue;
    const re = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = text.match(re);
    if (hits?.length) counts.set(tag, hits.length);
  }

  for (const name of conceptNames) {
    const label = name.trim();
    if (!label || INVESTIGATION_SET.has(label)) continue;
    if (!text.includes(label)) continue;
    const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = text.match(re);
    counts.set(label, (counts.get(label) ?? 0) + (hits?.length ?? 1));
  }

  if (text) {
    for (const token of tokenizeHebrew(text)) {
      if (STOPWORDS.has(token)) continue;
      if (INVESTIGATION_SET.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  const tags: CaptionTag[] = [...counts.entries()]
    .filter(([, count]) => count >= 1)
    .map(([label, count]) => {
      const startSeconds =
        segments.length > 0
          ? firstConceptOffsetSeconds(label, segments)
          : null;
      return {
        label,
        count,
        kind: INVESTIGATION_SET.has(label)
          ? ("investigation" as const)
          : ("transcript" as const),
        startSeconds,
      };
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === "investigation" ? -1 : 1;
      }
      return b.count - a.count || a.label.localeCompare(b.label, "he");
    })
    .slice(0, limit);

  return tags;
}
