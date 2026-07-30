import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Eyebrow } from "@/components/ui/editorial";
import { BookingCta } from "@/components/videos/booking-cta";
import { GatedLock } from "@/components/videos/gated-lock";
import { RelatedVideoCard } from "@/components/videos/related-video-card";
import { WatchPlayer } from "@/components/videos/watch-player";
import {
  getRelatedVideos,
  getVideoByYoutubeId,
  getVideoConcepts,
  isAuthenticated,
} from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideoByYoutubeId(videoId).catch(() => null);

  if (!video || video.is_gated) {
    return {
      title: "וידאו",
      robots: video?.is_gated ? { index: false, follow: false } : undefined,
    };
  }

  return {
    title: video.title,
    description: video.description?.slice(0, 160) || video.title,
    alternates: {
      canonical: `https://nevermind.co.il/watch/${video.youtube_id}`,
    },
    openGraph: {
      title: video.title,
      description: video.description?.slice(0, 160) || video.title,
      type: "video.other",
      url: `https://nevermind.co.il/watch/${video.youtube_id}`,
      images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : undefined,
    },
  };
}

function parseStartSeconds(t: string | undefined): number {
  if (!t) return 0;
  const asNumber = Number(t);
  if (Number.isFinite(asNumber) && asNumber >= 0) return Math.floor(asNumber);
  const match = /^(\d+)s?$/i.exec(t);
  return match ? Number(match[1]) : 0;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { videoId } = await params;
  const { t } = await searchParams;

  let video;
  try {
    video = await getVideoByYoutubeId(videoId);
  } catch {
    video = null;
  }

  if (!video) {
    notFound();
  }

  const authed = await isAuthenticated().catch(() => false);
  const locked = video.is_gated && !authed;
  const startSeconds = parseStartSeconds(t);

  const concepts = locked
    ? []
    : await getVideoConcepts(video.id).catch(() => []);
  const conceptIds = concepts.map((c) => c.concept_id);
  const related = locked
    ? []
    : await getRelatedVideos(
        video.id,
        conceptIds,
        video.playlist_id,
      ).catch(() => []);

  const primaryTopic = concepts.find((c) => c.name)?.name || video.title;

  const jsonLd = locked
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnail_url
          ? [video.thumbnail_url]
          : [`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`],
        uploadDate: video.created_at,
        embedUrl: `https://www.youtube.com/embed/${video.youtube_id}${
          startSeconds > 0 ? `?start=${startSeconds}` : ""
        }`,
        contentUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
        inLanguage: "he",
      };

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <Eyebrow>צפייה</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          {video.title}
        </h1>
        {video.description ? (
          <p className="mt-4 max-w-3xl leading-relaxed text-foreground/75">
            {video.description}
          </p>
        ) : null}

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            {locked ? (
              <GatedLock title={video.title} />
            ) : (
              <WatchPlayer
                youtubeId={video.youtube_id}
                startSeconds={startSeconds}
                title={video.title}
              />
            )}

            {!locked && startSeconds > 0 ? (
              <p className="mt-3 text-sm text-muted">
                מתחיל ב־{Math.floor(startSeconds / 60)}:
                {String(startSeconds % 60).padStart(2, "0")} לפי הפרמטר{" "}
                <code className="text-foreground/80">?t={startSeconds}</code>
              </p>
            ) : null}

            {!locked && concepts.length > 0 ? (
              <section className="mt-8" aria-labelledby="concepts-title">
                <h2 id="concepts-title" className="text-lg font-semibold">
                  מושגים בסרטון
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {concepts.map((c) => (
                    <li key={c.concept_id}>
                      <Link
                        href={
                          c.start_timestamp != null
                            ? `/watch/${video.youtube_id}?t=${c.start_timestamp}`
                            : `/search?q=${encodeURIComponent(c.name)}`
                        }
                        className="border border-foreground/15 px-3 py-1.5 text-sm hover:border-action hover:text-action"
                      >
                        {c.name}
                        {c.start_timestamp != null
                          ? ` · ${c.start_timestamp}ש׳`
                          : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!locked ? (
              <div className="mt-8">
                <BookingCta topic={primaryTopic} />
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4" aria-labelledby="related-title">
            <h2
              id="related-title"
              className="text-xl font-semibold tracking-tight"
            >
              סרטונים נוספים לחקירה בנושא
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              לפי מושגים משותפים או אותה רשימת השמעה.
            </p>

            {!locked && related.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {related.map((v) => (
                  <li key={v.id}>
                    <RelatedVideoCard video={v} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-muted">
                {locked
                  ? "הפאנל זמין לאחר צפייה מורשית."
                  : "אין עדיין סרטונים קשורים להצגה."}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
