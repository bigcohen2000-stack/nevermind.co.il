import Link from "next/link";

type RelatedConceptsStripProps = {
  concepts: Array<{ name: string }>;
  /** Max concepts to show (default 3). */
  limit?: number;
  className?: string;
};

/**
 * Dry internal SEO strip: plain text links to /search?q= for related concepts.
 */
export function RelatedConceptsStrip({
  concepts,
  limit = 3,
  className,
}: RelatedConceptsStripProps) {
  const items = concepts
    .map((c) => c.name.trim())
    .filter(Boolean)
    .slice(0, limit);

  if (items.length === 0) return null;

  return (
    <p
      className={
        className ??
        "mt-8 max-w-prose text-sm leading-relaxed text-foreground/70"
      }
    >
      <span className="text-foreground/55">מושגים קשורים לחקירה זו: </span>
      {items.map((name, i) => (
        <span key={name}>
          {i > 0 ? (
            <span className="text-muted" aria-hidden="true">
              {" · "}
            </span>
          ) : null}
          <Link
            href={`/search?q=${encodeURIComponent(name)}`}
            className="text-foreground underline-offset-2 hover:text-action hover:underline"
          >
            {name}
          </Link>
        </span>
      ))}
    </p>
  );
}
