/**
 * YouTube heart / threaded replies curated as investigation questions.
 * Manual list for now. Max 3 shown per video in the watch UI.
 */

export type HeartInsight = {
  /** YouTube comment id (optional but preferred). */
  commentId?: string;
  /** Question / comment text. */
  question: string;
  /** Commenter display name (authenticity). */
  authorName: string;
  /** ISO date or human stamp from YouTube. */
  commentedAt: string;
  /** Seconds into the video, when known. */
  timestampSeconds?: number;
  /** Internal video UUID and/or youtube id for matching. */
  videoId?: string;
  youtubeId?: string;
  /** Direct YouTube watch URL (with optional &t=). */
  youtubeUrl: string;
  /** Optional: show on /members "questions now" strip. */
  showOnMembers?: boolean;
  /** Optional: show on home only if broad enough. */
  showOnHome?: boolean;
};

/**
 * First-wave heart questions (Yakir curated).
 * Author names: replace with real YouTube display names when known.
 */
export const HEART_INSIGHTS: HeartInsight[] = [
  {
    question: "אם הכל זה סיפור, למה זה מרגיש כל כך אמיתי?",
    authorName: "מגיב בערוץ",
    commentedAt: "2026",
    youtubeId: "5Ie1HomzqwQ",
    youtubeUrl: "https://www.youtube.com/watch?v=5Ie1HomzqwQ",
    showOnMembers: true,
    showOnHome: true,
  },
  {
    question:
      "מה עושים עם הריקנות שנשארת אחרי שמבינים שאין באמת 'אני'?",
    authorName: "מגיב בערוץ",
    commentedAt: "2026",
    youtubeId: "0xJFsfLMR5w",
    youtubeUrl: "https://www.youtube.com/watch?v=0xJFsfLMR5w",
    showOnMembers: true,
  },
  {
    question:
      "איך אפשר לתפקד בעולם בלי להגדיר דברים כטובים או רעים?",
    authorName: "מגיב בערוץ",
    commentedAt: "2026",
    youtubeId: "5Ie1HomzqwQ",
    youtubeUrl: "https://www.youtube.com/watch?v=5Ie1HomzqwQ",
    showOnMembers: true,
    showOnHome: true,
  },
];

export function heartInsightsForVideo(input: {
  videoId?: string | null;
  youtubeId?: string | null;
  limit?: number;
}): HeartInsight[] {
  const limit = Math.min(3, Math.max(1, input.limit ?? 3));
  const vid = input.videoId?.trim() ?? "";
  const yt = input.youtubeId?.trim() ?? "";
  return HEART_INSIGHTS.filter((row) => {
    if (vid && row.videoId === vid) return true;
    if (yt && row.youtubeId === yt) return true;
    return false;
  }).slice(0, limit);
}

export function heartInsightsForMembers(limit = 6): HeartInsight[] {
  return HEART_INSIGHTS.filter((row) => row.showOnMembers).slice(0, limit);
}

/** Home: only questions marked broad enough for the general audience. */
export function heartInsightsForHome(limit = 3): HeartInsight[] {
  return HEART_INSIGHTS.filter((row) => row.showOnHome).slice(0, limit);
}
