import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow, Watermark } from "@/components/ui/editorial";

export const metadata: Metadata = {
  title: "חברים — NeverMinde",
  description:
    "אזור החברים מתוכנן ועדיין אינו פעיל. התבוננות מובנית, מנגנונים עמוקים יותר, פחות רעש.",
};

/* -------------------------------------------------------------------------- */
/* Static placeholder for a FUTURE members area. Nothing here is functional.    */
/* No auth, login, gate, payment, forms, or email signup.                       */
/* -------------------------------------------------------------------------- */

interface PreviewCard {
  label: string;
  body: string;
}

const previewCards: PreviewCard[] = [
  { label: "מאמרים עמוקים", body: "ניתוחים מורחבים, מעבר למה שפתוח לכולם." },
  { label: "הרצאות סגורות", body: "הרצאות וידאו השמורות לחברים בלבד." },
  { label: "סדרות תוכן", body: "מסלולים מסודרים, מנגנון אחר מנגנון." },
  { label: "תרגולים / שאלות", body: "תרגול מעשי ושאלות שחוזרות." },
];

const notList = ["אינו טיפול", "אינו מוטיבציה", "אינו בידור", "אינו אימון רגשי"];

const isList = [
  { title: "התבוננות מובנית", body: "מסגרת אחת, חוזרת, לבחינת המציאות." },
  { title: "מנגנונים עמוקים יותר", body: "פירוק מלא של כל מנגנון עד שורשו." },
  { title: "קריאה וצפייה חוזרות", body: "אותו חומר, נקרא ונצפה שוב ושוב." },
  { title: "פחות רעש, יותר מבנה", body: "בלי דרמה. רק מה שקרה ומה שמייצר אותו." },
];

/* -------------------------------------------------------------------------- */

export default function MembersPage() {
  return (
    <main className="w-full text-start">
      {/* 1 — HERO (ink) — planned, not active ----------------------------- */}
      <section aria-labelledby="members-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[13rem]">
          חברים
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-7">
              <Eyebrow onDark>אזור החברים</Eyebrow>
              <h1
                id="members-hero-title"
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                מתוכנן.
                <br />
                עדיין לא פעיל.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
                זהו מציין מקום לאזור החברים העתידי. אין כאן הרשמה, התחברות או
                תשלום. הדף מתאר מה מתוכנן, ותו לא.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="card-dark p-8">
                <p className="text-sm font-medium tracking-wide text-background/60">
                  סטטוס
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  בקרוב
                </p>
                <p className="mt-3 leading-relaxed text-background/70">
                  אזור החברים אינו זמין כעת. בינתיים, כל המסגרת פתוחה במאמרים.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — MEMBERSHIP PREVIEW (background, static cards) ---------------- */}
      <section
        aria-labelledby="members-preview-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>מה מתוכנן</Eyebrow>
            <h2
              id="members-preview-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              מה צפוי להיכלל באזור החברים.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed">
              רשימת תוכן מתוכננת. אף אחד מהפריטים אינו פעיל עדיין.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {previewCards.map((c) => (
              <li key={c.label}>
                <div className="card flex h-full flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold tracking-tight">
                      {c.label}
                    </span>
                    <span className="rounded-full border border-foreground/15 px-2 py-0.5 text-xs text-muted">
                      נעול
                    </span>
                  </div>
                  <span className="mt-3 flex-1 leading-relaxed text-foreground/80">
                    {c.body}
                  </span>
                  <div className="mt-6 space-y-2" aria-hidden="true">
                    <span className="block h-2.5 w-11/12 rounded-full bg-foreground/10" />
                    <span className="block h-2.5 w-full rounded-full bg-foreground/10" />
                    <span className="block h-2.5 w-3/4 rounded-full bg-foreground/[0.07]" />
                  </div>
                  <span className="mt-6 text-sm text-muted">בקרוב</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — WHAT MEMBERSHIP IS NOT (ink, muted strikethrough) ------------ */}
      <section aria-labelledby="members-not-title" className="band-dark">
        <Watermark className="top-[-1rem] end-[-0.5rem] text-[5rem] text-background/[0.045] sm:text-[7rem] lg:text-[10rem]">
          לא
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>מה זה לא</Eyebrow>
              <h2
                id="members-not-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                לא עוד אחד מאלה.
              </h2>
              <p className="mt-5 max-w-prose leading-relaxed text-background/70">
                אזור החברים אינו ממשיך את התעשייה הרגשית. הוא עומד מחוץ לה.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ul className="grid gap-4 sm:grid-cols-2">
                {notList.map((item) => (
                  <li
                    key={item}
                    className="card-dark p-8 text-xl font-semibold tracking-tight text-background/55 line-through decoration-background/40"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — WHAT MEMBERSHIP IS (paper) ----------------------------------- */}
      <section
        aria-labelledby="members-is-title"
        className="band-paper border-y border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>מה זה כן</Eyebrow>
            <h2
              id="members-is-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              התבוננות מובנית, לאורך זמן.
            </h2>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2">
            {isList.map((item) => (
              <li key={item.title} className="card p-8">
                <p className="text-xl font-semibold tracking-tight">
                  {item.title}
                </p>
                <p className="mt-3 leading-relaxed text-foreground/80">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 — NOTICE + CTA (ink) — restates "not active" ------------------- */}
      <section aria-labelledby="members-cta-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[12rem]">
          NeverMinde
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <h2
            id="members-cta-title"
            className="mt-8 max-w-prose text-2xl font-semibold leading-snug tracking-tight lg:text-3xl"
          >
            אזור החברים עדיין אינו פעיל. בינתיים, המסגרת המלאה פתוחה לקריאה
            ולצפייה.
          </h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/articles" className="btn btn-primary">
              לקריאת המאמרים
            </Link>
            <Link href="/videos" className="btn btn-on-dark">
              לעמוד הווידאו
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
