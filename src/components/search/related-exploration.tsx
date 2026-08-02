import Image from "next/image";
import Link from "next/link";

import { CATEGORY_LABELS, type ArticleMeta } from "@/lib/content/articles";
import { ClubBadge } from "@/components/videos/club-badge";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  getTeaserThumbSrc,
  getWatchHref,
} from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

type RelatedExplorationProps = {
  articles?: ArticleMeta[];
  videos?: Video[];
  concepts?: { name: string }[];
  /** Primary search query for empty-state / "חקור עוד" links. */
  searchQuery?: string;
  /**
   * Which empty lists still render a dry fallback line.
   * Use `true` for both articles and videos.
   */
  showEmpty?: boolean | { articles?: boolean; videos?: boolean };
  className?: string;
};

function SearchMoreLink({ q, label }: { q?: string; label: string }) {
  const href = q?.trim()
    ? `/search?q=${encodeURIComponent(q.trim())}`
    : "/search";
  return (
    <Link
      href={href}
      className="text-foreground underline-offset-4 hover:text-action hover:underline"
    >
      {label}
    </Link>
  );
}

function RelatedVideoRow({ video }: { video: Video }) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });

  return (
    <li>
      <Link
        href={getWatchHref(video)}
        className="group flex gap-3 border border-foreground/10 bg-background p-2.5 no-underline transition hover:border-foreground/25 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <span className="relative aspect-video w-28 shrink-0 overflow-hidden border border-foreground/10 bg-paper sm:w-32">
          <Image
            src={thumb}
            alt={video.title}
            fill
            sizes="128px"
            className="object-cover"
          />
          {gated ? <ClubBadge /> : null}
          {gated ? (
            <span
              className="absolute inset-0 z-[1] flex items-center justify-center bg-black/40"
              aria-label="תוכן לחברים"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 text-background"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <rect x="5" y="11" width="14" height="10" rx="1.5" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1 self-center text-start">
          <span className="block text-sm font-medium leading-snug text-foreground group-hover:text-action sm:text-base">
            {video.title}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Quiet cross-links between articles, videos, and concepts for exploration.
 * Flat thumbs only. No 3D cards on suggestion lists.
 */
export function RelatedExploration({
  articles = [],
  videos = [],
  concepts = [],
  searchQuery,
  showEmpty = false,
  className = "",
}: RelatedExplorationProps) {
  const emptyArticles =
    showEmpty === true ||
    (typeof showEmpty === "object" && Boolean(showEmpty.articles));
  const emptyVideos =
    showEmpty === true ||
    (typeof showEmpty === "object" && Boolean(showEmpty.videos));

  const hasAny =
    articles.length > 0 || videos.length > 0 || concepts.length > 0;
  if (!hasAny && !emptyArticles && !emptyVideos) {
    return null;
  }

  const q = searchQuery?.trim() || concepts[0]?.name || undefined;

  return (
    <aside
      className={[
        "mt-14 space-y-10 border-t border-foreground/10 pt-10",
        className,
      ].join(" ")}
      aria-label="חקירה נוספת"
    >
      {concepts.length > 0 ? (
        <section aria-labelledby="related-concepts-heading">
          <h2
            id="related-concepts-heading"
            className="text-lg font-semibold tracking-tight"
          >
            מושגים קשורים
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {concepts.map((c) => (
              <li key={c.name}>
                <Link
                  href={`/search?q=${encodeURIComponent(c.name)}`}
                  className="inline-flex border border-foreground/15 px-3 py-1.5 text-sm text-foreground/85 transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {articles.length > 0 || emptyArticles ? (
        <section aria-labelledby="related-articles-heading">
          <h2
            id="related-articles-heading"
            className="text-lg font-semibold tracking-tight"
          >
            מאמרים קשורים
          </h2>
          {articles.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="block text-start no-underline hover:no-underline"
                  >
                    <span className="text-xs text-muted">
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="mt-1 block font-medium text-foreground hover:text-action">
                      {article.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              אין עדיין מאמר מותאם. אפשר לעבור אל{" "}
              <Link
                href="/articles"
                className="text-foreground underline-offset-4 hover:text-action hover:underline"
              >
                כל המאמרים
              </Link>
              {" או "}
              <SearchMoreLink q={q} label="לחפש" />.
            </p>
          )}
        </section>
      ) : null}

      {videos.length > 0 || emptyVideos ? (
        <section aria-labelledby="related-videos-heading">
          <h2
            id="related-videos-heading"
            className="text-lg font-semibold tracking-tight"
          >
            סרטונים לחקירה
          </h2>
          {videos.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {videos.map((video) => (
                <RelatedVideoRow key={video.id} video={video} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              אין עדיין סרטון מותאם. אפשר לעבור אל{" "}
              <Link
                href="/videos"
                className="text-foreground underline-offset-4 hover:text-action hover:underline"
              >
                כל הסרטונים
              </Link>
              {" או "}
              <SearchMoreLink q={q} label="לחפש" />.
            </p>
          )}
          {videos.length > 0 && q ? (
            <p className="mt-4 text-sm text-muted">
              <SearchMoreLink q={q} label={`חיפוש נוסף: ${q}`} />
            </p>
          ) : null}
        </section>
      ) : null}
    </aside>
  );
}
