import { JsonLd } from "@/components/seo/json-ld";
import type { FaqItem } from "@/lib/content/offers";
import { cn } from "@/lib/utils";

type ProductFaqProps = {
  items: FaqItem[];
  title?: string;
  headingId?: string;
  /** Optional section id for in-page anchors. */
  sectionId?: string;
  /** Dark band for /paths-style footers. */
  tone?: "paper" | "dark";
  className?: string;
};

/**
 * Dry FAQ block + FAQPage JSON-LD for product / service pages.
 * Always open: answers stay in the HTML for AEO and accessibility.
 */
export function ProductFaq({
  items,
  title = "שאלות נפוצות",
  headingId = "product-faq-title",
  sectionId,
  tone = "paper",
  className,
}: ProductFaqProps) {
  if (items.length === 0) return null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const isDark = tone === "dark";

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={cn(
        isDark
          ? "border-t border-[#FAFAF8]/15 bg-[#1A1A1A] text-[#FAFAF8]"
          : "band-paper border-t border-foreground/10",
        sectionId ? "scroll-mt-24" : null,
        className,
      )}
    >
      <JsonLd data={faqLd} />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2
          id={headingId}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        <ul
          className={
            isDark
              ? "mt-8 space-y-0 divide-y divide-[#FAFAF8]/15"
              : "mt-8 space-y-0 divide-y divide-foreground/10"
          }
        >
          {items.map((item) => (
            <li key={item.question} className="py-5">
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                {item.question}
              </h3>
              <p
                className={
                  isDark
                    ? "mt-2 max-w-3xl text-sm leading-relaxed text-[#9CA3AF]"
                    : "mt-2 max-w-3xl text-sm leading-relaxed text-foreground/75"
                }
              >
                {item.answer}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
