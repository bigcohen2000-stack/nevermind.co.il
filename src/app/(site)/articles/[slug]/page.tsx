import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/content/article-body";
import { ArticleHeader } from "@/components/content/article-header";
import { RelatedExploration } from "@/components/search/related-exploration";
import {
  CATEGORY_LABELS,
  getArticle,
  getArticleSlugs,
} from "@/lib/content/articles";
import {
  getArticleBridgeTerms,
  getRelatedArticlesForCategory,
  getRelatedVideosForArticle,
} from "@/lib/search/related-content";

// Only the known articles are valid routes; everything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return {
    title: article.meta.title,
    description: article.meta.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { meta, Content } = article;
  const bridgeTerms = getArticleBridgeTerms(meta);
  const relatedArticles = getRelatedArticlesForCategory(
    meta.category,
    meta.slug,
    3,
  );
  const relatedVideos = await getRelatedVideosForArticle(meta, 6).catch(
    () => [],
  );
  const relatedConcepts = bridgeTerms.slice(0, 6).map((name) => ({ name }));

  return (
    <main className="w-full text-start">
      <ArticleHeader
        title={meta.title}
        description={meta.description}
        categoryLabel={CATEGORY_LABELS[meta.category]}
        isPremium={meta.isPremium}
      />

      <section className="bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
          <article className="max-w-prose">
            <ArticleBody content={Content} />
          </article>

          {meta.isPremium && (
            <aside className="card mt-16 p-8">
              <p className="text-sm font-medium tracking-wide text-muted">
                אזור החברים
              </p>
              <p className="mt-3 max-w-prose leading-relaxed">
                המשך הניתוח והפירוק המלא של המנגנון זמינים לחברים.
              </p>
              <div className="mt-6">
                <Link href="/members" className="btn btn-primary">
                  לאזור החברים
                </Link>
              </div>
            </aside>
          )}

          <RelatedExploration
            articles={relatedArticles}
            videos={relatedVideos}
            concepts={relatedConcepts}
            searchQuery={CATEGORY_LABELS[meta.category]}
            showEmpty
          />
        </div>
      </section>

      <section className="band-paper border-t border-foreground/10">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-20">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xl font-semibold tracking-tight">המשך חקירה.</p>
            <Link href="/articles" className="btn btn-secondary">
              חזרה לכל המאמרים ←
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
