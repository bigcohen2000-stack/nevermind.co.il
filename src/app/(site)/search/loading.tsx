/**
 * Route-level skeleton for /search: mirrors the dark hero band with the
 * highlights strip and a results column so navigation paints instantly.
 */
export default function SearchLoading() {
  return (
    <main
      className="w-full bg-background text-foreground text-start"
      role="status"
      aria-busy="true"
      aria-label="טוען את החיפוש"
    >
      <span className="sr-only">טוען...</span>

      <section className="band-dark" aria-hidden="true">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="h-4 w-20 animate-pulse bg-foreground/10" />
          <div className="mt-6 h-12 w-80 max-w-full animate-pulse bg-foreground/10 sm:h-14" />
          <div className="mt-7 h-5 w-full max-w-prose animate-pulse bg-foreground/10" />
          <div className="mt-3 h-5 w-2/3 max-w-prose animate-pulse bg-foreground/10" />

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="h-24 animate-pulse border border-foreground/15 bg-foreground/5"
              />
            ))}
          </ul>
        </div>
      </section>

      <section
        className="band-paper border-b border-foreground/10"
        aria-hidden="true"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
          <div className="h-14 w-full max-w-2xl animate-pulse border border-foreground/15 bg-foreground/5" />
          <div className="mt-10 space-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-24 w-full animate-pulse border border-foreground/10 bg-foreground/5"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
