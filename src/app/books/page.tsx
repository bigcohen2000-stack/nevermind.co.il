import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { CONTENT_ITEMS } from "@/lib/content/offers";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "תכנים וספרים",
  description:
    "ספרים, מאמרים וקורסים בבניה. אפשר לשאול ישירות בוואטסאפ על כל פריט.",
};

export default function BooksPage() {
  return (
    <main className="w-full text-start">
      <section aria-labelledby="books-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[12rem]">
          תכנים
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>מוצרים ותכנים</Eyebrow>
          <h1
            id="books-hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            מה שנמצא בבניה,
            <br />
            ומה שכבר זמין.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
            אין כאן חנות. יש סטטוס עדכני וקישור לשאלה בוואטסאפ על כל פריט.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="books-list-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>קטלוג</Eyebrow>
          <h2
            id="books-list-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            תכנים במעקב.
          </h2>

          <ul className="mt-14 divide-y divide-foreground/10 border-y border-foreground/10">
            {CONTENT_ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold tracking-tight lg:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.statusLabel}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {item.externalHref ? (
                    <a
                      href={item.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      לפתיחה
                    </a>
                  ) : null}
                  <a
                    href={buildWhatsAppHref(item.whatsappText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    יש לי שאלה
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/articles" className="link-arrow">
              למאמרים שכבר פתוחים ←
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
