import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow, Watermark } from "@/components/ui/editorial";

export const metadata: Metadata = {
  title: "וידאו והרצאות — NeverMinde",
  description:
    "אותם מנגנונים, בקול. דרך נוספת להתבונן במבנה. המאמרים נשארים מקור המסגרת.",
};

/* -------------------------------------------------------------------------- */

interface VideoCategory {
  label: string;
  body: string;
}

const categories: VideoCategory[] = [
  { label: "שיחות", body: "שיחות פתוחות סביב מקרים יומיומיים." },
  { label: "הרצאות", body: "הרצאות מסודרות, מנגנון אחר מנגנון." },
  { label: "מנגנונים", body: "פירוק ויזואלי של שלושת המנגנונים." },
  { label: "שאלות נפוצות", body: "תשובות קצרות לשאלות שחוזרות." },
];

/* -------------------------------------------------------------------------- */

export default function VideosPage() {
  return (
    <main className="w-full text-start">
      {/* 1 — HERO (ink, large media frame) -------------------------------- */}
      <section aria-labelledby="videos-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[13rem]">
          הרצאות
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>וידאו והרצאות</Eyebrow>
              <h1
                id="videos-hero-title"
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                אותו ניתוח,
                <br />
                בקול.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
                אותם מנגנונים, בצורה מדוברת. דרך נוספת לראות את אותו מבנה. כרגע
                זהו מציין מקום בלבד — אין כאן נגן אמיתי.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="relative">
                <div className="media-frame flex aspect-video w-full items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-background/40">
                    <span
                      aria-hidden="true"
                      className="ms-1 h-0 w-0 border-y-[12px] border-s-[20px] border-y-transparent border-s-background"
                    />
                  </span>
                </div>
                <span className="card relative z-20 mt-[-2rem] block w-max px-4 py-2 text-sm text-foreground shadow-float lg:absolute lg:-bottom-5 lg:-start-5 lg:mt-0">
                  בקרוב — הרצאה ראשונה
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — VIDEO CATEGORIES (paper, editorial cards) -------------------- */}
      <section
        aria-labelledby="videos-categories-title"
        className="band-paper border-b border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>סוגי תוכן</Eyebrow>
            <h2
              id="videos-categories-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              אותם מנגנונים, מזוויות שונות.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed">
              כל קטגוריה מתבוננת באותו מבנה בדרך אחרת. התוכן עוד לא עלה.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.label}>
                <div className="card flex h-full flex-col overflow-hidden">
                  {/* Mini media placeholder */}
                  <div className="flex aspect-video items-center justify-center border-b border-foreground/10 bg-paper">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/30">
                      <span
                        aria-hidden="true"
                        className="ms-0.5 h-0 w-0 border-y-[7px] border-s-[11px] border-y-transparent border-s-foreground/60"
                      />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-lg font-semibold tracking-tight">
                      {c.label}
                    </span>
                    <span className="mt-2 flex-1 leading-relaxed text-foreground/80">
                      {c.body}
                    </span>
                    <span className="mt-5 text-sm text-muted">בקרוב</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — PHILOSOPHY (ink, asymmetric) --------------------------------- */}
      <section aria-labelledby="videos-philosophy-title" className="band-dark">
        <Watermark className="top-[-1rem] end-[-0.5rem] text-[5rem] text-background/[0.045] sm:text-[7rem] lg:text-[10rem]">
          מבנה
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>למה וידאו</Eyebrow>
              <h2
                id="videos-philosophy-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                וידאו אינו בידור.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-lg leading-relaxed text-background/80">
                הווידאו כאן אינו נועד לבדר או להלהיב. הוא דרך נוספת להתבונן
                במבנה — לראות את אותו מנגנון פועל בזמן אמת, בקול ובקצב אחר.
              </p>
              <p className="mt-5 max-w-prose leading-relaxed text-background/70">
                המאמרים נשארים מקור המסגרת. הווידאו מלווה אותם, לא מחליף אותם.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — CTA (background, designed block) → /articles + /members ------ */}
      <section
        aria-labelledby="videos-cta-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="videos-cta-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-7 lg:text-4xl"
            >
              עד שהווידאו עולה, התחילו מהמסגרת.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href="/articles" className="btn btn-primary">
                לקריאת המאמרים
              </Link>
              <Link href="/members" className="btn btn-secondary">
                לאזור החברים
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
