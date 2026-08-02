/**
 * Investigation protocol: breakdown levels (video depth) and curated tags.
 * Levels 1-4: foundation → depth → long talks → raw club unlisted.
 */

export const BREAKDOWN_LEVELS = [
  "primary",
  "no_difference",
  "unfiltered",
  "archive_shards",
] as const;

export type BreakdownLevel = (typeof BREAKDOWN_LEVELS)[number];

export const BREAKDOWN_LEVEL_NUMBERS: Record<BreakdownLevel, 1 | 2 | 3 | 4> = {
  primary: 1,
  no_difference: 2,
  unfiltered: 3,
  archive_shards: 4,
};

/** Short labels for filters and cards. */
export const BREAKDOWN_LEVEL_LABELS: Record<BreakdownLevel, string> = {
  primary: "הבסיס",
  no_difference: "העמקה",
  unfiltered: "שיחות עומק",
  archive_shards: "הפירוק הגולמי",
};

export const BREAKDOWN_LEVEL_BLURBS: Record<BreakdownLevel, string> = {
  primary:
    "רמה 1. חקירת יסוד ומשאלי רחוב על נושאים יומיומיים: פחד, כסף, זוגיות.",
  no_difference:
    "רמה 2. חקירת מושגים מופשטים כמו זמן ובחירה חופשית, והפער בין עובדה לדימיון.",
  unfiltered:
    "רמה 3. שיחות פודקאסט מצולמות וארוכות. עומק בשיחה, לא טיזר קצר.",
  archive_shards:
    "רמה 4. סרטונים לא רשומים. מיועדים לחברי המועדון בלבד.",
};

/** Essential investigation tags (also live in CURATED_CONCEPTS). */
export const INVESTIGATION_TAGS = [
  "משמעות עודפת",
  "הפרדה",
  "אין-הבדל",
  "היגיון מינימלי",
  "תכלית הקיום",
  "היפוך מחשבה",
  "צורה מול מהות",
  "סוד הגלוי",
] as const;

export type InvestigationTag = (typeof INVESTIGATION_TAGS)[number];

export const INVESTIGATION_CONCEPT_CATEGORY = "investigation";

const INVESTIGATION_SET = new Set<string>(INVESTIGATION_TAGS);

export function isBreakdownLevel(value: unknown): value is BreakdownLevel {
  return (
    typeof value === "string" &&
    (BREAKDOWN_LEVELS as readonly string[]).includes(value)
  );
}

export function isInvestigationTag(name: string): boolean {
  return INVESTIGATION_SET.has(name.trim());
}

export function conceptCategoryForName(name: string): string | null {
  return isInvestigationTag(name) ? INVESTIGATION_CONCEPT_CATEGORY : null;
}

type InferBreakdownInput = {
  title: string;
  description?: string | null;
  tags?: string[];
  isUnlisted?: boolean;
  isGated?: boolean;
};

/**
 * Heuristic breakdown from title/description/tags and gate flags.
 * Prefer curator-set values when already stored (sync should not overwrite).
 * Named guests are concepts only. They do not define a site category.
 */
export function inferBreakdownLevel(
  input: InferBreakdownInput,
): BreakdownLevel {
  // Level 4: club / unlisted raw archive.
  if (input.isUnlisted || input.isGated) {
    return "archive_shards";
  }

  const haystack = [
    input.title,
    input.description ?? "",
    ...(input.tags ?? []),
  ]
    .join("\n")
    .toLowerCase();

  if (
    haystack.includes("לא רשום") ||
    haystack.includes("מועדון") ||
    haystack.includes("הפירוק הגולמי")
  ) {
    return "archive_shards";
  }

  // Level 3: long filmed podcast / deep conversation.
  if (
    haystack.includes("פודקאסט") ||
    haystack.includes("podcast") ||
    haystack.includes("שיחת עומק") ||
    haystack.includes("שיחות עומק") ||
    haystack.includes("לייב ארוך")
  ) {
    return "unfiltered";
  }

  // Level 2: abstract concepts.
  if (
    haystack.includes("אין-הבדל") ||
    haystack.includes("אין הבדל") ||
    haystack.includes("אין הבדלים") ||
    haystack.includes("בחירה חופשית") ||
    haystack.includes("מהות המציאות") ||
    /\bזמן\b/.test(haystack) ||
    (haystack.includes("עובדה") && haystack.includes("דימיון"))
  ) {
    return "no_difference";
  }

  // Level 1: everyday foundation.
  return "primary";
}

export function formatDiveMinutes(
  durationSeconds: number | null | undefined,
): number | null {
  if (durationSeconds == null || durationSeconds <= 0) return null;
  return Math.max(1, Math.round(durationSeconds / 60));
}
