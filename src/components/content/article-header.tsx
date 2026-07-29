import Link from "next/link";

/**
 * ArticleHeader — premium ink title strip for an article detail page.
 *
 * Deep-ink band (with the shared layered glow) carrying a quiet breadcrumb,
 * category eyebrow, large title, and description. RTL, right-aligned, tokens
 * only. `isPremium` renders a text-only label when relevant — metadata display,
 * not a gate; nothing is ever hidden.
 */
interface ArticleHeaderProps {
  title: string;
  description: string;
  categoryLabel: string;
  isPremium?: boolean;
}

export function ArticleHeader({
  title,
  description,
  categoryLabel,
  isPremium = false,
}: ArticleHeaderProps) {
  return (
    <section aria-labelledby="article-title" className="band-dark">
      <span
        aria-hidden="true"
        className="watermark bottom-[-1.5rem] start-[-0.5rem] text-[5rem] text-background/[0.04] sm:text-[7rem] lg:text-[9rem]"
      >
        {categoryLabel}
      </span>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
        <nav aria-label="פירורי לחם" className="text-sm">
          <Link
            href="/articles"
            className="text-background/70 no-underline transition-colors duration-200 hover:text-background hover:no-underline"
          >
            מאמרים
          </Link>
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium tracking-wide text-muted">
            {categoryLabel}
          </span>
          {isPremium && (
            <span className="rounded-full border border-background/30 px-3 py-0.5 text-xs text-background/80">
              לחברים
            </span>
          )}
        </div>

        <h1
          id="article-title"
          className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl"
        >
          {title}
        </h1>

        <p className="mt-6 max-w-prose text-lg leading-relaxed text-background/80">
          {description}
        </p>
      </div>
    </section>
  );
}

export default ArticleHeader;
