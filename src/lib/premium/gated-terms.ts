/**
 * Topic terms that map to authorized (gated) knowledge areas.
 * Intent-based trigger: match is case-insensitive substring on the query.
 */
export const GATED_SEARCH_TERMS = [
  "התמכרות",
  "התמכרויות",
  "סמים",
  "סם",
  "תודעה",
  "מנגנוני תודעה",
  "אלוהים",
  "מיניות",
  "מין",
  "מערכות הפעלה של המוח",
  "מערכת הפעלה של המוח",
  "הנדסת המוח",
  "הנדסת מוח",
  "מבנה המציאות",
  "פסיכדלי",
  "פסיכדליה",
] as const;

export function matchesGatedSearchTerm(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return GATED_SEARCH_TERMS.some((term) => q.includes(term.toLowerCase()));
}
