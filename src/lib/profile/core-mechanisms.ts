/**
 * Three core mechanisms from /mechanisms.
 * Concept names map into these for analytical progress (X/3).
 */

export const CORE_MECHANISMS = ["יחסים", "קיום", "זהות"] as const;

export type CoreMechanism = (typeof CORE_MECHANISMS)[number];

export const CORE_MECHANISM_COUNT = CORE_MECHANISMS.length;

/** Direct or related concept name → core mechanism. */
const CONCEPT_TO_CORE: Record<string, CoreMechanism> = {
  יחסים: "יחסים",
  זוגיות: "יחסים",
  אהבה: "יחסים",
  האשמה: "יחסים",
  אשמה: "יחסים",
  הפרדה: "יחסים",

  קיום: "קיום",
  "תכלית הקיום": "קיום",
  מציאות: "קיום",
  סבל: "קיום",
  חרדה: "קיום",
  פחד: "קיום",
  כעס: "קיום",

  זהות: "זהות",
  אגו: "זהות",
  הזדהות: "זהות",
  תודעה: "זהות",
  "בחירה חופשית": "זהות",
  "רצון חופשי": "זהות",
  "אין-הבדל": "זהות",
  "היפוך מחשבה": "זהות",
  "צורה מול מהות": "זהות",
  מנגנון: "זהות",
};

export function coreMechanismForConcept(
  name: string,
): CoreMechanism | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return CONCEPT_TO_CORE[trimmed] ?? null;
}

export function collectCoreMechanisms(
  conceptNames: Iterable<string>,
): Set<CoreMechanism> {
  const found = new Set<CoreMechanism>();
  for (const name of conceptNames) {
    const core = coreMechanismForConcept(name);
    if (core) found.add(core);
  }
  return found;
}
