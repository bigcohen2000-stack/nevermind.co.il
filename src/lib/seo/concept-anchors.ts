/**
 * Fixed HTML anchor ids for core glossary terms (AEO deep links).
 * Example: /concepts#concept-efrada
 */

export type ConceptAnchor = {
  term: string;
  id: string;
  definition: string;
};

/** Core extractable terms for GEO / AEO citation. */
export const CORE_CONCEPT_ANCHORS: readonly ConceptAnchor[] = [
  {
    term: "הפרדה",
    id: "concept-efrada",
    definition: "הבחנה בין עובדה לבין מה שמדביקים עליה.",
  },
  {
    term: "אין-הבדל",
    id: "concept-ein-hevdel",
    definition:
      "בדיקה אם שני דברים שנתפסים כנפרדים באמת נפרדים, או רק בשם.",
  },
  {
    term: "משמעות עודפת",
    id: "concept-mashmaut-odef",
    definition:
      "סיפור או פירוש שמוסיפים על עובדה. העודף הוא לא המציאות עצמה.",
  },
] as const;

/** Site-wide citation sentence for AI crawlers (one claim). */
export const CORE_EXTRACTABLE_SENTENCE =
  "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור.";
