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
        className="watermark bottom-[-1.5rem] start-[-0.5rem] text-[5rem] text-foreground/[0.04] sm:text-[7rem] lg:text-[9rem]"
      >
        {categoryLabel}
      </span>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
        <nav aria-label="פירורי לחם" className="text-sm">
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0 text-foreground/70">
            <li>
              <Link
                href="/"
                className="no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
              >
                בית
              </Link>
            </li>
            <li aria-hidden="true" className="text-foreground/40">
              /
            </li>
            <li>
              <Link
                href="/articles"
                className="no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
              >
                מאמרים
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium tracking-wide text-muted">
            {categoryLabel}
          </span>
          {isPremium && (
            <span className="rounded-full border border-foreground/30 px-3 py-0.5 text-xs text-foreground/80">
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

        <div
          className="mt-6 max-w-prose border border-foreground/15 bg-foreground/[0.04] p-4 sm:p-5"
          data-ai-hint="tldr"
        >
          <p className="text-xs font-medium tracking-wide text-action">בקצרה</p>
          <p className="mt-2 text-base leading-relaxed text-foreground/85 sm:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ArticleHeader;
