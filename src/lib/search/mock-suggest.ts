import type { SuggestItem } from "@/lib/search/types";
import type { Concept } from "@/types/supabase";

/** Static suggest payload when NEXT_PUBLIC_USE_MOCK_SEARCH=true. */
export const MOCK_SUGGEST_ITEMS: SuggestItem[] = [
  {
    type: "concept",
    id: "mock-metziut",
    name: "מציאות",
    category: "יסוד",
  },
  {
    type: "concept",
    id: "mock-hizdahut",
    name: "הזדהות",
    category: "יסוד",
  },
  {
    type: "video",
    id: "mock-video-1",
    youtubeId: "dQw4w9WgXcQ",
    title: "עובדה מול סיפור (דוגמה)",
    isGated: false,
    snippet: "המשמעות העודפת נוצרת כשמוסיפים סיפור על העובדה.",
    startSeconds: 42,
    breakdownLevel: "primary",
  },
  {
    type: "article",
    slug: "fact-vs-story",
    title: "עובדה מול סיפור",
    category: "relationships",
    description: "מאמר לדוגמה לבדיקת ממשק החיפוש.",
  },
];

export const MOCK_CONCEPTS: Concept[] = [
  { id: "mock-metziut", name: "מציאות", category: "יסוד" },
  { id: "mock-hizdahut", name: "הזדהות", category: "יסוד" },
  { id: "mock-sevel", name: "סבל", category: "יסוד" },
];

export function isMockSearchEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_SEARCH === "true";
}

export function getMockSuggest(query: string): {
  items: SuggestItem[];
  concepts: Concept[];
} {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return { items: [], concepts: [] };
  }
  const items = MOCK_SUGGEST_ITEMS.filter((item) => {
    if (item.type === "concept") {
      return item.name.toLowerCase().includes(q);
    }
    if (item.type === "video") {
      return item.title.toLowerCase().includes(q);
    }
    return item.title.toLowerCase().includes(q);
  });
  return {
    items: items.length > 0 ? items : MOCK_SUGGEST_ITEMS.slice(0, 3),
    concepts: MOCK_CONCEPTS,
  };
}
