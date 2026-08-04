import type { Metadata } from "next";
import Link from "next/link";

import { ThoughtDeconstructor } from "@/components/booking/thought-deconstructor";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow } from "@/components/ui/editorial";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";

export const metadata: Metadata = {
  title: "מפרק מחשבות",
  description:
    "כותבים מחשבה, מפרידים עובדה מסיפור, ושולחים בקשה לתיאום שיחה ב-NeverMind. הכנה לפני הפגישה. אין סליקה באתר.",
  alternates: {
    canonical: "https://nevermind.co.il/booking",
  },
  ...shareImageMetadata("מפרק מחשבות."),
};

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function BookingPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const source = from?.trim() || "thought-deconstructor";
  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מפרק מחשבות", path: "/booking" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />
      <section
        aria-labelledby="booking-hero-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <Eyebrow>לפני שיחה</Eyebrow>
          <h1
            id="booking-hero-title"
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            מפרק מחשבות
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-foreground/80 sm:text-lg">
            כותבים מה שמעסיק. מפרידים מה שקרה ממה שמספרים עליו. אחר כך שולחים
            בקשה לתיאום. בלי מוטיבציה ובלי דרמה.
          </p>

          <ol className="mt-8 grid gap-3 text-sm text-foreground/75 sm:grid-cols-3">
            <li className="border border-foreground/12 p-3">
              <span className="block text-xs font-medium tracking-wide text-muted">
                1
              </span>
              <span className="mt-1 block font-medium text-foreground">
                כתיבה
              </span>
            </li>
            <li className="border border-foreground/12 p-3">
              <span className="block text-xs font-medium tracking-wide text-muted">
                2
              </span>
              <span className="mt-1 block font-medium text-foreground">
                עובדה / סיפור
              </span>
            </li>
            <li className="border border-foreground/12 p-3">
              <span className="block text-xs font-medium tracking-wide text-muted">
                3
              </span>
              <span className="mt-1 block font-medium text-foreground">
                שליחה ותיאום
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="deconstructor-title"
        className="border-t border-foreground/10 bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-24">
          <h2 id="deconstructor-title" className="sr-only">
            תרגיל הפירוק
          </h2>
          <ThoughtDeconstructor source={source} />

          <nav
            aria-label="חלופות לתיאום"
            className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-foreground/10 pt-8 text-sm"
          >
            <Link
              href="/paths"
              className="text-foreground/70 no-underline transition hover:text-action hover:no-underline"
            >
              למסלולים ומחירים
            </Link>
            <Link
              href="/contact"
              className="text-foreground/70 no-underline transition hover:text-action hover:no-underline"
            >
              יצירת קשר ישירה
            </Link>
            <Link
              href="/live"
              className="text-foreground/70 no-underline transition hover:text-action hover:no-underline"
            >
              שידור חי
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
