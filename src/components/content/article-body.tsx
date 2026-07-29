import type { ComponentType } from "react";

/**
 * ArticleBody — reading container that styles rendered MDX output.
 *
 * Styling is applied with Tailwind child selectors on the wrapper, so the MDX
 * files and the global mdx-components map stay untouched. Tokens only; RTL-aware
 * list indentation. Polish v2 adds a lead paragraph and a quiet accent on h2
 * headings for editorial rhythm.
 *
 * The leading `# title` heading in each MDX file duplicates the hero title, so
 * the first-level heading is hidden here (the ink header carries the real <h1>).
 */
export function ArticleBody({ content: Content }: { content: ComponentType }) {
  return (
    <div
      className={[
        "max-w-none text-foreground",
        // The MDX h1 duplicates the page hero title — hide it.
        "[&_h1]:hidden",
        // Lead paragraph (first paragraph after the hidden h1) reads larger,
        // with an editorial drop cap on its first letter (floats to the start).
        "[&_h1+p]:text-lg [&_h1+p]:leading-[1.85] [&_h1+p]:text-foreground",
        "[&_h1+p]:first-letter:float-right [&_h1+p]:first-letter:me-3 [&_h1+p]:first-letter:mt-1 [&_h1+p]:first-letter:text-[3.4rem] [&_h1+p]:first-letter:font-semibold [&_h1+p]:first-letter:leading-[0.78] [&_h1+p]:first-letter:tracking-tight [&_h1+p]:first-letter:text-foreground",
        // Pull quote — red rule on the inline-start (right in RTL).
        "[&_blockquote]:my-10 [&_blockquote]:border-s-[3px] [&_blockquote]:border-action [&_blockquote]:ps-6 [&_blockquote]:text-xl [&_blockquote]:font-semibold [&_blockquote]:leading-snug [&_blockquote]:tracking-tight [&_blockquote]:text-foreground",
        "[&_blockquote_p]:my-0",
        // Headings, with a quiet red accent bar before h2.
        "[&_h2]:relative [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:ps-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h2]:before:absolute [&_h2]:before:bottom-1 [&_h2]:before:top-1 [&_h2]:before:start-0 [&_h2]:before:w-[3px] [&_h2]:before:rounded-full [&_h2]:before:bg-action/70 [&_h2]:before:content-['']",
        "[&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
        // Body copy
        "[&_p]:my-5 [&_p]:leading-[1.85]",
        // Lists (RTL: markers sit on the inline-start / right side)
        "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-6",
        "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-6",
        "[&_li]:my-2 [&_li]:leading-relaxed [&_li]:marker:text-muted",
        // Emphasis + inline links
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_a]:text-action [&_a]:underline",
        // Quiet hairline separator if an article uses ---
        "[&_hr]:my-12 [&_hr]:border-foreground/15",
      ].join(" ")}
    >
      <Content />
    </div>
  );
}

export default ArticleBody;
