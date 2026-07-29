import type { ComponentType } from "react";

import { metadata as factVsStory } from "../../../content/articles/fact-vs-story.mdx";
import { metadata as whatIsAMechanism } from "../../../content/articles/what-is-a-mechanism.mdx";
import { metadata as whatIsIndecision } from "../../../content/articles/what-is-indecision.mdx";
import { metadata as whyWeFight } from "../../../content/articles/why-we-fight.mdx";
import { metadata as whyIBlameHim } from "../../../content/articles/why-i-blame-him.mdx";

/**
 * Minimal MDX content layer for Phase 5.
 *
 * Articles are plain .mdx files under /content/articles. We keep a small,
 * explicit registry here instead of scanning the filesystem: the scope is two
 * sample articles, and a static list keeps imports analyzable at build time
 * (each MDX file is statically imported / code-split). When the catalogue
 * grows this can be replaced with a directory scan.
 */
export type ArticleCategory = "relationships" | "existence" | "identity";

export interface ArticleMeta {
  title: string;
  slug: string;
  category: ArticleCategory;
  isPremium: boolean;
  description: string;
}

interface ArticleEntry {
  meta: ArticleMeta;
  load: () => Promise<{ default: ComponentType }>;
}

const registry: ArticleEntry[] = [
  {
    meta: factVsStory,
    load: () => import("../../../content/articles/fact-vs-story.mdx"),
  },
  {
    meta: whatIsAMechanism,
    load: () => import("../../../content/articles/what-is-a-mechanism.mdx"),
  },
  {
    meta: whatIsIndecision,
    load: () => import("../../../content/articles/what-is-indecision.mdx"),
  },
  {
    meta: whyWeFight,
    load: () => import("../../../content/articles/why-we-fight.mdx"),
  },
  {
    meta: whyIBlameHim,
    load: () => import("../../../content/articles/why-i-blame-him.mdx"),
  },
];

/** Hebrew labels for the three content mechanisms. */
export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  relationships: "יחסים",
  existence: "קיום",
  identity: "זהות",
};

/** All article metadata, for index/listing pages. */
export function getAllArticles(): ArticleMeta[] {
  return registry.map((entry) => entry.meta);
}

/** Slugs only — used by generateStaticParams. */
export function getArticleSlugs(): string[] {
  return registry.map((entry) => entry.meta.slug);
}

/**
 * Load a single article's metadata plus its rendered MDX component.
 * Returns null when the slug is unknown.
 */
export async function getArticle(
  slug: string,
): Promise<{ meta: ArticleMeta; Content: ComponentType } | null> {
  const entry = registry.find((item) => item.meta.slug === slug);
  if (!entry) return null;

  const mod = await entry.load();
  return { meta: entry.meta, Content: mod.default };
}
