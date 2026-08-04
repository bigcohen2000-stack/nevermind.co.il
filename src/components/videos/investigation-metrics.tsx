import Link from "next/link";

import type { HeatmapBucket } from "@/lib/videos/heatmap";
import {
  diveDepthCopy,
  pickThoughtTurnPoints,
} from "@/lib/videos/investigation-metrics";
import {
  BREAKDOWN_LEVEL_BLURBS,
  BREAKDOWN_LEVEL_LABELS,
  isBreakdownLevel,
  isInvestigationTag,
} from "@/lib/videos/investigation";

type InvestigationMetricsProps = {
  durationSeconds: number | null;
  breakdownLevel: string | null;
  heatmapBuckets: HeatmapBucket[];
  conceptNames: string[];
  /** Base watch path for ?t= links (e.g. /watch/abc). */
  watchHref: string;
};

/**
 * Club-facing investigation metrics under the player.
 * Dive depth uses duration. Thought turns use concept-density peaks (not YT retention).
 * Community frequency lists investigation tags present on this video.
 */
export function InvestigationMetrics({
  durationSeconds,
  breakdownLevel,
  heatmapBuckets,
  conceptNames,
  watchHref,
}: InvestigationMetricsProps) {
  const dive = diveDepthCopy(durationSeconds);
  const turns = pickThoughtTurnPoints(heatmapBuckets);
  const frequency = conceptNames.filter(isInvestigationTag);
  const level = isBreakdownLevel(breakdownLevel) ? breakdownLevel : null;

  if (!dive && turns.length === 0 && frequency.length === 0 && !level) {
    return null;
  }

  return (
    <section
      className="mt-8 border border-foreground/15 bg-paper p-5 sm:p-6"
      aria-labelledby="investigation-metrics-title"
    >
      <p
        id="investigation-metrics-title"
        className="text-xs font-medium tracking-wide text-action"
      >
        מדדי חקירה
      </p>

      {level ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">
            {BREAKDOWN_LEVEL_LABELS[level]}
          </p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/70">
            {BREAKDOWN_LEVEL_BLURBS[level]}
          </p>
        </div>
      ) : null}

      {dive ? (
        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">עומק צלילה</p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/80">
            {dive}
          </p>
        </div>
      ) : null}

      {turns.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">
            נקודות היפוך
          </p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/70">
            רגעים שבהם צפיפות המושגים גבוהה. המחשבה נעצרת והחקירה מתחילה.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {turns.map((point) => (
              <li key={point.minute}>
                <Link
                  href={`${watchHref}?t=${point.startSeconds}`}
                  className="inline-flex min-h-10 items-center border border-foreground/20 px-3 text-sm no-underline hover:border-action hover:text-action hover:no-underline"
                >
                  דקה {point.minute + 1}
                  {point.concepts[0] ? `: ${point.concepts[0]}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {frequency.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">ענן תגיות</p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/70">
            מילות מפתח מתוך החקירה. ניווט ישיר לנושאים קשורים.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="תגיות חקירה">
            {frequency.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex border border-action/40 px-3 py-1.5 text-sm text-action no-underline hover:bg-action/10 hover:no-underline"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
