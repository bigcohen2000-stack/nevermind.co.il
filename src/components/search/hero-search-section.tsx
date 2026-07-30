import { HeroSearch, type ConceptChip } from "@/components/search/hero-search";
import { createClient } from "@/lib/supabase/server";

/** Fallback chips when Supabase has no concepts yet. */
const DEFAULT_POPULAR: ConceptChip[] = [
  { id: "fallback-metziut", name: "מציאות" },
  { id: "fallback-hizdahut", name: "הזדהות" },
  { id: "fallback-sevel", name: "סבל" },
  { id: "fallback-bechira", name: "בחירה חופשית" },
];

type HeroSearchSectionProps = {
  variant?: "light" | "dark";
  className?: string;
  initialQuery?: string;
  /** Override chips; when omitted, loads from Supabase (or defaults). */
  popularConcepts?: ConceptChip[];
};

/**
 * Server wrapper for the Hero Search: loads popular concepts, renders client input.
 */
export async function HeroSearchSection({
  variant = "light",
  className,
  initialQuery,
  popularConcepts,
}: HeroSearchSectionProps) {
  let chips: ConceptChip[] = popularConcepts ?? [];

  if (!popularConcepts) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("concepts")
        .select("id, name, category")
        .order("name")
        .limit(8);

      chips =
        data && data.length > 0
          ? data.map((c) => ({
              id: c.id,
              name: c.name,
              category: c.category,
            }))
          : DEFAULT_POPULAR;
    } catch {
      chips = DEFAULT_POPULAR;
    }
  }

  return (
    <section aria-label="חיפוש ראשי" className="w-full">
      <HeroSearch
        variant={variant}
        className={className}
        initialQuery={initialQuery}
        popularConcepts={chips}
      />
    </section>
  );
}
