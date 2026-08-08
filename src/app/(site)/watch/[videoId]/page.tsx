import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Lock, Tag } from "lucide-react";

import { getVideoProgressSeconds } from "@/actions/video-progress";
import { isVideoCompleted } from "@/actions/video-completions";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { maskClubPhone } from "@/lib/club/phone";
import { logClubWatchEvent } from "@/lib/club/watch-events";
import { RelatedExploration } from "@/components/search/related-exploration";
import { JsonLd } from "@/components/seo/json-ld";
import { SetBreadcrumbCurrent } from "@/components/layout/site-breadcrumbs";
import { SiteBanner } from "@/components/site/site-banner";
import { Eyebrow } from "@/components/ui/editorial";
import { InfoTip } from "@/components/ui/info-tip";
import { BookingCta } from "@/components/videos/booking-cta";
import { CaptionTagCloud } from "@/components/videos/caption-tag-cloud";
import { ContinueExplorationTeaser } from "@/components/videos/continue-exploration-teaser";
import { FeaturedInvestigators } from "@/components/videos/featured-investigators";
import { InvestigationMetrics } from "@/components/videos/investigation-metrics";
import { ObjectiveTruthToggle } from "@/components/videos/objective-truth-toggle";
import { PremiumWatchStatus } from "@/components/videos/premium-watch-status";
import { RabbitHoleWatchBridge } from "@/components/premium/rabbit-hole-watch-bridge";
import { PublicWatchNextSteps } from "@/components/videos/public-watch-next-steps";
import { TeaserWatchGate } from "@/components/videos/teaser-watch-gate";
import { TranscriptHeatmap } from "@/components/videos/transcript-heatmap";
import { WatchAccessChooser } from "@/components/videos/watch-access-chooser";
import { WatchContentTabs } from "@/components/videos/watch-content-tabs";
import { WatchConversionProvider } from "@/components/videos/watch-conversion-provider";
import { WatchFocusLayout } from "@/components/videos/watch-focus-layout";
import {
  WatchExploreLinks,
  WatchGuideStrip,
  WatchLockedFaq,
} from "@/components/videos/watch-guide-strip";
import { WatchPrevNext } from "@/components/videos/watch-prev-next";
import { MarkCompleteButton } from "@/components/videos/mark-complete-button";
import { WatchQuickActions } from "@/components/videos/watch-quick-actions";
import { WatchTalkStrip } from "@/components/videos/watch-talk-strip";
import { LogicalContinuationLink } from "@/components/videos/logical-continuation-link";
import { WatchSeekProvider } from "@/components/videos/watch-seek-context";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { WhatsAppTopicSetter } from "@/components/contact/whatsapp-topic-context";
import {
  WATCH_LOCKED_FAQ,
  WATCH_LOCKED_HIGHLIGHTS,
  WATCH_MEMBER_HIGHLIGHTS,
  WATCH_PUBLIC_HIGHLIGHTS,
} from "@/lib/content/watch-page";
import {
  buildInfoTipsFaqLd,
  INFO_TIPS,
  type InfoTipKey,
} from "@/lib/content/info-tips";
import { extractCuratedConcepts } from "@/lib/concepts/quality";
import { isBreakdownLevel } from "@/lib/videos/investigation";
import { shareImageMetadata, shareOgImage } from "@/lib/og/share-image";
import { getRelatedArticlesForTerms } from "@/lib/search/related-content";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import {
  buildYakirCohenPersonLd,
  yakirCohenAuthorRef,
} from "@/lib/seo/person";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { buildCaptionTagCloud } from "@/lib/videos/caption-tag-cloud";
import {
  buildTranscriptHeatmap,
  segmentsFromFlatTranscript,
} from "@/lib/videos/heatmap";
import { getLogicalContinuation } from "@/lib/videos/logical-continuation";
import {
  getAdjacentVideos,
  getRelatedVideos,
  getVideoConcepts,
  getVideoForWatch,
  getVideoTranscriptPayload,
} from "@/lib/videos/queries";
import { getLockedTeaserYoutubeId } from "@/lib/videos/teaser";
import { buildOpaqueThumbPath } from "@/lib/videos/thumb-token";
import {
  formatTimestampLabel,
  formatTimestampParam,
  parseTimestampParam,
} from "@/lib/videos/timestamp";
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

function LockedWatchPage({
  title,
  thumbSrc,
  videoId,
  teaserYoutubeId,
  returnPath,
  isAuthenticated,
}: {
  title: string;
  thumbSrc: string;
  videoId: string;
  teaserYoutubeId: string | null;
  returnPath: string;
  isAuthenticated: boolean;
}) {
  const teaserThumb = teaserYoutubeId
    ? `https://i.ytimg.com/vi/${teaserYoutubeId}/hqdefault.jpg`
    : null;
  const gateBanner = <SiteBanner slot="watch_gate" density="compact" />;

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <SetBreadcrumbCurrent title={title} />
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-12 lg:py-14">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>מועדון</Eyebrow>
          <span className="inline-flex items-center gap-1 border border-action/40 px-2 py-0.5 text-xs text-action">
            <Lock className="size-3" aria-hidden />
            נעול
          </span>
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          טיזר קצר אם יש. הסרטון המלא אחרי כניסה למועדון. אין סליקה באתר.
        </p>

        <div className="mt-6 max-w-3xl">
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
            <div className="relative aspect-video overflow-hidden border border-foreground/15 bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc}
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
              {gateBanner}
            </div>
          )}
        </div>

        <div className="mt-8 max-w-3xl space-y-8">
          <WatchGuideStrip
            highlights={WATCH_LOCKED_HIGHLIGHTS}
            title="מה אפשר כאן בלי כניסה"
            lead="הכותרת גלויה. הצפייה המלאה אחרי מועדון או בקשת סרטון בודד."
          />
          <WatchAccessChooser
            title={title}
            videoId={videoId}
            returnPath={returnPath}
            isAuthenticated={isAuthenticated}
            hasTeaser={Boolean(teaserYoutubeId)}
          />
          <WatchLockedFaq items={WATCH_LOCKED_FAQ} />
          <WatchExploreLinks />
        </div>
      </div>
    </main>
  );
}

function UnavailableWatchPage() {
  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
        <Eyebrow>צפייה</Eyebrow>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          הסרטון לא זמין יותר ביוטיוב
        </h1>
        <p className="mt-3 max-w-prose text-sm text-muted sm:text-base">
          הסרטון הוסר או הוסתר בערוץ. הוא יוסר גם מהאתר בסנכרון הבא.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
  const watchHref = getWatchHref(video);

  if (
    isMembersOnlyVideo(video) &&
    isYoutubeIdParam(videoId) &&
    !isUuidParam(videoId)
  ) {
    const qs = t ? `?t=${encodeURIComponent(t)}` : "";
    permanentRedirect(`${watchHref}${qs}`);
  }

  if (locked) {
    const returnPath = `${watchHref}${t ? `?t=${encodeURIComponent(t)}` : ""}`;
    return (
      <LockedWatchPage
        title={video.title}
        thumbSrc={buildOpaqueThumbPath(video.id)}
        videoId={video.id}
        teaserYoutubeId={getLockedTeaserYoutubeId(video)}
        returnPath={returnPath}
        isAuthenticated={authed}
      />
    );
  }

  if (access.clubSession && access.phone && isMembersOnlyVideo(video)) {
    void logClubWatchEvent({ phone: access.phone, videoId: video.id });
  }

  const urlStart = parseTimestampParam(t);
  const [concepts, transcriptPayload, savedStart, completed] = await Promise.all([
    getVideoConcepts(video.id).catch(() => []),
    getVideoTranscriptPayload(video.id).catch(() => null),
    urlStart <= 0 && authed
      ? getVideoProgressSeconds(video.youtube_id).catch(() => 0)
      : Promise.resolve(0),
    authed
      ? isVideoCompleted(video.youtube_id).catch(() => false)
      : Promise.resolve(false),
  ]);
  const startSeconds = urlStart > 0 ? urlStart : savedStart;

  const transcript = transcriptPayload?.content ?? null;
  const coreFacts = Array.isArray(video.core_facts)
    ? video.core_facts.filter((f) => typeof f === "string" && f.trim())
    : [];
  const conceptIds = concepts.map((c) => c.concept_id);
  const conceptNames = concepts.map((c) => c.name);

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

  const [related, continuation, adjacent] = await Promise.all([
    getRelatedVideos(
      video.id,
      conceptIds,
      video.playlist_id,
      3,
      { entitled },
    ).catch(() => []),
    getLogicalContinuation({
      videoId: video.id,
      conceptNames:
        conceptNames.filter(Boolean).length > 0
          ? conceptNames.filter(Boolean)
          : extractCuratedConcepts(video.title, video.description ?? "", [], 6),
    }).catch(() => null),
    getAdjacentVideos(video.id, { entitled }).catch(() => ({
      prev: null,
      next: null,
    })),
  ]);

  const relatedArticles = getRelatedArticlesForTerms(
    [
      ...conceptNames.filter(Boolean),
      ...extractCuratedConcepts(video.title, video.description ?? "", [], 8),
    ],
    { limit: 3 },
  );
  const articleSearchQuery =
    concepts.find((c) => c.name)?.name ||
    extractCuratedConcepts(video.title, video.description ?? "")[0] ||
    video.title;

  const relatedFallback =
    related.find((v) => v.sharedConcept && v.youtube_id?.trim()) ??
    related.find((v) => v.youtube_id?.trim()) ??
    null;
  const nextUp =
    continuation?.youtubeId
      ? {
          youtubeId: continuation.youtubeId,
          title: continuation.videoTitle ?? continuation.nextTopic,
          thumbnailUrl: continuation.thumbnailUrl,
          sharedConcept: continuation.nextTopic,
        }
      : relatedFallback
        ? {
            youtubeId: relatedFallback.youtube_id,
            title: relatedFallback.title,
            thumbnailUrl: relatedFallback.thumbnail_url,
            sharedConcept: relatedFallback.sharedConcept,
          }
        : null;

  const primaryTopic = concepts.find((c) => c.name)?.name || video.title;
  const captionTags = buildCaptionTagCloud(
    transcript,
    conceptNames,
    24,
    timedSegments,
  );
  const hasMorePanel =
    heatmapBuckets.length > 0 ||
    Boolean(video.duration_seconds) ||
    captionTags.length > 0;

  const jsonLd = !isMembersOnlyVideo(video)
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: video.title,
        description:
          video.description?.trim() ||
          `${video.title}. ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור.`,
        thumbnailUrl: video.thumbnail_url
          ? [video.thumbnail_url]
          : [`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`],
        uploadDate: video.published_at || video.created_at,
        embedUrl: `https://www.youtube.com/embed/${video.youtube_id}${
          startSeconds > 0 ? `?start=${startSeconds}` : ""
        }`,
        contentUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
        inLanguage: "he",
        ...(typeof video.duration_seconds === "number" &&
        video.duration_seconds > 0
          ? {
              duration: `PT${Math.floor(video.duration_seconds / 60)}M${
                video.duration_seconds % 60
              }S`,
            }
          : {}),
        author: yakirCohenAuthorRef(),
        creator: yakirCohenAuthorRef(),
        publisher: {
          "@type": "Organization",
          name: "השם לא משנה",
          url: "https://nevermind.co.il",
        },
      }
    : null;

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "סרטונים", path: "/videos" },
    { name: video.title, path: watchHref },
  ]);

  const tipKeys: InfoTipKey[] = [];
  if (concepts.length > 0) tipKeys.push("concepts");
  if (isBreakdownLevel(video.breakdown_level)) tipKeys.push("breakdown");
  const tipsFaqLd =
    tipKeys.length > 0 ? buildInfoTipsFaqLd(tipKeys) : null;

  return (
    <>
      <SetBreadcrumbCurrent title={video.title} />
      <WhatsAppTopicSetter topic={video.title} />
      <JsonLd data={breadcrumbLd} />
      {jsonLd ? <JsonLd data={buildYakirCohenPersonLd()} /> : null}
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      {tipsFaqLd ? <JsonLd data={tipsFaqLd} /> : null}

      <WatchConversionProvider
        videoTitle={video.title}
        showNudge={!entitled}
      >
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
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <WatchQuickActions
                title={video.title}
                shareUrl={watchHref}
                isMembersOnly={isMembersOnlyVideo(video)}
                isEntitled={entitled}
              />
              <MarkCompleteButton
                youtubeId={video.youtube_id}
                initialCompleted={completed}
                isAuthenticated={authed}
              />
            </div>
          }
          belowPlayer={
            <div className="space-y-5 sm:space-y-6">
              {entitled ? (
                <PremiumWatchStatus
                  displayName={access.displayName}
                  maskedPhone={maskClubPhone(access.phone)}
                />
              ) : null}

              <WatchTalkStrip topic={primaryTopic} />

              <WatchGuideStrip
                highlights={
                  entitled ? WATCH_MEMBER_HIGHLIGHTS : WATCH_PUBLIC_HIGHLIGHTS
                }
                title={entitled ? "מה פתוח לחברים" : "מה יש כאן"}
                lead={
                  entitled
                    ? "המאגר במכשיר הזה. אפשר להמשיך למושגים, לרמות, ולתיאום."
                    : "סרטון פתוח. מאגר המועדון נפתח בנפרד אחרי אישור."
                }
              />

              <WatchPrevNext prev={adjacent.prev} next={adjacent.next} />

              {concepts.length > 0 ? (
                <section aria-labelledby="concepts-title">
                  <h2
                    id="concepts-title"
                    className="flex flex-wrap items-center gap-1.5 text-sm font-semibold sm:text-base"
                  >
                    <Tag className="size-4 text-action" aria-hidden />
                    <span>מושגים</span>
                    <InfoTip label={INFO_TIPS.concepts.label}>
                      {INFO_TIPS.concepts.text}
                    </InfoTip>
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {concepts.map((c) => {
                      const stampLabel = formatTimestampLabel(c.start_timestamp);
                      const seekHref =
                        c.start_timestamp != null
                          ? `${watchHref}?t=${formatTimestampParam(c.start_timestamp)}`
                          : `/search?q=${encodeURIComponent(c.name)}`;
                      return (
                        <li key={c.concept_id}>
                          <Link
                            href={seekHref}
                            className="inline-flex min-h-10 items-center border border-foreground/15 bg-background px-3 py-1.5 text-sm transition hover:border-action hover:text-action"
                          >
                            {c.name}
                            {stampLabel ? ` (${stampLabel})` : ""}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {continuation ? (
                <LogicalContinuationLink
                  continuation={continuation}
                  className="lg:hidden"
                />
              ) : null}

              <WatchContentTabs
                insight={
                  <div className="space-y-4 [&>section]:mt-0">
                    <ObjectiveTruthToggle
                      facts={coreFacts}
                      transcript={authed ? transcript : null}
                      segments={authed ? timedSegments : []}
                      transcriptAvailable={Boolean(transcript?.trim())}
                      canViewTranscript={authed}
                      signInNextPath={watchHref}
                      videoTitle={video.title}
                      concepts={conceptNames}
                    />
                    {!isMembersOnlyVideo(video) && !entitled ? (
                      <ContinueExplorationTeaser
                        label={video.club_teaser_label}
                        href={video.club_teaser_href}
                      />
                    ) : null}
                    <RelatedExploration
                      articles={relatedArticles}
                      searchQuery={articleSearchQuery}
                      showEmpty={{ articles: false }}
                    />
                  </div>
                }
                more={
                  hasMorePanel ? (
                    <div className="space-y-6">
                      <TranscriptHeatmap buckets={heatmapBuckets} />
                      <InvestigationMetrics
                        durationSeconds={video.duration_seconds}
                        breakdownLevel={video.breakdown_level}
                        heatmapBuckets={heatmapBuckets}
                        conceptNames={conceptNames}
                        watchHref={watchHref}
                      />
                      <CaptionTagCloud tags={captionTags} />
                      <FeaturedInvestigators
                        videoId={video.id}
                        youtubeId={video.youtube_id}
                        watchHref={watchHref}
                      />
                    </div>
                  ) : undefined
                }
                talk={<BookingCta topic={primaryTopic} context={video.title} />}
              />

              {!entitled ? (
                <PublicWatchNextSteps
                  isAuthenticated={authed}
                  transcript={authed ? transcript : null}
                  transcriptAvailable={Boolean(transcript?.trim())}
                  videoTitle={video.title}
                  signInNextPath={watchHref}
                  clubLabel={video.club_teaser_label}
                  clubHref={video.club_teaser_href}
                />
              ) : null}

              <WatchExploreLinks />

              {!entitled ? <NewsletterSignup source="watch" /> : null}
            </div>
          }
          sidebar={
            continuation ? (
              <LogicalContinuationLink continuation={continuation} />
            ) : related.length > 0 ? (
              <div>
                <p className="text-xs font-medium tracking-wide text-action">
                  המשך
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                  סרטונים להמשך
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  מאותו נושא. ממשיכים בלי לחפש.
                </p>
                <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                  {related.slice(0, 1).map((v) => (
                    <li key={v.id}>
                      <Link
                        href={
                          v.youtube_id
                            ? `/watch/${v.youtube_id}`
                            : `/watch/${v.id}`
                        }
                        className="block border border-foreground/10 p-3 text-sm no-underline transition hover:border-action hover:no-underline"
                      >
                        {v.title}
                        {v.sharedConcept ? (
                          <span className="mt-1 block text-xs text-muted">
                            דרך: {v.sharedConcept}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          }
        />
      </WatchSeekProvider>
      </WatchConversionProvider>
    </>
  );
}
