import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow, Watermark } from "@/components/ui/editorial";

export const metadata: Metadata = {
  title: "מנגנונים",
  description:
    "האתר מאורגן לפי מנגנונים, לא לפי רגשות: יחסים, קיום, זהות.",
};

/* -------------------------------------------------------------------------- */

interface Mechanism {
  index: string;
  label: string;
  explanation: string;
  questions: string[];
}

const mechanisms: Mechanism[] = [
  {
    index: "01",
    label: "יחסים",
    explanation:
      "מנגנונים של קרבה: איך אנחנו מתחברים, נפרדים, מאשימים ומתפייסים. הרגש סוער, אבל מתחתיו פועלת תבנית צפויה.",
    questions: [
      "מי באמת אשם בקונפליקט?",
      "למה אנחנו חוזרים לאותו ויכוח?",
      "מה קורה ברגע שבו נפגעים?",
    ],
  },
  {
    index: "02",
    label: "קיום",
    explanation:
      "מנגנונים של הישרדות: כסף, עבודה, לחץ והרגלים שמפעילים אותנו. מה שנראה כמו בחירה הוא לרוב אוטומט ישן.",
    questions: [
      "למה כל כך קשה להפסיק הרגל?",
      "מה מניע את הלחץ סביב כסף?",
      "מתי הישרדות הופכת לאוטומט?",
    ],
  },
  {
    index: "03",
    label: "זהות",
    explanation:
      "מנגנונים של ה'אני': אגו, רצון חופשי ותפיסת המציאות. השכבה העמוקה ביותר, שבה נשאלת השאלה מי בכלל שואל.",
    questions: [
      "האם קיים רצון חופשי?",
      "מי זה ה'אני' שחושב?",
      "עד כמה המציאות שאנחנו חווים אמיתית?",
    ],
  },
];

/** One full-width mechanism band — asymmetric, alternating tone. */
function MechanismBand({
  mechanism,
  tone,
}: {
  mechanism: Mechanism;
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";

  const section = isDark
    ? "band-dark"
    : "band-paper border-y border-foreground/10";
  const watermark = isDark ? "text-background/[0.045]" : "text-foreground/[0.04]";
  const indexColor = isDark ? "text-background/15" : "text-foreground/15";
  const secondary = isDark ? "text-background/80" : "text-foreground/80";
  const panel = isDark ? "card-dark" : "card";
  const panelLabel = isDark ? "text-background/60" : "text-muted";
  const divider = isDark ? "border-background/15" : "border-foreground/10";

  return (
    <section
      aria-labelledby={`mech-${mechanism.index}`}
      className={section}
    >
      <Watermark
        className={`bottom-[-1.5rem] start-[-0.5rem] text-[6rem] sm:text-[9rem] lg:text-[12rem] ${watermark}`}
      >
        {mechanism.label}
      </Watermark>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <span
              className={`block text-6xl font-semibold tracking-tight lg:text-7xl ${indexColor}`}
            >
              {mechanism.index}
            </span>
            <h2
              id={`mech-${mechanism.index}`}
              className="mt-6 text-3xl font-semibold tracking-tight lg:text-4xl"
            >
              {mechanism.label}
            </h2>
            <p className={`mt-5 max-w-prose leading-relaxed ${secondary}`}>
              {mechanism.explanation}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className={`${panel} p-8`}>
              <p className={`text-sm font-medium tracking-wide ${panelLabel}`}>
                שאלות לדוגמה
              </p>
              <ul className="mt-5 space-y-4">
                {mechanism.questions.map((q) => (
                  <li
                    key={q}
                    className={`border-t ${divider} pt-4 text-lg leading-snug first:border-t-0 first:pt-0`}
                  >
                    {q}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/articles" className="link-arrow">
                  קראו מאמרים ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export default function MechanismsPage() {
  return (
    <main className="w-full text-start">
      {/* 1 — HERO (ink, asymmetric, index panel) --------------------------- */}
      <section aria-labelledby="mechanisms-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[13rem]">
          מנגנונים
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-7">
              <Eyebrow onDark>מבנה התוכן</Eyebrow>
              <h1
                id="mechanisms-hero-title"
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                מנגנונים, לא רגשות.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
                כל התוכן מאורגן סביב שלושה מנגנונים. רגש הוא תוצאה. מנגנון הוא
                המבנה שמייצר אותה שוב ושוב.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="card-dark p-8">
                <p className="text-sm font-medium tracking-wide text-background/60">
                  שלושת המנגנונים
                </p>
                <ul className="mt-5 space-y-4">
                  {mechanisms.map((m) => (
                    <li
                      key={m.label}
                      className="flex items-baseline gap-4 border-t border-background/15 pt-4 first:border-t-0 first:pt-0"
                    >
                      <span className="text-sm text-background/40">
                        {m.index}
                      </span>
                      <span className="text-xl font-semibold tracking-tight">
                        {m.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — CONCEPT (background, asymmetric) ------------------------------ */}
      <section
        aria-labelledby="concept-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow>העיקרון</Eyebrow>
              <h2
                id="concept-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                מנגנון הוא תבנית חוזרת.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-lg leading-relaxed">
                כשמסתכלים על רגש, רואים סימפטום. כשמסתכלים על מנגנון, רואים את
                המבנה שמייצר את הסימפטום שוב ושוב. זו אינה עבודה רגשית, אלא עבודה
                לוגית: לזהות את התנאי שמפעיל את התבנית, ולבחור אחרת עוד לפני
                שהרגש מופיע.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — THREE MECHANISM BANDS (alternating tone) --------------------- */}
      {mechanisms.map((m, i) => (
        <MechanismBand
          key={m.label}
          mechanism={m}
          tone={i % 2 === 0 ? "dark" : "light"}
        />
      ))}

      {/* 4 — BOTTOM CTA (paper, designed block) --------------------------- */}
      <section
        aria-labelledby="mechanisms-cta-title"
        className="band-paper border-t border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="mechanisms-cta-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-8 lg:text-4xl"
            >
              התחילו לקרוא לפי מנגנון.
            </h2>
            <div className="lg:col-span-4 lg:text-end">
              <Link href="/articles" className="btn btn-primary">
                לכל המאמרים
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
