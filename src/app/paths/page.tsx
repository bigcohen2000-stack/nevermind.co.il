import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { PATH_OFFERS, PROCESS_STEPS } from "@/lib/content/offers";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "מסלולים",
  description:
    "ליווי שבועי, ייעוץ נקודתי, פודקאסט מרפסת וקבוצת למידה. בלי מחירים באתר. פרטים בוואטסאפ.",
};

export default function PathsPage() {
  return (
    <main className="w-full text-start">
      <section aria-labelledby="paths-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[12rem]">
          מסלולים
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>איך זה עובד בפועל</Eyebrow>
          <h1
            id="paths-hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            ארבעה מסלולים.
            <br />
            בחר מה שנכון עכשיו.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
            כל מסלול מפרק משהו אחר. אין כאן מחירים. אם זה מדבר אליך, ממשיכים
            בוואטסאפ.
          </p>
          <div className="mt-10">
            <Link href="/contact" className="btn btn-primary">
              ליצירת קשר
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="paths-list-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>המסלולים</Eyebrow>
          <h2
            id="paths-list-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            מה זמין עכשיו.
          </h2>

          <ul className="mt-14 grid gap-6 lg:grid-cols-2">
            {PATH_OFFERS.map((path) => (
              <li key={path.id} className="card flex h-full flex-col p-8">
                <h3 className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {path.title}
                </h3>
                <p className="mt-4 flex-1 leading-relaxed text-foreground/80">
                  {path.body}
                </p>
                <p className="mt-5 text-sm text-muted">
                  {path.tags.join(" · ")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={buildWhatsAppHref(path.whatsappText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    בוא נבדוק
                  </a>
                  {path.externalHref ? (
                    <a
                      href={path.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      {path.externalLabel ?? "קישור"}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="paths-process-title" className="band-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>מה קורה בפועל</Eyebrow>
          <h2
            id="paths-process-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            שלושה שלבים. בלי הפתעות.
          </h2>
          <ol className="mt-14 grid gap-8 lg:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <li key={step.index}>
                <span className="text-4xl font-semibold tracking-tight text-foreground/15">
                  {step.index}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-foreground/80">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band-dark">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            לא בטוח מה מתאים?
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-background/80">
            שיחת היכרות קצרה. בלי התחייבות. בודקים אם זה מתאים, ואם לא, גם זה
            מידע.
          </p>
          <div className="mt-8">
            <Link href="/contact" className="btn btn-primary">
              מלא פרטים
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
