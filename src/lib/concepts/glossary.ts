/**
 * Short objective definitions for core NeverMinde terms.
 * Used by article glossary tooltips. Plain keyboard punctuation only.
 */

export type GlossaryEntry = {
  term: string;
  definition: string;
};

/** Longest terms first so multi-word matches win over fragments. */
export const GLOSSARY_ENTRIES: readonly GlossaryEntry[] = [
  {
    term: "משמעות עודפת",
    definition:
      "סיפור או פירוש שמוסיפים על עובדה. העודף הוא לא המציאות עצמה.",
  },
  {
    term: "בחירה חופשית",
    definition:
      "הטענה שאפשר לבחור אחרת ממה שקורה. נבדקת מול רצף הסיבות בפועל.",
  },
  {
    term: "רצון חופשי",
    definition:
      "תחושת בחירה עצמאית. לעיתים היא סיפור של האגו ולא תיאור מדויק.",
  },
  {
    term: "היפוך מחשבה",
    definition:
      "בדיקת הכיוון ההפוך של הנחה. אם ההנחה מתהפכת, רואים מה נשאר.",
  },
  {
    term: "צורה מול מהות",
    definition:
      "ההבדל בין איך שמשהו נראה לבין מה שהוא עושה בפועל.",
  },
  {
    term: "היגיון מינימלי",
    definition:
      "צמצום לטענה הכי קטנה שחייבים כדי שהדבר יעמוד. בלי קישוטים.",
  },
  {
    term: "תכלית הקיום",
    definition:
      "השאלה מה נשאר כשמסירים סיפורים על משמעות. בדיקה, לא תשובה מוכנה.",
  },
  {
    term: "סוד הגלוי",
    definition:
      "מה שכבר נמצא מול העיניים ולא נראה, כי הסיפור מסתיר אותו.",
  },
  {
    term: "אין-הבדל",
    definition:
      "בדיקה אם שני דברים שנתפסים כנפרדים באמת נפרדים, או רק בשם.",
  },
  {
    term: "מציאות",
    definition: "מה שקורה בפועל, בלי הסיפור שמוסיפים עליו.",
  },
  {
    term: "הזדהות",
    definition: "הדבקה של העצמי לסיפור, לרגש, לתפקיד או לרעיון.",
  },
  {
    term: "הפרדה",
    definition: "הבחנה בין עובדה לבין מה שמדביקים עליה.",
  },
  {
    term: "מנגנון",
    definition: "תבנית חוזרת שמפעילה תגובה. לא האירוע הבודד, אלא המבנה.",
  },
  {
    term: "זוגיות",
    definition: "מערכת יחסים שבה עולים מנגנוני קרבה, האשמה והזדהות.",
  },
  {
    term: "יחסים",
    definition: "תבניות של קרבה והפרדה בין אנשים. מתחת לרגש פועל מנגנון.",
  },
  {
    term: "האשמה",
    definition: "סיפור על מי אשם. מחליף לעיתים בדיקה של מה שקרה.",
  },
  {
    term: "אשמה",
    definition: "תחושה או סיפור על אשמה. לא בהכרח תיאור של המציאות.",
  },
  {
    term: "חרדה",
    definition: "תגובה לאיום משוער. לעיתים על סיפור, לא על מה שקורה עכשיו.",
  },
  {
    term: "פחד",
    definition: "סיפור על סכנה עתידית או מדומיינת. נבדק מול מה שקיים כעת.",
  },
  {
    term: "כעס",
    definition: "תגובה חזקה. לעיתים מכסה אשמה, פחד או צורך שלא נבדק.",
  },
  {
    term: "אהבה",
    definition: "מילה רחבה. נבדקת מול הזדהות, צורך, ומה שקורה בפועל.",
  },
  {
    term: "אגו",
    definition: "מנגנון שמחזיק סיפור על ה'אני' ומגן עליו.",
  },
  {
    term: "סבל",
    definition: "חוויה שמתחזקת כשמדביקים משמעות עודפת על כאב או מחסור.",
  },
  {
    term: "תודעה",
    definition: "מודעות למה שקורה. נבדקת מול הזדהות עם מחשבות.",
  },
  {
    term: "זהות",
    definition: "סיפור על מי אני. השכבה שבה נשאלת השאלה מי בכלל שואל.",
  },
  {
    term: "קיום",
    definition: "שכבת הישרדות: כסף, לחץ, הרגלים ואוטומטים יומיומיים.",
  },
].slice()
  .sort((a, b) => b.term.length - a.term.length);

const BY_TERM = new Map(
  GLOSSARY_ENTRIES.map((e) => [e.term, e.definition] as const),
);

export function glossaryDefinition(term: string): string | null {
  return BY_TERM.get(term.trim()) ?? null;
}

/** Terms sorted longest-first for safe substring matching. */
export function glossaryTerms(): string[] {
  return GLOSSARY_ENTRIES.map((e) => e.term);
}
