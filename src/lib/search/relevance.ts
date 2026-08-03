/**
 * Shared Hebrew search relevance helpers.
 * Keeps autocomplete and full search aligned.
 */

export function hebrewEquals(a: string, b: string): boolean {
  return a.trim().localeCompare(b.trim(), "he", { sensitivity: "base" }) === 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Title relevance: exact > prefix > word start > contains. */
export function scoreTitleMatch(title: string, query: string): number {
  const t = title.trim();
  const q = query.trim();
  if (!t || !q) return 0;
  if (hebrewEquals(t, q)) return 100;

  const tl = t.toLowerCase();
  const ql = q.toLowerCase();
  if (tl.startsWith(ql)) return 92;

  try {
    const wordStart = new RegExp(`(?:^|[\\s\\-/"'«»])${escapeRegExp(ql)}`, "i");
    if (wordStart.test(t)) return 85;
  } catch {
    /* ignore bad regex */
  }

  if (tl.includes(ql)) return 68;
  return 0;
}

export type ConceptMatchTier = "exact" | "strong" | "soft";

/**
 * How tightly a concept name matches the query.
 * Soft matches need query length >= 3 to avoid noise.
 */
export function conceptMatchTier(
  name: string,
  query: string,
): ConceptMatchTier | null {
  const n = name.trim();
  const q = query.trim();
  if (!n || !q) return null;
  if (hebrewEquals(n, q)) return "exact";

  const nl = n.toLowerCase();
  const ql = q.toLowerCase();
  if (nl.startsWith(ql) || (ql.length >= 3 && ql.startsWith(nl))) {
    return "strong";
  }
  if (ql.length >= 3 && nl.includes(ql)) return "soft";
  return null;
}

export const CONCEPT_SCORE: Record<ConceptMatchTier, number> = {
  exact: 100,
  strong: 88,
  soft: 48,
};

export const TRANSCRIPT_SCORE = 28;

export type SearchMatchKind = "title" | "concept" | "transcript";

export type SearchMatchMeta = {
  kind: SearchMatchKind;
  /** Concept name when kind is concept. */
  conceptName?: string;
};

/** Short Hebrew line for cards: why this result appeared. */
export function formatSearchMatchLabel(meta: SearchMatchMeta): string {
  switch (meta.kind) {
    case "title":
      return "למה זה עלה: בכותרת";
    case "concept":
      return meta.conceptName?.trim()
        ? `למה זה עלה: מושג · ${meta.conceptName.trim()}`
        : "למה זה עלה: מושג משותף";
    case "transcript":
      return "למה זה עלה: בתמלול";
    default:
      return "למה זה עלה: במאגר";
  }
}

/** Drop weak transcript-only hits when stronger matches exist. */
export function minKeepScore(scores: Iterable<number>): number {
  let best = 0;
  for (const s of scores) {
    if (s > best) best = s;
  }
  if (best >= 68) return 48;
  if (best >= 48) return 28;
  return 28;
}

/**
 * Stricter floor when the query is an exact concept hit.
 * Keeps concept-linked and strong title matches. Drops soft/transcript noise.
 */
export function minKeepScoreForConceptQuery(scores: Iterable<number>): number {
  let best = 0;
  for (const s of scores) {
    if (s > best) best = s;
  }
  if (best >= CONCEPT_SCORE.exact) return CONCEPT_SCORE.strong;
  if (best >= CONCEPT_SCORE.strong) return CONCEPT_SCORE.strong;
  return minKeepScore(scores);
}

/** True when query equals a known curated concept name. */
export function isExactCuratedQuery(
  query: string,
  curatedNames: Iterable<string>,
): boolean {
  const q = query.trim();
  if (!q) return false;
  for (const name of curatedNames) {
    if (hebrewEquals(name, q)) return true;
  }
  return false;
}

