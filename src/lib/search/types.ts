import type { ArticleCategory } from "@/lib/content/articles";

export type SuggestItem =
  | {
      type: "video";
      id: string;
      youtubeId: string;
      title: string;
      isGated: boolean;
    }
  | {
      type: "concept";
      id: string;
      name: string;
      category: string | null;
    }
  | {
      type: "article";
      slug: string;
      title: string;
      category: ArticleCategory;
      description: string;
    };

export function suggestItemLabel(item: SuggestItem): string {
  if (item.type === "video") return item.title;
  if (item.type === "concept") return item.name;
  return item.title;
}

export function suggestItemHref(item: SuggestItem): string {
  if (item.type === "article") return `/articles/${item.slug}`;
  if (item.type === "video") {
    // Gated teasers use opaque UUID paths (youtubeId redacted server-side).
    if (item.isGated || !item.youtubeId) return `/watch/${item.id}`;
    return `/watch/${item.youtubeId}`;
  }
  return `/search?q=${encodeURIComponent(item.name)}`;
}

/** Blind Spot map hit or OpenAI fallback. */
export type InvertSource = "map" | "llm";

export type InvertCaptionHit = {
  videoId: string;
  youtubeId: string;
  title: string;
  startSeconds: number;
  snippet: string;
  watchUrl: string;
  embedUrl: string;
  embedHtml: string;
};

export type InvertSearchResponse = {
  premise: string | null;
  opposite: string | null;
  tease: string | null;
  source: InvertSource | null;
  hits: InvertCaptionHit[];
  error?: string;
};
