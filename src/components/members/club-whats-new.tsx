import Link from "next/link";

import type { WhatsNewVideo } from "@/lib/members/whats-new";

type ClubWhatsNewSectionProps = {
  videos: WhatsNewVideo[];
};

/**
 * Entitled club members: unwatched gated/unlisted items since last catch-up.
 */
export function ClubWhatsNewSection({ videos }: ClubWhatsNewSectionProps) {
  if (videos.length === 0) {
    return (
      <section
        aria-labelledby="whats-new-title"
        className="border border-foreground/15 bg-paper p-5 sm:p-6"
      >
        <h2
          id="whats-new-title"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          מה חדש במאגר
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          אין סרטונים חדשים שלא צפיתם בהם כרגע. חזרו אחרי הסנכרון הבא.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="whats-new-title"
      className="border border-foreground/15 bg-paper p-5 sm:p-6"
    >
      <h2
        id="whats-new-title"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        מה חדש במאגר
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        סרטוני מועדון שעדיין לא סומנו כנצפו אצלכם. עד {videos.length} פריטים.
      </p>
      <ul className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
        {videos.map((v) => (
          <li key={v.id}>
            <Link
              href={v.href}
              className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-foreground no-underline hover:text-action hover:no-underline"
            >
              <span className="font-medium tracking-tight">{v.title}</span>
              <span className="text-xs text-muted">
                {v.published_at
                  ? new Date(v.published_at).toLocaleDateString("he-IL")
                  : "חדש"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        <Link href="/videos?filter=club" className="text-action underline-offset-2 hover:underline">
          לכל סרטוני המועדון
        </Link>
      </p>
    </section>
  );
}
