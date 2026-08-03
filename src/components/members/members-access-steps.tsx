import Link from "next/link";
import { KeyRound, Library, MessageCircle } from "lucide-react";

import { InfoTip } from "@/components/ui/info-tip";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const ACCESS_TEXT =
  "היי יקיר, אני מבקש גישה למאגר הסרטונים של המועדון באתר. אשמח לשיחת התאמה.";

const STEPS = [
  {
    id: "ask",
    n: "01",
    icon: MessageCircle,
    title: "מבקשים בוואטסאפ",
    tip: "שיחת התאמה קצרה. בודקים אם הכיוון מתאים לפני שפותחים מאגר.",
    body: "כותבים בקשת גישה. בודקים התאמה בשיחה קצרה של כ-10 דקות. זו לא שיחת ייעוץ.",
  },
  {
    id: "receive",
    n: "02",
    icon: KeyRound,
    title: "מקבלים קישור או סיסמה",
    tip: "קישור אישי נפתח ישירות. סיסמה ממלאים בטופס הכניסה בעמוד הזה.",
    body: "קישור אישי בוואטסאפ, או סיסמת מועדון. לוחצים על הקישור או ממלאים בטופס הכניסה.",
  },
  {
    id: "enter",
    n: "03",
    icon: Library,
    title: "נכנסים למאגר",
    tip: "אחרי כניסה במכשיר, סרטוני המועדון נפתחים. אפשר גם לבקש פיד פודקאסט פרטי.",
    body: "אחרי הכניסה, סרטוני המועדון נפתחים במכשיר הזה. אפשר גם לבקש קישור לפיד פודקאסט פרטי.",
  },
] as const;

/**
 * Three clear access steps with icons. Same visual language as membership board.
 */
export function MembersAccessSteps() {
  return (
    <section
      id="members-access-steps"
      aria-labelledby="members-access-steps-title"
      className="scroll-mt-24 border-t border-foreground/10 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
          <KeyRound className="size-3.5" aria-hidden />
          כניסה
        </p>
        <h2
          id="members-access-steps-title"
          className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          שלושה צעדים קצרים.
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          אין סליקה באתר. מבקשים, מקבלים גישה ידנית, ונכנסים למאגר במכשיר.
        </p>

        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className="border border-foreground/15 bg-paper p-5 sm:p-6"
              >
                <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted">
                  <span className="tabular-nums text-foreground/35">
                    {step.n}
                  </span>
                  <Icon className="size-4 text-action" aria-hidden />
                </p>
                <h3 className="mt-3 flex items-center gap-1.5 text-lg font-semibold tracking-tight">
                  {step.title}
                  <InfoTip label={`הסבר: ${step.title}`}>{step.tip}</InfoTip>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={buildWhatsAppHref(ACCESS_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            בקשת גישה בוואטסאפ
          </a>
          <a href="#login" className="btn btn-secondary">
            לטופס הכניסה
          </a>
          <a href="#membership-prices" className="btn btn-secondary">
            למסגרות מחיר
          </a>
        </div>

        <p className="mt-10 max-w-prose text-sm leading-relaxed text-muted">
          פירוט מסלולי ייעוץ בעמוד{" "}
          <Link href="/paths" className="underline-offset-4 hover:underline">
            המסלולים
          </Link>
          . שאלות כלליות:{" "}
          <Link href="/contact" className="underline-offset-4 hover:underline">
            צור קשר
          </Link>
          . מבנה התוכן:{" "}
          <Link
            href="/mechanisms"
            className="underline-offset-4 hover:underline"
          >
            מנגנונים
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
