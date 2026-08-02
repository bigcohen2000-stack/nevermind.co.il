import Link from "next/link";

import {
  CLUB_ACCESS_BENEFITS,
  FREE_ACCESS_BENEFITS,
} from "@/lib/content/access-layers";

/**
 * Side-by-side free vs club benefits. Sharp borders, no drama.
 */
export function AccessLayersCompare() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section
        aria-labelledby="free-access-title"
        className="border border-[#121212]/20 bg-background p-5 sm:p-6"
      >
        <p className="text-xs font-medium tracking-wide text-muted">חינם</p>
        <h3
          id="free-access-title"
          className="mt-2 text-xl font-semibold tracking-tight"
        >
          בלי מועדון.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          פתוח לכולם. בלי תשלום ובלי allowlist.
        </p>
        <ul className="mt-6 space-y-5">
          {FREE_ACCESS_BENEFITS.map((item) => (
            <li key={item.title}>
              <p className="text-sm font-medium text-foreground">
                <span className="text-muted">חינם · </span>
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/videos?filter=open" className="btn btn-secondary">
            סרטונים פתוחים
          </Link>
          <Link href="/api/podcast.xml" className="btn btn-secondary">
            פיד RSS ציבורי
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="club-access-title"
        className="border border-action bg-background p-5 sm:p-6"
      >
        <p className="text-xs font-medium tracking-wide text-action">מועדון</p>
        <h3
          id="club-access-title"
          className="mt-2 text-xl font-semibold tracking-tight"
        >
          מה מקבלים בהרשמה.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          אחרי שיחת התאמה. בלי סליקה באתר.
        </p>
        <ul className="mt-6 space-y-5">
          {CLUB_ACCESS_BENEFITS.map((item) => (
            <li key={item.title}>
              <p className="text-sm font-medium text-foreground">
                <span className="text-action">מועדון · </span>
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <a href="#login" className="btn btn-primary">
            כניסה או בקשת גישה
          </a>
        </div>
      </section>
    </div>
  );
}
