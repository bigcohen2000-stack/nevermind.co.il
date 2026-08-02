/**
 * Curated Hebrew concepts for NeverMinde.
 * Sync and UI chips prefer this list over raw token noise.
 */

import {
  INVESTIGATION_TAGS,
  conceptCategoryForName,
} from "@/lib/videos/investigation";

export const CURATED_CONCEPTS = [
  "מציאות",
  "הזדהות",
  "חרדה",
  "כעס",
  "אהבה",
  "אגו",
  "פחד",
  "אשמה",
  "זוגיות",
  "מנגנון",
  "סבל",
  "בחירה חופשית",
  "יחסים",
  "קיום",
  "זהות",
  "רצון חופשי",
  "האשמה",
  "תודעה",
  "אליעד כהן",
  ...INVESTIGATION_TAGS,
] as const;

export type CuratedConcept = (typeof CURATED_CONCEPTS)[number];

const CURATED_SET = new Set<string>(CURATED_CONCEPTS);

const NOISE_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "your",
  "של",
  "את",
  "על",
  "עם",
  "או",
  "זה",
  "זו",
  "הוא",
  "היא",
  "לא",
  "גם",
  "כי",
  "כל",
  "יש",
  "מה",
  "איך",
  "בין",
  "אני",
  "אנחנו",
  "היום",
  "פעם",
  "רק",
  "עוד",
  "כבר",
  "אבל",
  "אם",
  "כאשר",
  "youtube",
  "shorts",
  "live",
  "podcast",
]);

function isMostlyHebrew(text: string): boolean {
  const letters = text.replace(/\s+/g, "");
  if (!letters) return false;
  const hebrew = (letters.match(/[\u0590-\u05FF]/g) ?? []).length;
  return hebrew / letters.length >= 0.7;
}

/** True when a concept name is curated or passes quality gates. */
export function isQualityConceptName(name: string): boolean {
  const cleaned = name.trim();
  if (cleaned.length < 2) return false;
  if (CURATED_SET.has(cleaned)) return true;
  if (NOISE_WORDS.has(cleaned.toLowerCase())) return false;
  if (cleaned.length < 3) return false;
  if (!isMostlyHebrew(cleaned)) return false;
  // Reject long free-text fragments
  if (cleaned.length > 24) return false;
  if (cleaned.split(/\s+/).length > 3) return false;
  return false; // non-curated Hebrew tokens stay out of auto-index
}

/** Extract only curated concepts present in title/description/tags. */
export function extractCuratedConcepts(
  title: string,
  description: string,
  tags: string[] = [],
  limit = 6,
): string[] {
  const haystack = `${title}\n${description}\n${tags.join("\n")}`;
  const found: string[] = [];

  for (const concept of CURATED_CONCEPTS) {
    if (haystack.includes(concept)) {
      found.push(concept);
      if (found.length >= limit) break;
    }
  }

  return found;
}

export function isCuratedConcept(name: string): boolean {
  return CURATED_SET.has(name.trim());
}

/** Category to store on concepts upsert (investigation tags vs null). */
export function curatedConceptCategory(name: string): string | null {
  return conceptCategoryForName(name);
}
