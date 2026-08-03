import "server-only";

import { isCuratedConcept } from "@/lib/concepts/quality";
import { resolveBlindSpot } from "@/lib/search/blind-spot-map";
import { listVideosForConceptName } from "@/lib/videos/queries";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

export type LogicalContinuation = {
  fromTopic: string;
  nextTopic: string;
  /** Short dry rationale (optional). */
  rationale: string | null;
  href: string;
  videoTitle: string | null;
  youtubeId: string | null;
  thumbnailUrl: string | null;
};

/**
 * Directed investigation steps for core tags.
 * Falls back to blind-spot opposite when a term is missing here.
 */
export const CONTINUATION_CHAIN: Readonly<
  Record<string, { next: string; rationale: string }>
> = {
  "משמעות עודפת": {
    next: "הפרדה",
    rationale: "אחרי זיהוי המשמעות העודפת בודקים מה אפשר להפריד ממנה.",
  },
  הפרדה: {
    next: "אין-הבדל",
    rationale: "ההפרדה מובילה לבדיקה אם בכלל יש הבדל.",
  },
  "אין-הבדל": {
    next: "היפוך מחשבה",
    rationale: "כשאין הבדל, בודקים את הכיוון ההפוך של המחשבה.",
  },
  "היפוך מחשבה": {
    next: "צורה מול מהות",
    rationale: "ההיפוך מחדד את הפער בין צורה למהות.",
  },
  "צורה מול מהות": {
    next: "היגיון מינימלי",
    rationale: "מהות בלי עודפים דורשת היגיון מינימלי.",
  },
  "היגיון מינימלי": {
    next: "תכלית הקיום",
    rationale: "אחרי צמצום לשאלה הבסיסית נשארת תכלית הקיום.",
  },
  "תכלית הקיום": {
    next: "סוד הגלוי",
    rationale: "התכלית חוזרת למה שכבר גלוי ולא נראה.",
  },
  "סוד הגלוי": {
    next: "מציאות",
    rationale: "הסוד הגלוי מחזיר לראייה ישירה של המציאות.",
  },
  מציאות: {
    next: "הזדהות",
    rationale: "אחרי המציאות בודקים איפה נכנסת הזדהות.",
  },
  הזדהות: {
    next: "אגו",
    rationale: "ההזדהות נשענת על אגו שמחזיק סיפור.",
  },
  אגו: {
    next: "מציאות",
    rationale: "האגו נבדק מול מה שקורה בפועל.",
  },
};

function pickPrimaryTopic(conceptNames: string[]): string | null {
  const cleaned = conceptNames.map((n) => n.trim()).filter(Boolean);
  const curated = cleaned.find((n) => isCuratedConcept(n));
  if (curated) return curated;
  return cleaned[0] ?? null;
}

function resolveNextStep(fromTopic: string): {
  nextTopic: string;
  rationale: string | null;
} | null {
  const chain = CONTINUATION_CHAIN[fromTopic];
  if (chain) {
    return { nextTopic: chain.next, rationale: chain.rationale };
  }

  const blind = resolveBlindSpot(fromTopic);
  if (blind) {
    return { nextTopic: blind.opposite, rationale: blind.tease };
  }

  return null;
}

/**
 * Single logical next step after a watch: next topic + best video (or search).
 */
export async function getLogicalContinuation(input: {
  videoId: string;
  conceptNames: string[];
}): Promise<LogicalContinuation | null> {
  const fromTopic = pickPrimaryTopic(input.conceptNames);
  if (!fromTopic) return null;

  const step = resolveNextStep(fromTopic);
  if (!step) return null;

  const { nextTopic, rationale } = step;
  let video: Video | null = null;

  try {
    const candidates = await listVideosForConceptName(nextTopic, 6);
    video =
      candidates.find((v) => v.id !== input.videoId) ??
      candidates[0] ??
      null;
    if (video?.id === input.videoId) video = null;
  } catch {
    video = null;
  }

  if (video) {
    return {
      fromTopic,
      nextTopic,
      rationale,
      href: getWatchHref(video),
      videoTitle: video.title,
      youtubeId: video.youtube_id?.trim() || null,
      thumbnailUrl: video.thumbnail_url ?? null,
    };
  }

  return {
    fromTopic,
    nextTopic,
    rationale,
    href: `/search?q=${encodeURIComponent(nextTopic)}`,
    videoTitle: null,
    youtubeId: null,
    thumbnailUrl: null,
  };
}
