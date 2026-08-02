import Link from "next/link";

import {
  PUBLIC_INVESTIGATION_FACTS,
  type PublicFact,
} from "@/lib/members/public-facts";
import { cn } from "@/lib/utils";

type InvestigationFactsStripProps = {
  /** Subset of fact ids. Default: all public facts. */
  factIds?: string[];
  /** Visual density. */
  tone?: "paper" | "dark" | "inline";
  className?: string;
  /** Optional link under the strip. */
  moreHref?: string;
  moreLabel?: string;
};

/**
 * Neutral authority facts for public pages (not /members vanity metrics).
 */
export function InvestigationFactsStrip({
  factIds,
  tone = "paper",
  className,
  moreHref = "/members",
  moreLabel = "למאגר ולמועדון",
}: InvestigationFactsStripProps) {
  const facts: PublicFact[] = factIds?.length
    ? PUBLIC_INVESTIGATION_FACTS.filter((f) => factIds.includes(f.id))
    : PUBLIC_INVESTIGATION_FACTS;

  if (facts.length === 0) return null;

  if (tone === "inline") {
    return (
      <p
        className={cn(
          "text-sm leading-relaxed text-foreground/70",
          className,
        )}
      >
        {facts.map((f) => f.hint ?? `${f.label}: ${f.value}`).join(" · ")}
        {moreHref ? (
          <>
            {" "}
            <Link
              href={moreHref}
              className="text-action underline-offset-4 hover:underline"
            >
              {moreLabel}
            </Link>
          </>
        ) : null}
      </p>
    );
  }

  const dark = tone === "dark";

  return (
    <section
      aria-label="עובדות על המאגר"
      className={cn(
        dark
          ? "border-y border-foreground/15 bg-transparent text-foreground"
          : "border-y border-foreground/10 bg-paper text-foreground",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
        <p
          className={cn(
            "text-xs font-medium tracking-wide",
            dark ? "text-foreground/55" : "text-action",
          )}
        >
          עובדות על החקירה
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className={cn(
                "border px-3 py-3",
                dark
                  ? "border-foreground/15 bg-foreground/[0.04]"
                  : "border-foreground/15 bg-background",
              )}
            >
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        {moreHref ? (
          <p className="mt-4">
            <Link href={moreHref} className="link-arrow text-sm">
              {moreLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
