import { HeroSearch, type ConceptChip } from "@/components/search/hero-search";
import { CURATED_CONCEPTS, isCuratedConcept } from "@/lib/concepts/quality";
import { getTrendingSearches } from "@/lib/search/trending-searches";
import { createClient } from "@/lib/supabase/server";

/** Fallback chips when Supabase has no concepts / trending data yet. */
const DEFAULT_POPULAR: ConceptChip[] = CURATED_CONCEPTS.slice(0, 4).map(
  (name, index) => ({
    id: `fallback-${index}-${name}`,
    name,
  }),
);

type HeroSearchSectionProps = {
  variant?: "light" | "dark";
  className?: string;
  initialQuery?: string;
  /** Override chips; when omitted, loads from concepts or trending. */
  popularConcepts?: ConceptChip[];
  placeholders?: string[];
  syncUrl?: boolean;
  /**
   * `trending` = top search_analytics terms (7 days, excluding 0-result).
   * `concepts` = popular curated concepts from Supabase (default).
   */
  chipSource?: "concepts" | "trending";
};

/**
 * Server wrapper for the Hero Search: loads chips, renders client input.
 */
export async function HeroSearchSection({
  variant = "light",
  className,
  initialQuery,
  popularConcepts,
  placeholders,
  syncUrl = false,
  chipSource = "concepts",
}: HeroSearchSectionProps) {
  let chips: ConceptChip[] = popularConcepts ?? [];
  let chipsAriaLabel = "מושגים נפוצים";

  if (!popularConcepts && chipSource === "trending") {
    chipsAriaLabel = "חיפושים פופולריים";
    try {
      const trending = await getTrendingSearches(5);
      chips =
        trending.length > 0
          ? trending.map((item, index) => ({
              id: `trending-${index}-${item.term}`,
              name: item.term,
            }))
          : DEFAULT_POPULAR;
    } catch {
      chips = DEFAULT_POPULAR;
    }
  } else if (!popularConcepts) {
    try {
      const supabase = await createClient();
      // Aggregate counts only: avoid shipping every video_id for chip ranking.
      const { data } = await supabase
        .from("concepts")
        .select("id, name, category, video_concepts(count)")
        .order("name")
        .limit(40);

      const ranked =
        data
          ?.map((c) => {
            const links = c.video_concepts as { count: number }[] | null;
            const videoCount = Array.isArray(links)
              ? Number(links[0]?.count ?? 0)
              : 0;
            return {
              id: c.id,
              name: c.name,
              category: c.category,
              videoCount,
            };
          })
          .filter(
            (c) =>
              c.videoCount > 0 &&
              (isCuratedConcept(c.name) || c.videoCount >= 2),
          )
          .sort(
            (a, b) =>
              Number(isCuratedConcept(b.name)) -
                Number(isCuratedConcept(a.name)) ||
              b.videoCount - a.videoCount,
          )
          .slice(0, 8) ?? [];

      chips =
        ranked.length > 0
          ? ranked.map((c) => ({
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
        placeholders={placeholders}
        syncUrl={syncUrl}
        chipsAriaLabel={chipsAriaLabel}
      />
    </section>
  );
}
