import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { getVideoProgressSeconds } from "@/actions/video-progress";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { maskClubPhone } from "@/lib/club/phone";
import { logClubWatchEvent } from "@/lib/club/watch-events";
import { RelatedExploration } from "@/components/search/related-exploration";
import { JsonLd } from "@/components/seo/json-ld";
import { ShareExplorationButton } from "@/components/share/share-exploration-button";
import { Eyebrow } from "@/components/ui/editorial";
import { BookingCta } from "@/components/videos/booking-cta";
import { ClubWatchIdentity } from "@/components/videos/club-watch-identity";
import { ContinueExplorationTeaser } from "@/components/videos/continue-exploration-teaser";
import { CaptionTagCloud } from "@/components/videos/caption-tag-cloud";
import { FeaturedInvestigators } from "@/components/videos/featured-investigators";
import { GatedLock } from "@/components/videos/gated-lock";
import { TeaserWatchGate } from "@/components/videos/teaser-watch-gate";
import { SiteBanner } from "@/components/site/site-banner";
import { InvestigationMetrics } from "@/components/videos/investigation-metrics";
import { ObjectiveTruthToggle } from "@/components/videos/objective-truth-toggle";
import { RabbitHoleWatchBridge } from "@/components/premium/rabbit-hole-watch-bridge";
import { RelatedVideoCard } from "@/components/videos/related-video-card";
import { TranscriptHeatmap } from "@/components/videos/transcript-heatmap";
import { WatchFocusLayout } from "@/components/videos/watch-focus-layout";
import { WatchSeekProvider } from "@/components/videos/watch-seek-context";
import { extractCuratedConcepts } from "@/lib/concepts/quality";
import { shareImageMetadata, shareOgImage } from "@/lib/og/share-image";
import { getRelatedArticlesForTerms } from "@/lib/search/related-content";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import {
  buildTranscriptHeatmap,
  segmentsFromFlatTranscript,
} from "@/lib/videos/heatmap";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildCaptionTagCloud } from "@/lib/videos/caption-tag-cloud";
import { getLockedTeaserYoutubeId } from "@/lib/videos/teaser";
import { buildOpaqueThumbPath } from "@/lib/videos/thumb-token";
import { getFeaturedInvestigatorComments } from "@/lib/videos/featured-comments";
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
    const title = video?.title || "וידאו";
    return {
      title,
      robots: video && isMembersOnlyVideo(video)
        ? { index: false, follow: false }
        : undefined,
      ...shareImageMetadata(title),
    };
  }

  if (isYoutubeUnavailableTitle(video.title)) {
    return {
      title: "הסרטון לא זמין",
      robots: { index: false, follow: false },
      ...shareImageMetadata("הסרטון לא זמין"),
    };
  }

  const description = video.description?.slice(0, 160) || video.title;
  const branded = shareOgImage(video.title);

  return {
    title: video.title,
    description,
    alternates: {
      canonical: `https://nevermind.co.il/watch/${video.youtube_id}`,
    },
    openGraph: {
      title: video.title,
      description,
      type: "video.other",
      url: `https://nevermind.co.il/watch/${video.youtube_id}`,
      images: video.thumbnail_url
        ? [{ url: video.thumbnail_url }]
        : branded,
    },
    twitter: {
      card: "summary_large_image",
      images: video.thumbnail_url
        ? [video.thumbnail_url]
        : branded.map((image) => image.url),
    },
  };
}

/**
 * Locked members-only watch shell.
 * Plays only a dedicated teaser clip id when set. Never the full archive id.
 */
function LockedWatchPage({
  title,
  thumbSrc,
  videoId,
  teaserYoutubeId,
  returnPath,
}: {
  title: string;
  thumbSrc: string;
  videoId: string;
  teaserYoutubeId: string | null;
  returnPath: string;
}) {
  const teaserThumb = teaserYoutubeId
    ? `https://i.ytimg.com/vi/${teaserYoutubeId}/hqdefault.jpg`
    : null;

  const gateBanner = <SiteBanner slot="watch_gate" density="compact" />;

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <Eyebrow>צפייה</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          {title}
        </h1>
        <div className="mt-8 max-w-3xl">
          {teaserYoutubeId ? (
            <TeaserWatchGate
              teaserYoutubeId={teaserYoutubeId}
              title={title}
              thumbnailUrl={teaserThumb}
              lockThumbSrc={thumbSrc}
              videoId={videoId}
              returnPath={returnPath}
              gateBanner={gateBanner}
            />
          ) : (
            <GatedLock
              title={title}
              thumbSrc={thumbSrc}
              videoId={videoId}
              returnPath={returnPath}
              hasTeaser={false}
              gateBanner={gateBanner}
            />
          )}
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

  // resolveVideoEntitlement already resolves premium/profile when needed.
  // Avoid a second getPremiumStatus round-trip on the critical path.
  const access = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    clubSession: false,
    hasVideoAccess: false,
    isAuthenticated: false,
    phone: null as string | null,
    displayName: null as string | null,
  }));
  const authed = access.isAuthenticated;
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

  // Hard stop: never mount full player / related / transcript when locked.
  // Only a dedicated teaser_youtube_id may reach the client.
  if (locked) {
    const returnPath = `${getWatchHref(video)}${t ? `?t=${encodeURIComponent(t)}` : ""}`;
    return (
      <LockedWatchPage
        title={video.title}
        thumbSrc={buildOpaqueThumbPath(video.id)}
        videoId={video.id}
        teaserYoutubeId={getLockedTeaserYoutubeId(video)}
        returnPath={returnPath}
      />
    );
  }

  if (access.clubSession && access.phone && isMembersOnlyVideo(video)) {
    void logClubWatchEvent({ phone: access.phone, videoId: video.id });
  }

  const urlStart = parseTimestampParam(t);
  const [concepts, transcriptPayload, savedStart] = await Promise.all([
    getVideoConcepts(video.id).catch(() => []),
    getVideoTranscriptPayload(video.id).catch(() => null),
    urlStart <= 0 && authed
      ? getVideoProgressSeconds(video.youtube_id).catch(() => 0)
      : Promise.resolve(0),
  ]);
  const startSeconds = urlStart > 0 ? urlStart : savedStart;

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

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "סרטונים", path: "/videos" },
    {
      name: video.title,
      path: getWatchHref(video),
    },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

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
              {access.clubSession ? (
                <ClubWatchIdentity
                  displayName={access.displayName}
                  maskedPhone={maskClubPhone(access.phone)}
                />
              ) : null}

              <TranscriptHeatmap buckets={heatmapBuckets} />

              <InvestigationMetrics
                durationSeconds={video.duration_seconds}
                breakdownLevel={video.breakdown_level}
                heatmapBuckets={heatmapBuckets}
                conceptNames={concepts.map((c) => c.name)}
                watchHref={getWatchHref(video)}
              />

              <CaptionTagCloud
                tags={buildCaptionTagCloud(
                  transcript,
                  concepts.map((c) => c.name),
                )}
              />

              <FeaturedInvestigators
                videoId={video.id}
                youtubeId={video.youtube_id}
                watchHref={getWatchHref(video)}
              />

              <ObjectiveTruthToggle
                facts={coreFacts}
                transcript={authed ? transcript : null}
                transcriptAvailable={Boolean(transcript?.trim())}
                canViewTranscript={authed}
                signInNextPath={getWatchHref(video)}
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
                <ShareExplorationButton
                  title={video.title}
                  text={`חקירה: ${video.title}`}
                  url={getWatchHref(video)}
                />
              </div>

              {!isMembersOnlyVideo(video) ? (
                <ContinueExplorationTeaser
                  label={video.club_teaser_label}
                  href={video.club_teaser_href}
                />
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
