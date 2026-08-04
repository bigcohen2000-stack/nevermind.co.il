import type { ArticleCategory } from "@/lib/content/articles";
import {
  CORE_MECHANISMS,
  type CoreMechanism,
} from "@/lib/profile/core-mechanisms";
import type { BreakdownLevel } from "@/lib/videos/investigation";

export type SuggestItem =
  | {
      type: "video";
      id: string;
      youtubeId: string;
      title: string;
      isGated: boolean;
      /** Matched caption line when hit came from transcript search. */
      snippet?: string | null;
      /** Seek target in seconds for snippet matches. */
      startSeconds?: number | null;
      breakdownLevel?: BreakdownLevel | string | null;
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
    const base =
      item.isGated || !item.youtubeId
        ? `/watch/${item.id}`
        : `/watch/${item.youtubeId}`;
    const t = item.startSeconds;
    if (t != null && t > 0 && !item.isGated) {
      return `${base}?t=${Math.floor(t)}`;
    }
    return base;
  }
  return `/search?q=${encodeURIComponent(item.name)}`;
}

/** Short Hebrew type badge for suggest rows. */
export function suggestItemBadge(item: SuggestItem): string {
  if (item.type === "video") {
    return item.isGated ? "סרטון, מועדון" : "סרטון";
  }
  if (item.type === "article") return "מאמר";
  if (
    (CORE_MECHANISMS as readonly string[]).includes(item.name.trim())
  ) {
    return "מנגנון";
  }
  return "מושג";
}

export function isCoreMechanismName(name: string): name is CoreMechanism {
  return (CORE_MECHANISMS as readonly string[]).includes(name.trim());
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
