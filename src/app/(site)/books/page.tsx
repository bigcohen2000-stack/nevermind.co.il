import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { BooksArchiveMatrixSection } from "@/components/books/books-archive-matrix-section";
import { BooksArchiveMetrics } from "@/components/books/books-archive-metrics";
import {
  buildArticleMatrixRows,
  buildVideoMatrixRows,
} from "@/components/books/books-investigation-matrix";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { getBooksLoveVideos } from "@/lib/books/love-videos";
import { getAllArticles } from "@/lib/content/articles";
import { BOOKS_HERO, BOOKS_LOVE_CONCEPT } from "@/lib/content/books-page";
import { BOOK_IN_PROGRESS } from "@/lib/content/offers";
import { shareImageMetadata, shareOgImage } from "@/lib/og/share-image";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const BOOKS_OG_TITLE = BOOK_IN_PROGRESS.title;
/** Brand OG for JSON-LD only. No cover image in the page UI. */
const BOOKS_SCHEMA_IMAGE = "https://nevermind.co.il/og-books.png";

export const metadata: Metadata = {
  title: "ספריית כתבים ואהבה",
  description:
    "ספר אהבה ב-20 עמודים, ולידו ארכיון סרטונים ומאמרים על אהבה כמנגנון. מדדים יבשים, בלי חנות.",
  alternates: {
    canonical: "https://nevermind.co.il/books",
  },
  openGraph: {
    title: "ספריית כתבים ואהבה | NeverMinde",
    description:
      "ספר אהבה ב-20 עמודים, ולידו ארכיון סרטונים ומאמרים על אהבה כמנגנון.",
    url: "https://nevermind.co.il/books",
    type: "website",
    images: shareOgImage(BOOKS_OG_TITLE),
  },
  twitter: shareImageMetadata(BOOKS_OG_TITLE).twitter,
};

function loveRelatedArticles() {
  return getAllArticles().filter((a) => {
    if (a.category === "relationships") return true;
    const blob = `${a.title} ${a.description} ${(a.relatedTerms ?? []).join(" ")}`;
    return /אהבה|יחסים|האשמה|קרבה/.test(blob);
  });
}

export default async function BooksPage() {
  const love = await getBooksLoveVideos(28).catch(() => ({
    videos: [],
    bookTalkCount: 0,
    relatedCount: 0,
    total: 0,
  }));
  const articles = loveRelatedArticles();
  const videoRows = buildVideoMatrixRows(love.videos);
  const articleRows = buildArticleMatrixRows(articles);
  const rows = [...videoRows, ...articleRows];

  const openVideoCount = love.videos.filter((v) => !isMembersOnlyVideo(v)).length;
  const clubVideoCount = love.videos.length - openVideoCount;

  const filterConcepts = Array.from(
    new Set([
      BOOKS_LOVE_CONCEPT,
      "יחסים",
      ...articles.flatMap((a) => a.relatedTerms ?? []).slice(0, 8),
    ]),
  );

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ספריית כתבים ואהבה",
    description:
      "ספר אהבה ב-20 עמודים וארכיון חקירת אהבה: סרטונים ומאמרים עם מדדים יבשים.",
    url: "https://nevermind.co.il/books",
    isPartOf: {
      "@type": "WebSite",
      name: "NeverMinde",
      url: "https://nevermind.co.il",
    },
    hasPart: {
      "@type": "Book",
      name: BOOK_IN_PROGRESS.title,
      inLanguage: "he",
      image: BOOKS_SCHEMA_IMAGE,
      author: {
        "@type": "Person",
        name: "יקיר כהן",
      },
      offers: {
        "@type": "Offer",
        price: BOOK_IN_PROGRESS.meetingAddonIls,
        priceCurrency: "ILS",
        description: BOOK_IN_PROGRESS.priceNote,
        availability: "https://schema.org/InStock",
      },
    },
  };

  return (
    <main className="w-full text-start">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />

      <section aria-labelledby="books-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          אהבה
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <Eyebrow onDark>// ARCHIVE_TEXT_REPOSITORY</Eyebrow>
              <h1
                id="books-hero-title"
                className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
              >
                {BOOKS_HERO.titleLine1}
                <br />
                {BOOKS_HERO.titleLine2}
              </h1>
              <p className="mt-5 max-w-prose text-sm leading-relaxed text-foreground/75 sm:text-base">
                ספר אחד מודפס. לידו ארכיון סרטונים ומאמרים על אהבה כמנגנון. בלי
                דרמה, בלי תגיות שיווקיות.
              </p>
            </div>
            <BooksArchiveMetrics
              videoCount={love.total}
              articleCount={articles.length}
              openVideoCount={openVideoCount}
              clubVideoCount={clubVideoCount}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="books-book-title"
        className="border-b border-foreground/10 bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:py-20">
          <div className="border border-foreground/15 bg-foreground/[0.02] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-6 border-b border-foreground/10 pb-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border border-foreground/15 bg-background"
                  aria-hidden="true"
                >
                  <BookOpen className="h-6 w-6 text-action" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                    <span className="font-bold text-action">[#BOOK-LOVE-20]</span>
                    <span>20 עמודים</span>
                    <span>{BOOK_IN_PROGRESS.statusLabel}</span>
                  </div>
                  <h2
                    id="books-book-title"
                    className="text-2xl font-semibold tracking-tight lg:text-3xl"
                  >
                    {BOOK_IN_PROGRESS.title}
                  </h2>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/75">
                    {BOOK_IN_PROGRESS.body}
                  </p>
                </div>
              </div>
              <a
                href={buildWhatsAppHref(
                  BOOK_IN_PROGRESS.meetingWhatsappText ??
                    BOOK_IN_PROGRESS.whatsappText,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center bg-action px-4 py-2 font-mono text-xs font-bold text-background hover:bg-action/90"
              >
                בדיקת גישה לספר ←
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="font-mono text-xs text-muted">
                מחיר:{" "}
                <span className="font-bold text-foreground tabular-nums">
                  {BOOK_IN_PROGRESS.priceLabel}
                </span>
                {BOOK_IN_PROGRESS.priceNote
                  ? `, ${BOOK_IN_PROGRESS.priceNote}`
                  : null}
              </p>
              <a
                href={buildWhatsAppHref(BOOK_IN_PROGRESS.whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                לשאול על הספר
              </a>
              <Link href="/paths" className="link-arrow text-sm">
                למסלולי פגישה ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="books-matrix-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:py-20">
          <Eyebrow>חקירת אהבה</Eyebrow>
          <h2
            id="books-matrix-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            מטריצת סרטונים ומאמרים
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/75">
            שורות מנתוני אמת במאגר. סרטוני מועדון מוצגים עם נעילה. אין חשיפת
            מקור יוטיוב לאורחים.
          </p>

          <p className="mt-8 font-mono text-xs uppercase text-muted">
            // CHAPTER_INDEX
          </p>
          <div className="mt-4">
            {rows.length > 0 ? (
              <BooksArchiveMatrixSection
                rows={rows}
                concepts={filterConcepts}
              />
            ) : (
              <p className="border border-dashed border-foreground/15 p-6 text-sm text-muted">
                עדיין אין סרטונים או מאמרים מקושרים לאהבה במאגר.{" "}
                <Link href="/videos" className="text-action underline-offset-2 hover:underline">
                  לספריית הווידאו
                </Link>
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link
              href={`/search?q=${encodeURIComponent(BOOKS_LOVE_CONCEPT)}`}
              className="link-arrow"
            >
              חיפוש: אהבה ←
            </Link>
            <Link href="/videos" className="link-arrow">
              לכל הסרטונים ←
            </Link>
            <Link href="/members" className="link-arrow">
              לאזור החברים ←
            </Link>
            <Link href="/articles" className="link-arrow">
              לכל המאמרים ←
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
