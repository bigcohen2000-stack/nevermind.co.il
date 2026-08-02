import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ClubBadge } from "@/components/videos/club-badge";
import { Eyebrow } from "@/components/ui/editorial";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  listConceptsWithVideoCounts,
  listVideosForConceptName,
} from "@/lib/videos/queries";
import {
  getTeaserThumbSrc,
  getWatchHref,
  GATED_LOCK_IMAGE,
} from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "נושאים בסרטונים",
  description:
    "עיון לפי מושג: רשימת נושאים עם סרטונים קשורים. אפשר לפתוח כל נושא ולעבור לצפייה.",
  alternates: {
    canonical: "https://nevermind.co.il/videos/topics",
  },
  openGraph: {
    title: "נושאים בסרטונים | NeverMinde",
    description:
      "עיון לפי מושג: רשימת נושאים עם סרטונים קשורים מתוך מאגר NeverMinde.",
    url: "https://nevermind.co.il/videos/topics",
    type: "website",
  },
};

const TOP_CONCEPTS = 24;
const VIDEOS_PER_CONCEPT = 6;

function TopicVideoRow({ video }: { video: Video }) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const href = getWatchHref(video);

  return (
    <li>
      <Link
        href={href}
        className="group flex gap-3 border border-foreground/15 bg-background p-2.5 no-underline transition hover:border-foreground/30 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <span className="relative aspect-video w-28 shrink-0 overflow-hidden border border-foreground/10 bg-paper sm:w-32">
          <Image
            src={thumb || GATED_LOCK_IMAGE}
            alt={video.title}
            fill
            sizes="128px"
            className="object-cover"
          />
          {gated ? <ClubBadge /> : null}
        </span>
        <span className="min-w-0 flex-1 self-center text-start">
          <span className="block text-sm font-medium leading-snug text-foreground group-hover:text-action">
            {video.title}
          </span>
          <span className="mt-1 block text-xs text-muted">
            {gated ? "נפתח אחרי כניסה למועדון" : "פתוח לכולם"}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function VideosTopicsPage() {
  const concepts = await listConceptsWithVideoCounts().catch(() => []);
  const top = concepts.slice(0, TOP_CONCEPTS);

  const sections = await Promise.all(
    top.map(async (concept) => {
      const videos = await listVideosForConceptName(
        concept.name,
        VIDEOS_PER_CONCEPT,
      ).catch(() => [] as Video[]);
      return { concept, videos };
    }),
  );

  const withVideos = sections.filter((s) => s.videos.length > 0);

  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <Eyebrow>וידאו</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          עיון לפי נושא
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-foreground/75">
          פתחו מושג כדי לראות סרטונים קשורים. אפשר גם לסנן לפי מושג בעמוד
          הסרטונים.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/videos" className="link-arrow">
            לכל הסרטונים
          </Link>
          <Link href="/concepts" className="link-arrow">
            למדריך המושגים
          </Link>
        </div>

        {withVideos.length === 0 ? (
          <p className="mt-12 text-foreground/70">
            עדיין אין נושאים עם סרטונים. לאחר סנכרון הם יופיעו כאן.
          </p>
        ) : (
          <section
            className="mt-12 space-y-3"
            aria-label="רשימת נושאים עם סרטונים"
          >
            {withVideos.map(({ concept, videos }) => (
              <details
                key={concept.id}
                className="group border border-foreground/15 bg-paper open:bg-background"
              >
                <summary className="cursor-pointer list-none px-4 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {concept.name}
                    </span>
                    <span className="text-xs text-muted">
                      {concept.videoCount} סרטונים
                      {videos.length < concept.videoCount
                        ? ` (מציגים ${videos.length})`
                        : ""}
                    </span>
                  </span>
                </summary>
                <div className="max-h-[28rem] overflow-y-auto border-t border-foreground/10 px-4 py-4 sm:px-5">
                  <ul className="space-y-2">
                    {videos.map((video) => (
                      <TopicVideoRow key={video.id} video={video} />
                    ))}
                  </ul>
                  {concept.videoCount > videos.length ? (
                    <p className="mt-4 text-sm">
                      <Link
                        href={`/videos?concept=${encodeURIComponent(concept.name)}`}
                        className="text-action no-underline hover:underline"
                      >
                        כל הסרטונים בנושא {concept.name}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
