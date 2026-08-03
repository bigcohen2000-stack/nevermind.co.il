import Link from "next/link";
import {
  BookOpen,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";

import { InfoTip } from "@/components/ui/info-tip";
import { ARCHIVE_SYLLABUS, ARCHIVE_TOOLS_NOTE } from "@/lib/content/offers";

const SYLLABUS_TIPS: Record<string, string> = {
  יחסים: "ציר של קרבה, האשמה, זוגיות ופרידה. מוביל לחיפוש ולמאמרים בציר הזה.",
  מציאות: "ההפרדה בין מה שקרה לבין הסיפור שמספרים על מה שקרה.",
  "בחירה חופשית": "חקירה של האם יש בוחר, או רק קריינות אחרי הפעולה.",
  התמכרויות: "תבניות הישרדות שחוזרות. חלקן במאגר המועדון.",
  סמים: "חקירות עומק בנושא. לרוב ברמות החסומות יותר.",
  תודעה: "מי צופה, מי מדבר, ומה נשאר כשהסיפור על ה'אני' נרגע.",
};

/**
 * Archive topics + tools note. Same board visual language as membership.
 */
export function MembersSyllabusSection() {
  return (
    <section
      id="members-syllabus"
      aria-labelledby="members-syllabus-title"
      className="scroll-mt-24 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
          <Compass className="size-3.5" aria-hidden />
          נושאים
        </p>
        <h2
          id="members-syllabus-title"
          className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          נושאים במאגר.
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          {ARCHIVE_TOOLS_NOTE}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARCHIVE_SYLLABUS.map((item) => (
            <li
              key={item}
              className="flex items-start justify-between gap-2 border border-foreground/15 bg-paper p-4"
            >
              <Link
                href={`/search?q=${encodeURIComponent(item)}`}
                className="inline-flex items-center gap-2 font-medium text-foreground no-underline hover:text-action hover:no-underline"
              >
                <Sparkles className="size-4 shrink-0 text-action" aria-hidden />
                {item}
              </Link>
              <InfoTip label={`הסבר על ${item}`}>
                {SYLLABUS_TIPS[item] ??
                  "נושא שחוזר במאגר. אפשר לחפש אותו או לעבור למנגנונים."}
              </InfoTip>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link
            href="/mechanisms"
            className="inline-flex items-center gap-1.5 link-arrow"
          >
            <Compass className="size-3.5 text-action" aria-hidden />
            מפת המנגנונים
          </Link>
          <Link
            href="/concepts"
            className="inline-flex items-center gap-1.5 link-arrow"
          >
            <BookOpen className="size-3.5 text-action" aria-hidden />
            מדריך המושגים
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 link-arrow"
          >
            <Search className="size-3.5 text-action" aria-hidden />
            חיפוש חופשי
          </Link>
        </div>
      </div>
    </section>
  );
}
