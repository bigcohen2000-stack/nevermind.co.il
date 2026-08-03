const PREFIX = "read_pos_";

export type ArticleReadPosition = {
  /** 1-based paragraph index inside the article body. */
  paragraph: number;
  /** Scroll Y when last saved (fallback if paragraph missing). */
  scrollY: number;
  updatedAt: number;
};

export function readPositionKey(slug: string): string {
  return `${PREFIX}${slug}`;
}

export function loadArticleReadPosition(
  slug: string,
): ArticleReadPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(readPositionKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ArticleReadPosition>;
    const paragraph = Number(parsed.paragraph);
    const scrollY = Number(parsed.scrollY);
    if (!Number.isFinite(paragraph) || paragraph < 2) return null;
    return {
      paragraph: Math.floor(paragraph),
      scrollY: Number.isFinite(scrollY) ? scrollY : 0,
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveArticleReadPosition(
  slug: string,
  position: Omit<ArticleReadPosition, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ArticleReadPosition = {
      paragraph: Math.max(1, Math.floor(position.paragraph)),
      scrollY: Math.max(0, Math.floor(position.scrollY)),
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(readPositionKey(slug), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearArticleReadPosition(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(readPositionKey(slug));
  } catch {
    /* ignore */
  }
}
