import "server-only";

import {
  CATEGORY_LABELS,
  getAllArticles,
  type ArticleMeta,
} from "@/lib/content/articles";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchesArticle(meta: ArticleMeta, q: string): boolean {
  const needle = normalize(q);
  if (!needle) return false;

  const categoryLabel = CATEGORY_LABELS[meta.category];
  const haystack = [
    meta.title,
    meta.description,
    meta.slug,
    meta.category,
    categoryLabel,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function searchArticles(query: string, limit = 12): ArticleMeta[] {
  const q = query.trim();
  if (!q) return [];
  return getAllArticles()
    .filter((meta) => matchesArticle(meta, q))
    .slice(0, limit);
}
