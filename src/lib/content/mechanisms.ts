import type { ArticleCategory } from "@/lib/content/articles";
import type { CoreMechanism } from "@/lib/profile/core-mechanisms";

export type MechanismDefinition = {
  index: string;
  /** Anchor id on /mechanisms */
  id: string;
  label: CoreMechanism;
  category: ArticleCategory;
  explanation: string;
  /** Shown as linked investigation questions → /search?q= */
  questions: string[];
  /** Concept chips → /search?q= */
  searchTerms: string[];
  /** Ids from CORE_INVESTIGATION_TOPICS */
  topicIds: string[];
};

/**
 * Three content pillars. Same labels as /mechanisms and profile progress.
 */
export const MECHANISM_DEFINITIONS: MechanismDefinition[] = [
  {
    index: "01",
    id: "relationships",
    label: "יחסים",
    category: "relationships",
    explanation:
      "מנגנונים של קרבה: איך אנחנו מתחברים, נפרדים, מאשימים ומתפייסים. הרגש סוער, אבל מתחתיו פועלת תבנית צפויה.",
    questions: [
      "מי באמת אשם בקונפליקט?",
      "למה אנחנו חוזרים לאותו ויכוח?",
      "מה קורה ברגע שבו נפגעים?",
    ],
    searchTerms: ["יחסים", "זוגיות", "האשמה", "אהבה"],
    topicIds: ["relationship"],
  },
  {
    index: "02",
    id: "existence",
    label: "קיום",
    category: "existence",
    explanation:
      "מנגנונים של הישרדות: כסף, עבודה, לחץ והרגלים שמפעילים אותנו. מה שנראה כמו בחירה הוא לרוב אוטומט ישן.",
    questions: [
      "למה כל כך קשה להפסיק הרגל?",
      "מה מניע את הלחץ סביב כסף?",
      "מתי הישרדות הופכת לאוטומט?",
    ],
    searchTerms: ["קיום", "חרדה", "פחד", "מציאות"],
    topicIds: ["fear", "reality"],
  },
  {
    index: "03",
    id: "identity",
    label: "זהות",
    category: "identity",
    explanation:
      "מנגנונים של ה'אני': אגו, רצון חופשי ותפיסת המציאות. השכבה העמוקה ביותר, שבה נשאלת השאלה מי בכלל שואל.",
    questions: [
      "האם קיים רצון חופשי?",
      "מי זה ה'אני' שחושב?",
      "עד כמה המציאות שאנחנו חווים אמיתית?",
    ],
    searchTerms: ["זהות", "אגו", "הזדהות", "בחירה חופשית"],
    topicIds: ["ego", "free-will"],
  },
];

export function searchHref(q: string): string {
  return `/search?q=${encodeURIComponent(q)}`;
}
