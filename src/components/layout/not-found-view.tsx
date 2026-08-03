import Link from "next/link";
import { Suspense } from "react";

import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow, Watermark } from "@/components/ui/editorial";

const NOT_FOUND_PLACEHOLDERS = [
  "חפש סרטון או מושג",
  "כעס",
  "הזדהות",
  "מנגנון",
  "מה זה סבל",
];

const HUB_LINKS = [
  { label: "וידאו", href: "/videos" },
  { label: "מאמרים", href: "/articles" },
  { label: "מושגים", href: "/concepts" },
  { label: "מנגנונים", href: "/mechanisms" },
  { label: "בית", href: "/" },
] as const;

function SearchFallback() {
  return (
    <div
      className="mx-auto h-[10.5rem] w-full max-w-2xl"
      aria-hidden="true"
    >
      <div className="h-14 w-full rounded-full border border-white/30 bg-black" />
    </div>
  );
}

/**
 * Branded 404 body: search-first recovery, dry Hebrew copy, hub fallbacks.
 * Used by root / site not-found and the studio probe disguise.
 */
export function NotFoundView() {
  return (
    <main className="w-full text-start">
      <section aria-labelledby="not-found-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          404
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-28">
          <Eyebrow onDark>לא נמצא</Eyebrow>
          <h1
            id="not-found-title"
            className="mt-5 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            אין עמוד בכתובת הזו.
          </h1>
          <p className="mx-auto mt-6 max-w-prose text-base leading-relaxed text-foreground/80 sm:mt-7 sm:text-lg">
            אפשר לחפש סרטונים, מושגים, מנגנונים ומאמרים. תתחילו מהשדה למטה.
          </p>

          <div className="mx-auto mt-8 min-h-[10.5rem] w-full max-w-2xl sm:mt-10">
            <Suspense fallback={<SearchFallback />}>
              <HeroSearchSection
                variant="dark"
                placeholders={NOT_FOUND_PLACEHOLDERS}
                chipSource="trending"
              />
            </Suspense>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="not-found-hubs"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p id="not-found-hubs" className="text-sm text-muted">
            או לעבור ישירות:
          </p>
          <nav
            aria-label="יעדים חלופיים"
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
          >
            {HUB_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-arrow text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
