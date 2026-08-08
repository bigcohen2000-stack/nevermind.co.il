import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { Eyebrow } from "@/components/ui/editorial";
import { CATEGORY_LABELS, getAllArticles } from "@/lib/content/articles";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";

export const metadata: Metadata = {
  title: "מאמרים",
  description: "ניתוח לוגי בכתב. הפרדה בין עובדה לבין סיפור, ללא דרמה.",
  alternates: {
    canonical: "https://nevermind.co.il/articles",
  },
  ...shareImageMetadata("ניתוח לוגי, מנגנון אחר מנגנון."),
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מאמרים", path: "/articles" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />
      {/* 1 — HERO (ink) ----------------------------------------------------- */}
      <section aria-labelledby="articles-hero-title" className="band-dark">
        <span
          aria-hidden="true"
          className="watermark bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]"
        >
          מאמרים
        </span>
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>מאמרים</Eyebrow>
          <h1
            id="articles-hero-title"
            className="mt-5 text-fluid-display font-semibold leading-[1.05] tracking-tight"
          >
            ניתוח לוגי, מנגנון אחר מנגנון.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
            הפרדה בין עובדה לבין סיפור. כל מאמר מפרק מנגנון אחד עד לשורשו.
          </p>
        </div>
      </section>

      {/* 2 — HOW ARTICLES ARE ORGANIZED (paper) ---------------------------- */}
      <section
        aria-labelledby="articles-org-title"
        className="band-paper border-b border-foreground/10"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <Eyebrow>איך התוכן מאורגן</Eyebrow>
          <h2
            id="articles-org-title"
            className="mt-3 text-fluid-title font-semibold tracking-tight"
          >
            לפי מנגנונים, לא לפי רגשות.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed">
            כל מאמר משויך לאחד משלושה מנגנונים. הרגש והדרמה הם רק התוצאה הגלויה.
            המאמר עוסק במבנה שמייצר אותם.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {(["relationships", "existence", "identity"] as const).map((key) => (
              <li key={key} className="text-foreground/80">
                {CATEGORY_LABELS[key]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — ARTICLES LIST (background, editorial cards) ------------------- */}
      <section
        aria-labelledby="articles-list-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="articles-list-title"
              className="text-fluid-title font-semibold tracking-tight"
            >
              כל המאמרים
            </h2>
            <span className="text-sm text-muted">{articles.length} מאמרים</span>
          </div>

          {/* Numbered editorial index — reads like a table of contents. */}
          <ol className="mt-12 border-t border-foreground/10">
            {articles.map((article, i) => (
              <li key={article.slug} className="border-b border-foreground/10">
                <Link
                  href={`/articles/${article.slug}`}
                  className="row-link group grid grid-cols-[auto_1fr] gap-x-5 py-8 sm:gap-x-8 sm:py-10"
                >
                  <span
                    aria-hidden="true"
                    className="text-2xl font-semibold leading-none tracking-tight text-foreground/20 transition-colors duration-200 group-hover:text-action/40 sm:text-3xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="block text-sm text-muted">
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="mt-2 block text-xl font-semibold tracking-tight transition-colors duration-200 group-hover:text-action lg:text-2xl">
                      {article.title}
                    </span>
                    <span className="mt-3 block max-w-prose leading-relaxed text-foreground/80">
                      {article.description}
                    </span>
                    <span className="mt-5 inline-block text-sm font-medium text-action">
                      קראו ←
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <NewsletterSignup source="articles" />
    </main>
  );
}
