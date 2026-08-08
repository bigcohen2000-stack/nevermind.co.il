/**
 * Route-level skeleton for /watch: mirrors the focus layout grid with a
 * fixed-aspect player box, so the video frame area never shifts.
 */
export default function WatchLoading() {
  return (
    <main
      className="w-full bg-background text-foreground"
      role="status"
      aria-busy="true"
      aria-label="טוען את הסרטון"
    >
      <span className="sr-only">טוען...</span>

      <div
        className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-10 lg:py-14"
        aria-hidden="true"
      >
        <div className="hidden h-4 w-16 animate-pulse bg-foreground/10 sm:block" />
        <div className="mt-3 h-7 w-3/4 max-w-2xl animate-pulse bg-foreground/10 sm:h-9" />
        <div className="mt-3 h-4 w-1/2 max-w-xl animate-pulse bg-foreground/10" />

        <div className="mt-3 grid grid-cols-1 gap-5 sm:mt-6 sm:gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <div className="flex min-w-0 flex-col lg:col-span-8">
            <div className="relative aspect-video w-full animate-pulse border border-foreground/15 bg-ink/90" />
            <div className="mt-4 h-9 w-64 max-w-full animate-pulse bg-foreground/10" />
            <div className="mt-6 space-y-4">
              <div className="h-20 w-full animate-pulse border border-foreground/10 bg-foreground/5" />
              <div className="h-20 w-full animate-pulse border border-foreground/10 bg-foreground/5" />
            </div>
          </div>

          <aside className="hidden min-w-0 lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-4 border border-foreground/10 bg-paper/40 p-4 sm:p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-24 w-full animate-pulse bg-foreground/10"
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
