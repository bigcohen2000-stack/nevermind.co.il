import type { Metadata } from "next";
import Link from "next/link";

import { unsubscribeNewsletter } from "@/actions/newsletter";

export const metadata: Metadata = {
  title: "ביטול עדכון במייל",
  description: "ביטול הרשמה לעדכון במייל מאתר NeverMind.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function NewsletterUnsubscribePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  let title = "ביטול עדכון במייל";
  let body = "קישור ביטול חסר או לא תקין.";
  let ok = false;

  if (token) {
    const result = await unsubscribeNewsletter(token);
    if (result.ok) {
      ok = true;
      title = "ההרשמה בוטלה";
      body = result.email
        ? `הסרנו את ${result.email} מרשימת העדכון במייל.`
        : "הסרנו אתכם מרשימת העדכון במייל.";
    } else {
      body = result.error;
    }
  }

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <article className="mx-auto w-full max-w-lg px-4 py-16 sm:py-24">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground/85">
          {body}
        </p>
        <p className="mt-8 text-sm text-muted">
          <Link href="/" className="text-action underline-offset-2 hover:underline">
            חזרה לדף הבית
          </Link>
          {ok ? (
            <>
              {" "}
              ·{" "}
              <Link
                href="/articles"
                className="text-action underline-offset-2 hover:underline"
              >
                מאמרים
              </Link>
            </>
          ) : null}
        </p>
      </article>
    </main>
  );
}
