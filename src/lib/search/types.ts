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
