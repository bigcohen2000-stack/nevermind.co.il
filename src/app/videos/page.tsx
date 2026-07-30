import type { Metadata } from "next";
import Link from "next/link";

import { HeroSearchSection } from "@/components/search/hero-search-section";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { VideoCard } from "@/components/videos/video-card";
import { listPublicVideos } from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "וידאו והרצאות",
  description:
    "אותם מנגנונים, בקול. חפש סרטונים ומושגים. המאמרים נשארים מקור המסגרת.",
};

export default async function VideosPage() {
  let videos: Awaited<ReturnType<typeof listPublicVideos>> = [];

  try {
    videos = await listPublicVideos(9);
  } catch {
    videos = [];
  }

  return (
    <main className="w-full text-start">
      <section aria-labelledby="videos-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[13rem]">
          הרצאות
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>וידאו והרצאות</Eyebrow>
              <h1
                id="videos-hero-title"
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                אותו ניתוח,
                <br />
                בקול.
              </h1>
              <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
                חפש לפי מושג או כותרת. סרטונים לחברים מוצגים רק לאחר התחברות.
              </p>
            </div>

            <div className="lg:col-span-7">
              <HeroSearchSection variant="dark" />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="videos-list-title"
        className="band-paper border-b border-foreground/10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="lg:max-w-2xl">
            <Eyebrow>ספרייה</Eyebrow>
            <h2
              id="videos-list-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              סרטונים זמינים לחקירה.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed">
              {videos.length === 0
                ? "אין סרטונים להצגה כרגע. אפשר להתחיל מערוץ היוטיוב או לחזור לכאן בהמשך."
                : "בחרו סרטון. התמונה נטענת קודם. הנגן המלא נפתח בדף הצפייה."}
            </p>
          </div>

          {videos.length > 0 ? (
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id}>
                  <VideoCard video={v} />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10">
            <Link href="/search" className="link-arrow">
              לכל החיפוש
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="videos-philosophy-title" className="band-dark">
        <Watermark className="top-[-1rem] end-[-0.5rem] text-[5rem] text-background/[0.045] sm:text-[7rem] lg:text-[10rem]">
          מבנה
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Eyebrow onDark>למה וידאו</Eyebrow>
              <h2
                id="videos-philosophy-title"
                className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
              >
                וידאו אינו בידור.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-lg leading-relaxed text-background/80">
                הווידאו כאן אינו נועד לבדר או להלהיב. הוא דרך נוספת להתבונן
                במבנה: לראות את אותו מנגנון פועל בזמן אמת, בקול ובקצב אחר.
              </p>
              <p className="mt-5 max-w-prose leading-relaxed text-background/70">
                המאמרים נשארים מקור המסגרת. הווידאו מלווה אותם, לא מחליף אותם.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="videos-cta-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <span aria-hidden="true" className="accent-rule" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <h2
              id="videos-cta-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight lg:col-span-7 lg:text-4xl"
            >
              רוצים את המסגרת בכתב.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href="/articles" className="btn btn-primary">
                לקריאת המאמרים
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                ליצירת קשר
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
