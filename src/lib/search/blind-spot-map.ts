/**
 * Blind-spot map: searched premise → philosophical root / opposite direction.
 * Keys are matched against the user search query (exact, then contains).
 */

export type BlindSpotMapping = {
  /** Concept the user is likely searching (symptom / premise). */
  premise: string;
  /** Mapped opposite / root-cause concept to surface instead. */
  opposite: string;
  /** Short label shown under the section title. */
  tease: string;
};

export const BLIND_SPOT_MAP: readonly BlindSpotMapping[] = [
  {
    premise: "שליטה",
    opposite: "אגו ואשליה",
    tease: "הצורך לשלוט מצביע על אשליית האגו.",
  },
  {
    premise: "חרדה",
    opposite: "חוסר ודאות",
    tease: "החרדה היא תגובה. חוסר הוודאות הוא התנאי.",
  },
  {
    premise: "פחד",
    opposite: "חוסר ודאות",
    tease: "הפחד מגן על סיפור. חוסר הוודאות הוא מה שנשאר בלעדיו.",
  },
  {
    premise: "כעס",
    opposite: "אשמה",
    tease: "הכעס לעיתים מכסה אשמה שלא נבדקה.",
  },
  {
    premise: "אשמה",
    opposite: "מציאות",
    tease: "האשמה היא סיפור על מה שקרה. המציאות היא מה שקרה.",
  },
  {
    premise: "אהבה",
    opposite: "הזדהות",
    tease: "מה שנקרא אהבה הוא לפעמים הזדהות עם צורך.",
  },
  {
    premise: "זוגיות",
    opposite: "הזדהות",
    tease: "הזוגיות חושפת את מנגנון ההזדהות.",
  },
  {
    premise: "אגו",
    opposite: "מציאות",
    tease: "האגו בונה סיפור. המציאות לא זקוקה לו.",
  },
  {
    premise: "הזדהות",
    opposite: "מציאות",
    tease: "ההזדהות מחליפה ראייה ישירה.",
  },
  {
    premise: "מנגנון",
    opposite: "מציאות",
    tease: "המנגנון הוא תבנית. המציאות היא מה שמחוץ לתבנית.",
  },
  {
    premise: "כסף",
    opposite: "פחד",
    tease: "לחץ סביב כסף הוא לרוב פחד הישרדות בתחפושת.",
  },
  {
    premise: "ביטחון",
    opposite: "חוסר ודאות",
    tease: "החיפוש אחר ביטחון נולד מחוסר נכונות לחוסר ודאות.",
  },
  {
    premise: "דיכאון",
    opposite: "הזדהות",
    tease: "הדיכאון נשען על הזדהות עם סיפור על העצמי.",
  },
  {
    premise: "בדידות",
    opposite: "אגו",
    tease: "הבדידות לעיתים היא האגו שמבודד את עצמו.",
  },
] as const;

export const BLIND_SPOT_TOOLTIP =
  "לפעמים מה שאתה מחפש הוא רק הסימפטום, והתשובה נמצאת בכיוון ההפוך.";

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Resolve a blind-spot mapping for a search query, if any.
 * Prefers exact premise match, then longest contained premise.
 */
export function resolveBlindSpot(
  query: string,
): BlindSpotMapping | null {
  const q = normalize(query);
  if (!q) return null;

  const exact = BLIND_SPOT_MAP.find((m) => m.premise === q);
  if (exact) return exact;

  const contained = BLIND_SPOT_MAP.filter((m) => q.includes(m.premise)).sort(
    (a, b) => b.premise.length - a.premise.length,
  );
  return contained[0] ?? null;
}
