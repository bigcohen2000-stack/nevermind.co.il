import { HeroSearch, type ConceptChip } from "@/components/search/hero-search";
import { CURATED_CONCEPTS } from "@/lib/concepts/quality";
import { getTrendingSearches } from "@/lib/search/trending-searches";
import {
  countPublicRandomVideos,
  listConceptsWithVideoCounts,
} from "@/lib/videos/queries";

/** Fallback chips when Supabase has no concepts / trending data yet. */
const DEFAULT_POPULAR: ConceptChip[] = CURATED_CONCEPTS.slice(0, 8).map(
  (name, index) => ({
    id: `fallback-${index}-${name}`,
    name,
  }),
);

/** Cap chips so mobile CTA stays above the fold (single scroll row). */
const CONCEPT_CHIP_LIMIT = 12;
const TRENDING_CHIP_LIMIT = 8;

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
   * `concepts` = concepts that actually have videos (default).
   */
  chipSource?: "concepts" | "trending";
  /** Cap chip count. Defaults: concepts 12, trending 8. */
  maxChips?: number;
};

/**
 * Server wrapper for the Hero Search: loads chips + public video count.
 */
export async function HeroSearchSection({
  variant = "light",
  className,
  initialQuery,
  popularConcepts,
  placeholders,
  syncUrl = false,
  chipSource = "concepts",
  maxChips,
}: HeroSearchSectionProps) {
  let chips: ConceptChip[] = popularConcepts ?? [];
  let chipsAriaLabel = "מושגים עם סרטונים";

  const videoCountPromise = countPublicRandomVideos().catch(() => 0);

  if (!popularConcepts && chipSource === "trending") {
    chipsAriaLabel = "חיפושים פופולריים";
    const limit = maxChips ?? TRENDING_CHIP_LIMIT;
    try {
      const trending = await getTrendingSearches(limit);
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
    const limit = maxChips ?? CONCEPT_CHIP_LIMIT;
    try {
      const ranked = await listConceptsWithVideoCounts();
      chips =
        ranked.length > 0
          ? ranked.slice(0, limit).map((c) => ({
              id: c.id,
              name: c.name,
              category: c.category,
            }))
          : DEFAULT_POPULAR;
    } catch {
      chips = DEFAULT_POPULAR;
    }
  } else if (maxChips != null && chips.length > maxChips) {
    chips = chips.slice(0, maxChips);
  }

  const videoCount = await videoCountPromise;

  return (
    <section
      aria-label="חיפוש ראשי"
      className="relative min-h-[180px] w-full overflow-x-clip overflow-y-visible sm:min-h-[220px]"
    >
      <HeroSearch
        variant={variant}
        className={className}
        initialQuery={initialQuery}
        popularConcepts={chips}
        placeholders={placeholders}
        syncUrl={syncUrl}
        chipsAriaLabel={chipsAriaLabel}
        videoCount={videoCount}
      />
    </section>
  );
}
