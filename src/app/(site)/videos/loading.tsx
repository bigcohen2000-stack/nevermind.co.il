import { VideoGridSkeleton } from "@/components/videos/video-grid-skeleton";

/**
 * Route-level skeleton for /videos: mirrors the dark hero band and the
 * paper results band so client navigations paint instantly without shift.
 */
export default function VideosLoading() {
  return (
    <main
      className="w-full text-start"
      role="status"
      aria-busy="true"
      aria-label="טוען את ספריית הסרטונים"
    >
      <span className="sr-only">טוען...</span>

      <section className="band-dark" aria-hidden="true">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <div className="h-4 w-28 animate-pulse bg-foreground/10" />
              <div className="mt-6 h-12 w-64 max-w-full animate-pulse bg-foreground/10 sm:h-14" />
              <div className="mt-4 h-12 w-40 animate-pulse bg-foreground/10 sm:h-14" />
              <div className="mt-8 h-5 w-full max-w-prose animate-pulse bg-foreground/10" />
              <div className="mt-3 h-5 w-3/4 max-w-prose animate-pulse bg-foreground/10" />
              <div className="mt-9 h-11 w-44 animate-pulse bg-foreground/10" />
            </div>
            <div className="lg:col-span-7">
              <div className="h-14 w-full animate-pulse border border-foreground/15 bg-foreground/5" />
              <div className="mt-4 h-4 w-2/3 animate-pulse bg-foreground/10" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="band-paper border-b border-foreground/10"
        aria-hidden="true"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="h-4 w-24 animate-pulse bg-foreground/10" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse bg-foreground/10" />
          <VideoGridSkeleton count={12} className="mt-14" />
        </div>
      </section>
    </main>
  );
}
