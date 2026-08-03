import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { getAllArticles } from "@/lib/content/articles";
import { BOOK_IN_PROGRESS } from "@/lib/content/offers";
import { shareImageMetadata, shareOgImage } from "@/lib/og/share-image";
import { getSpotifyShowUrl } from "@/lib/podcast/links";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const BOOKS_OG_TITLE = "אין חנות. יש מה שפתוח.";

export const metadata: Metadata = {
  title: "תכנים וספרים",
  description:
    "ספר אהבה ב-20 עמודים בתוספת לפגישה פרונטלית, ומאמרים, וידאו ומושגים שכבר פתוחים באתר.",
  alternates: {
    canonical: "https://nevermind.co.il/books",
  },
  openGraph: {
    title: "תכנים וספרים | NeverMinde",
    description:
      "ספר אהבה ב-20 עמודים בתוספת לפגישה פרונטלית, ומאמרים, וידאו ומושגים שכבר פתוחים באתר.",
    url: "https://nevermind.co.il/books",
    type: "website",
    images: shareOgImage(BOOKS_OG_TITLE),
  },
  twitter: shareImageMetadata(BOOKS_OG_TITLE).twitter,
};

const OPEN_PATHS = [
  {
    href: "/articles",
    label: "מאמרים",
    body: "ניתוח לוגי בכתב. מנגנון אחר מנגנון.",
  },
  {
    href: "/videos",
    label: "וידאו",
    body: "ספריית סרטונים לפי נושא.",
  },
  {
    href: "/search",
    label: "חיפוש",
    body: "חיפוש חופשי בתוכן הווידאו והמושגים.",
  },
  {
    href: "/concepts",
    label: "מושגים",
    body: "מפת נושאים וקישור לסרטונים.",
  },
] as const;

export default function BooksPage() {
  const articles = getAllArticles();
  const spotifyUrl = getSpotifyShowUrl();

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "תכנים וספרים",
    description:
      "ספר אהבה ב-20 עמודים בתוספת לפגישה פרונטלית, ומאמרים, וידאו ומושגים שכבר פתוחים באתר.",
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
          תכנים
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>תכנים וספרים</Eyebrow>
          <h1
            id="books-hero-title"
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            אין חנות.
            <br />
            יש מה שפתוח.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
            ספר אחד שאפשר לקבל בפגישה פרונטלית. שאר התוכן שכבר קיים באתר:
            מאמרים, וידאו, מושגים וחיפוש.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="books-book-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <Eyebrow>ספר</Eyebrow>
          <div className="mt-4 flex items-start gap-4">
            <span
              className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-foreground/15 bg-foreground/[0.03]"
              aria-hidden="true"
            >
              <BookOpen className="h-6 w-6 text-action" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2
                id="books-book-title"
                className="text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                {BOOK_IN_PROGRESS.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {BOOK_IN_PROGRESS.statusLabel}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-prose leading-relaxed text-foreground/80">
            {BOOK_IN_PROGRESS.body}
          </p>

          <div className="mt-10 border border-foreground/15 bg-foreground/[0.02] p-6 sm:p-8">
            <p className="text-sm font-medium tracking-wide text-muted">
              מחיר הספר
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {BOOK_IN_PROGRESS.priceLabel}
            </p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/75">
              {BOOK_IN_PROGRESS.priceNote}. אין סליקה באתר.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={buildWhatsAppHref(
                  BOOK_IN_PROGRESS.meetingWhatsappText ??
                    BOOK_IN_PROGRESS.whatsappText,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                לקבל את הספר בפגישה
              </a>
              <a
                href={buildWhatsAppHref(BOOK_IN_PROGRESS.whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                לשאול על הספר
              </a>
              <Link href="/paths" className="link-arrow text-sm sm:ms-1">
                למסלולי פגישה ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="books-open-title"
        className="band-paper border-y border-foreground/10"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <Eyebrow>מה שכבר פתוח</Eyebrow>
          <h2
            id="books-open-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            תוכן שכבר נמצא באתר.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed">
            אם חיפשתם ספרים או קורסים שעדיין לא יצאו, אפשר להתחיל כאן. זה מה
            שזמין עכשיו.
          </p>

          <ul className="mt-12 divide-y divide-foreground/10 border-y border-foreground/10">
            {OPEN_PATHS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="row-link group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-action lg:text-xl">
                    {item.label}
                  </span>
                  <span className="max-w-prose text-sm leading-relaxed text-foreground/70 sm:text-end">
                    {item.body}
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="row-link group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-action lg:text-xl">
                  פודקאסט מרפסת
                </span>
                <span className="max-w-prose text-sm leading-relaxed text-foreground/70 sm:text-end">
                  האזנה בספוטיפיי. חופשי.
                </span>
              </a>
            </li>
          </ul>

          {articles.length > 0 ? (
            <div className="mt-14">
              <h3 className="text-lg font-semibold tracking-tight lg:text-xl">
                מאמרים שפורסמו
              </h3>
              <ol className="mt-6 border-t border-foreground/10">
                {articles.map((article, i) => (
                  <li
                    key={article.slug}
                    className="border-b border-foreground/10"
                  >
                    <Link
                      href={`/articles/${article.slug}`}
                      className="row-link group grid grid-cols-[auto_1fr] gap-x-5 py-5"
                    >
                      <span
                        aria-hidden="true"
                        className="text-sm font-semibold text-foreground/25"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-medium tracking-tight transition-colors duration-200 group-hover:text-action">
                        {article.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-6">
                <Link href="/articles" className="link-arrow">
                  לכל המאמרים ←
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="books-not-yet-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
          <Eyebrow>מה עדיין לא כאן</Eyebrow>
          <h2
            id="books-not-yet-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            בלי רשימת קורסים ריקה.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
            אין כאן קטלוג קורסים או כותרים שלא פורסמו. אזור החברים מתוכנן ועדיין
            אינו פעיל. לשיחה או מסלול עבודה: תיאום או יצירת קשר.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/members" className="link-arrow">
              לאזור החברים ←
            </Link>
            <Link href="/paths" className="link-arrow">
              למסלולים ←
            </Link>
            <Link href="/booking" className="link-arrow">
              לתיאום ←
            </Link>
            <Link href="/contact" className="link-arrow">
              ליצירת קשר ←
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
