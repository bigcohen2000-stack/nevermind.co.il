import "server-only";

import { extractCuratedConcepts } from "@/lib/concepts/quality";
import {
  CATEGORY_LABELS,
  getAllArticles,
  type ArticleCategory,
  type ArticleMeta,
} from "@/lib/content/articles";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function uniqueTerms(terms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of terms) {
    const t = raw.trim();
    if (!t) continue;
    const key = normalize(t);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/**
 * Bridge terms from an article to the video/concept index.
 * Category label, optional relatedTerms, and curated concepts found in copy.
 */
export function getArticleBridgeTerms(article: ArticleMeta): string[] {
  const curated = extractCuratedConcepts(
    article.title,
    article.description,
    article.relatedTerms ?? [],
    8,
  );
  return uniqueTerms([
    CATEGORY_LABELS[article.category],
    ...(article.relatedTerms ?? []),
    ...curated,
  ]);
}

function articleHaystack(article: ArticleMeta): string {
  return normalize(
    [
      article.title,
      article.description,
      article.slug,
      CATEGORY_LABELS[article.category],
      article.category,
      ...(article.relatedTerms ?? []),
    ].join(" "),
  );
}

function scoreArticleAgainstTerms(
  article: ArticleMeta,
  terms: string[],
): number {
  if (terms.length === 0) return 0;
  const haystack = articleHaystack(article);
  let score = 0;
  for (const term of terms) {
    const t = normalize(term);
    if (!t) continue;
    if (haystack.includes(t)) score += t.length >= 4 ? 2 : 1;
  }
  return score;
}

/** Articles that share concept/category language with the given terms. */
export function getRelatedArticlesForTerms(
  terms: string[],
  options?: { excludeSlug?: string; limit?: number },
): ArticleMeta[] {
  const limit = options?.limit ?? 4;
  const excludeSlug = options?.excludeSlug;
  const cleaned = uniqueTerms(terms);

  return getAllArticles()
    .filter((article) => article.slug !== excludeSlug)
    .map((article) => ({
      article,
      score: scoreArticleAgainstTerms(article, cleaned),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.article);
}

export function getRelatedArticlesForCategory(
  category: ArticleCategory,
  excludeSlug?: string,
  limit = 3,
): ArticleMeta[] {
  const sameCategory = getAllArticles().filter(
    (article) =>
      article.category === category && article.slug !== excludeSlug,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fillers = getRelatedArticlesForTerms(
    [CATEGORY_LABELS[category]],
    { excludeSlug, limit: limit - sameCategory.length },
  ).filter((a) => !sameCategory.some((s) => s.slug === a.slug));

  return [...sameCategory, ...fillers].slice(0, limit);
}

async function tryCreateClient() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

/**
 * Rank videos by overlap with article bridge terms.
 * Concept links score highest, then title matches. No fabricated rows.
 */
export async function getRelatedVideosForArticle(
  article: ArticleMeta,
  limit = 6,
): Promise<Video[]> {
  const terms = getArticleBridgeTerms(article).slice(0, 6);
  if (terms.length === 0) return [];

  const supabase = await tryCreateClient();
  if (!supabase) return [];

  const scored = new Map<string, number>();
  const bump = (id: string, points: number) => {
    scored.set(id, (scored.get(id) ?? 0) + points);
  };

  await Promise.all(
    terms.map(async (term) => {
      const pattern = `%${term}%`;
      const [{ data: concepts }, { data: byTitle }] = await Promise.all([
        supabase
          .from("concepts")
          .select("id, name")
          .ilike("name", pattern)
          .limit(12),
        supabase
          .from("videos")
          .select("id")
          .ilike("title", pattern)
          .limit(16),
      ]);

      for (const row of byTitle ?? []) {
        bump(row.id, 30);
      }

      const conceptIds = (concepts ?? []).map((c) => c.id);
      if (conceptIds.length === 0) return;

      const { data: links } = await supabase
        .from("video_concepts")
        .select("video_id, concepts(name)")
        .in("concept_id", conceptIds)
        .limit(40);

      for (const row of links ?? []) {
        const join = row.concepts as
          | { name: string }
          | { name: string }[]
          | null;
        const name = Array.isArray(join) ? join[0]?.name : join?.name;
        const exact =
          Boolean(name) &&
          name!.trim().localeCompare(term, "he", { sensitivity: "base" }) ===
            0;
        bump(row.video_id, exact ? 100 : 70);
      }
    }),
  );

  const rankedIds = [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit);

  if (rankedIds.length === 0) return [];

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .in("id", rankedIds);

  if (!videos?.length) return [];

  const byId = new Map(videos.map((v) => [v.id, v]));
  const ordered = rankedIds
    .map((id) => byId.get(id))
    .filter((v): v is Video => Boolean(v));

  const { redactMembersOnlySources } = await import(
    "@/lib/videos/sanitize-public"
  );
  return redactMembersOnlySources(ordered);
}
