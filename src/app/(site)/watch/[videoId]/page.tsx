import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { getVideoProgressSeconds } from "@/actions/video-progress";
import { getPremiumStatus } from "@/actions/premium";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { RelatedExploration } from "@/components/search/related-exploration";
import { Eyebrow } from "@/components/ui/editorial";
import { BookingCta } from "@/components/videos/booking-cta";
import { GatedLock } from "@/components/videos/gated-lock";
import { ObjectiveTruthToggle } from "@/components/videos/objective-truth-toggle";
import { RabbitHoleWatchBridge } from "@/components/premium/rabbit-hole-watch-bridge";
import { RelatedVideoCard } from "@/components/videos/related-video-card";
import { TranscriptHeatmap } from "@/components/videos/transcript-heatmap";
import { WatchFocusLayout } from "@/components/videos/watch-focus-layout";
import { WatchSeekProvider } from "@/components/videos/watch-seek-context";
import { extractCuratedConcepts } from "@/lib/concepts/quality";
import { getRelatedArticlesForTerms } from "@/lib/search/related-content";
import {
  buildTranscriptHeatmap,
  segmentsFromFlatTranscript,
} from "@/lib/videos/heatmap";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildOpaqueThumbPath } from "@/lib/videos/thumb-token";
import {
  getRelatedVideos,
  getVideoConcepts,
  getVideoForWatch,
  getVideoTranscriptPayload,
} from "@/lib/videos/queries";
import { parseTimestampParam } from "@/lib/videos/timestamp";
import {
  getWatchHref,
  isUuidParam,
  isYoutubeIdParam,
} from "@/lib/videos/watch-path";
import { isYoutubeUnavailableTitle } from "@/lib/videos/youtube-availability";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideoForWatch(videoId).catch(() => null);

  if (!video || isMembersOnlyVideo(video)) {
    return {
      title: video?.title || "וידאו",
      robots: video && isMembersOnlyVideo(video)
        ? { index: false, follow: false }
        : undefined,
    };
  }

  if (isYoutubeUnavailableTitle(video.title)) {
    return {
      title: "הסרטון לא זמין",
      robots: { index: false, follow: false },
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

/**
 * Locked members-only watch shell.
 * Server-only gate: no player, iframe, transcript, or seek provider in the tree.
 * Dismissible marketing modals never wrap this path.
 * Thumbnail is opaque (proxied or brand). No YouTube id in markup.
 */
function LockedWatchPage({
  title,
  isAuthenticated,
  thumbSrc,
  videoId,
}: {
  title: string;
  isAuthenticated: boolean;
  thumbSrc: string;
  videoId: string;
}) {
  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <Eyebrow>צפייה</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          {title}
        </h1>
        <div className="mt-8 max-w-3xl">
          <GatedLock
            title={title}
            isAuthenticated={isAuthenticated}
            thumbSrc={thumbSrc}
            videoId={videoId}
          />
        </div>
      </div>
    </main>
  );
}

/** Clear Hebrew state when YouTube no longer serves the video. */
function UnavailableWatchPage() {
  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <Eyebrow>צפייה</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          הסרטון לא זמין יותר ביוטיוב
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-foreground/75">
          הסרטון הוסר או הוסתר בערוץ. הוא יוסר גם מהאתר בסנכרון הבא.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/videos" className="btn btn-primary">
            לכל הסרטונים
          </Link>
          <Link href="/search" className="btn btn-secondary">
            חיפוש
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { videoId } = await params;
  const { t } = await searchParams;

  let video;
  try {
    video = await getVideoForWatch(videoId);
  } catch {
    video = null;
  }

  if (!video) {
    notFound();
  }

  if (isYoutubeUnavailableTitle(video.title)) {
    return <UnavailableWatchPage />;
  }

  const premium = await getPremiumStatus().catch(() => ({
    isAuthenticated: false,
    isPremium: false,
    hasVideoAccess: false,
    userId: null,
  }));
  const access = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    clubSession: false,
    hasVideoAccess: false,
    isAuthenticated: premium.isAuthenticated,
    phone: null,
  }));
  const authed = access.isAuthenticated || premium.isAuthenticated;
  const entitled = access.entitled;
  const locked = isMembersOnlyVideo(video) && !entitled;

  // Members-only: canonicalize to opaque UUID so YouTube ids leave the address bar.
  if (
    isMembersOnlyVideo(video) &&
    isYoutubeIdParam(videoId) &&
    !isUuidParam(videoId)
  ) {
    const dest = getWatchHref(video);
    const qs = t ? `?t=${encodeURIComponent(t)}` : "";
    permanentRedirect(`${dest}${qs}`);
  }

  // Hard stop: never mount player / related / transcript when locked.
  // Closing any Dialog elsewhere must not be able to reveal a player here.
  if (locked) {
    return (
      <LockedWatchPage
        title={video.title}
        isAuthenticated={authed}
        thumbSrc={buildOpaqueThumbPath(video.id)}
        videoId={video.id}
      />
    );
  }

  const urlStart = parseTimestampParam(t);
  const savedStart =
    urlStart <= 0 && authed
      ? await getVideoProgressSeconds(video.youtube_id).catch(() => 0)
      : 0;
  const startSeconds = urlStart > 0 ? urlStart : savedStart;

  const concepts = await getVideoConcepts(video.id).catch(() => []);
  const transcriptPayload = await getVideoTranscriptPayload(video.id).catch(
    () => null,
  );
  const transcript = transcriptPayload?.content ?? null;
  const coreFacts = Array.isArray(video.core_facts)
    ? video.core_facts.filter((f) => typeof f === "string" && f.trim())
    : [];
  const conceptIds = concepts.map((c) => c.concept_id);

  const heatConcepts = concepts.map((c) => ({
    name: c.name,
    startTimestamp: c.start_timestamp,
  }));
  const timedSegments =
    transcriptPayload?.segments && transcriptPayload.segments.length > 0
      ? transcriptPayload.segments
      : transcript
        ? segmentsFromFlatTranscript(
            transcript,
            Math.max(
              60,
              ...heatConcepts
                .map((c) => c.startTimestamp ?? 0)
                .concat([0]),
            ) + 60,
          )
        : [];
  const heatmapBuckets = buildTranscriptHeatmap(timedSegments, heatConcepts);
  const related = await getRelatedVideos(
    video.id,
    conceptIds,
    video.playlist_id,
    8,
    { entitled },
  ).catch(() => []);

  const relatedArticles = getRelatedArticlesForTerms(
    [
      ...concepts.map((c) => c.name).filter(Boolean),
      ...extractCuratedConcepts(
        video.title,
        video.description ?? "",
        [],
        8,
      ),
    ],
    { limit: 4 },
  );
  const articleSearchQuery =
    concepts.find((c) => c.name)?.name ||
    extractCuratedConcepts(video.title, video.description ?? "")[0] ||
    video.title;

  const nextCandidate =
    related.find((v) => v.sharedConcept && v.youtube_id?.trim()) ??
    related.find((v) => v.youtube_id?.trim()) ??
    null;
  const nextUp = nextCandidate
    ? {
        youtubeId: nextCandidate.youtube_id,
        title: nextCandidate.title,
        thumbnailUrl: nextCandidate.thumbnail_url,
        sharedConcept: nextCandidate.sharedConcept,
      }
    : null;

  const primaryTopic = concepts.find((c) => c.name)?.name || video.title;

  // Public videos only: never emit VideoObject with YouTube urls for gated.
  const jsonLd = !isMembersOnlyVideo(video)
    ? {
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
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <WatchSeekProvider>
        <WatchFocusLayout
          title={video.title}
          description={video.description}
          locked={false}
          eyebrow={<Eyebrow>צפייה</Eyebrow>}
          player={
            <RabbitHoleWatchBridge
              youtubeId={video.youtube_id}
              videoUuid={video.id}
              conceptIds={conceptIds}
              startSeconds={startSeconds}
              title={video.title}
              thumbnailUrl={video.thumbnail_url}
              isAuthenticated={authed}
              isPremium={entitled}
              nextUp={nextUp}
            />
          }
          belowPlayer={
            <>
              <TranscriptHeatmap buckets={heatmapBuckets} />

              <ObjectiveTruthToggle
                facts={coreFacts}
                transcript={transcript}
                videoTitle={video.title}
                concepts={concepts.map((c) => c.name)}
              />

              {concepts.length > 0 ? (
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
                              ? `${getWatchHref(video)}?t=${c.start_timestamp}`
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

              <div className="mt-8">
                <BookingCta topic={primaryTopic} context={video.title} />
              </div>

              <RelatedExploration
                articles={relatedArticles}
                searchQuery={articleSearchQuery}
                showEmpty={{ articles: true }}
              />
            </>
          }
          sidebar={
            <>
              <h2
                id="related-title"
                className="text-xl font-semibold tracking-tight"
              >
                סרטונים נוספים לחקירה בנושא
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                לפי מושגים משותפים או אותה רשימת השמעה.
              </p>

              {related.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {related.map((v) => (
                    <li key={v.id}>
                      <RelatedVideoCard video={v} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-muted">
                  אין עדיין סרטונים קשורים להצגה.
                </p>
              )}
            </>
          }
        />
      </WatchSeekProvider>
    </>
  );
}
