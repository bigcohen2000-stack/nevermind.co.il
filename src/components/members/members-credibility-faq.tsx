import { ShieldQuestion } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

export const CREDIBILITY_FAQ = [
  {
    q: "למה יש אומדן וגם ספירה חיה?",
    a: "האומדן מתאר את עומק הארכיון ההיסטורי. הספירה החיה מתארת מה מסונכרן ופתוח או חסום באתר עכשיו.",
  },
  {
    q: "למה אין מספר מנויים?",
    a: "כי הכמות לא מדד לעומק. הקהילה סגורה אחרי בדיקת התאמה.",
  },
] as const;

type MembersCredibilityFaqProps = {
  className?: string;
};

/**
 * Short credibility FAQ for /members. Always visible, no dig.
 */
export function MembersCredibilityFaq({ className }: MembersCredibilityFaqProps) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CREDIBILITY_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section
      id="members-credibility"
      aria-labelledby="members-credibility-title"
      className={cn(
        "scroll-mt-24 border-y border-foreground/10 bg-paper text-foreground",
        className,
      )}
    >
      <JsonLd data={faqLd} />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
          <ShieldQuestion className="size-3.5" aria-hidden />
          אמינות
        </p>
        <h2
          id="members-credibility-title"
          className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          שאלות על האמינות
        </h2>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {CREDIBILITY_FAQ.map((item) => (
            <div
              key={item.q}
              className="border border-foreground/15 bg-background p-5"
            >
              <dt className="text-base font-semibold tracking-tight">
                {item.q}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-foreground/75">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
