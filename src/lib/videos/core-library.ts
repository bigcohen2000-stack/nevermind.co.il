/**
 * Core gated / unlisted investigation library (first wave).
 * YouTube ids only. No guest names as site pillars.
 * Mark these in Studio → "סמן כמועדון" or keep in env GATED / UNLISTED lists.
 */

export const CORE_GATED_YOUTUBE_IDS = [
  "Ap_YtCBV4cI",
  "mlBIRDAVZNM",
  "Kxx_Sh84zVY",
  "HcJIng2-4ps",
  "YnAhidIuoJk",
  "sjqu-dkLAmc",
  "0xJFsfLMR5w",
  "-9yya_KEBCU",
  "5Ie1HomzqwQ",
  "39c9tXIjuzU",
  /** בחירה חופשית (from investigation topics). */
  "CfB-Qz0G56k",
] as const;

export type CoreInvestigationTopic = {
  id: string;
  /** Short label for chips / paths. */
  label: string;
  /** Investigation question, NeverMind voice. */
  probe: string;
  youtubeId: string;
};

/**
 * Flagship probes for teasers / paths. Newer items preferred for first teasers.
 */
export const CORE_INVESTIGATION_TOPICS: CoreInvestigationTopic[] = [
  {
    id: "fear",
    label: "חרדה ופחד",
    probe:
      "פחד הוא רק סיפור על משהו שלא קורה עכשיו. אם תפסיק לספר לעצמך שאתה הולך למות, מה נשאר מהפחד?",
    youtubeId: "YnAhidIuoJk",
  },
  {
    id: "ego",
    label: "אגו והזדהות",
    probe:
      "אתה בונה דמות כדי שאחרים יאשרו שהיא קיימת. כשאתה לבד בחדר, הדמות הזאת נעלמת. אז מי זה זה שצופה בה נעלמת?",
    youtubeId: "0xJFsfLMR5w",
  },
  {
    id: "free-will",
    label: "בחירה חופשית",
    probe:
      'המחשבה "אני בחרתי" מגיעה תמיד אחרי שהפעולה כבר קרתה. אתה רק הקריין של הסרט, לא הבמאי.',
    youtubeId: "CfB-Qz0G56k",
  },
  {
    id: "relationship",
    label: "זוגיות",
    probe:
      "למה אתה חייב מישהו אחר כדי להרגיש שלם? אם אתה לא שלם לבד, גם שני אנשים לא יהיו שלם אחד. זה רק שני חצאים שמנסים לא לטבוע.",
    youtubeId: "-9yya_KEBCU",
  },
  {
    id: "reality",
    label: "מציאות מול סיפור",
    probe:
      '"טוב" ו"רע" אלו רק מילים שאתה מדביק על המציאות כדי לא להשתגע מהעובדה שאין להן שום משמעות אובייקטיבית.',
    youtubeId: "5Ie1HomzqwQ",
  },
];

/** Paste-ready string for Studio "סמן כמועדון". */
export function coreGatedIdsForStudio(): string {
  return CORE_GATED_YOUTUBE_IDS.join("\n");
}
