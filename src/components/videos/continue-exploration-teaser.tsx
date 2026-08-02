import Link from "next/link";

import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";

type ContinueExplorationTeaserProps = {
  /** Custom label from DB. Falls back to generic club invite. */
  label?: string | null;
  /** Path or absolute URL. Defaults to /members. */
  href?: string | null;
};

/**
 * Soft upsell under public watch pages: continue the investigation in the club.
 */
export function ContinueExplorationTeaser({
  label,
  href,
}: ContinueExplorationTeaserProps) {
  const copy =
    label?.trim() ||
    "לחברי מועדון: המשך החקירה בשיחות המלאות, ללא פילטר, וגם פיד פודקאסט פרטי להאזנה בדרך.";
  const target = href?.trim() || "/members";

  return (
    <div className="mt-8 space-y-4">
      <aside
        className="border border-action/40 bg-paper p-5 sm:p-6"
        aria-labelledby="continue-exploration-title"
      >
        <p
          id="continue-exploration-title"
          className="text-xs font-medium tracking-wide text-action"
        >
          המשך החקירה
        </p>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground">
          {copy}
        </p>
        <p className="mt-2 text-sm text-muted">
          חינם עכשיו: הסרטון הציבורי המלא למעלה, ומאמרים ומושגים באתר.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={target} className="btn btn-primary">
            לאזור החברים
          </Link>
          <Link href="/videos?filter=open" className="btn btn-secondary">
            סרטונים פתוחים (חינם)
          </Link>
        </div>
      </aside>
      <PrivatePodcastBanner density="compact" />
    </div>
  );
}
