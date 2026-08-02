"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

import { ClubBadge } from "@/components/videos/club-badge";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
import type {
  MembersLibraryPreview,
  MembersSampleVideo,
} from "@/lib/members/library-stats";
import {
  MEMBERS_INVESTIGATION_LEVELS,
  MEMBERS_STATIC_PROOF,
} from "@/lib/members/static-proof";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import {
  getTeaserThumbSrc,
  getWatchHref,
  GATED_LOCK_IMAGE,
} from "@/lib/videos/watch-path";

function formatHe(n: number): string {
  return n.toLocaleString("he-IL");
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 22 });
  const inView = useInView(ref, { once: true, margin: "-48px 0px" });

  useEffect(() => {
    if (!inView) return;
    motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatHe(value);
      return;
    }
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatHe(Math.round(latest));
      }
    });
    return unsub;
  }, [spring, reduceMotion, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatHe(value)}
    </span>
  );
}

function SampleCard({ video }: { video: MembersSampleVideo }) {
  const gated = isMembersOnlyVideo(video);
  const thumb = getTeaserThumbSrc(video, {
    opaqueThumbPath: video.thumbnail_url,
  });
  const href = getWatchHref(video);

  return (
    <li>
      {gated ? (
        <SingleVideoRequestCta title={video.title} videoId={video.id} />
      ) : null}
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

type MembersStatsStripProps = {
  preview: MembersLibraryPreview;
};

const proof = MEMBERS_STATIC_PROOF;

/**
 * Depth proof (static) + live club/open split + sample titles.
 */
export function MembersStatsStrip({ preview }: MembersStatsStripProps) {
  const { stats, clubSamples, publicSamples } = preview;

  return (
    <section
      aria-labelledby="members-stats-title"
      className="border-y border-foreground/10 bg-paper text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
        <p className="text-xs font-medium tracking-wide text-action">
          עומק הספרייה
        </p>
        <h2
          id="members-stats-title"
          className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
        >
          עומק במאגר. לא במה לרעש.
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          עובדות על עומק המאגר, יחד עם ספירה חיה של מה שפתוח ומה שבמועדון.
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border border-foreground/15 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">
              שעות חקירה במאגר
            </dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedNumber value={proof.libraryHoursMin} />+
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {proof.libraryHoursLabel}
            </p>
          </div>

          <div className="border border-foreground/15 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">
              סרטוני ארכיון
            </dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              ~
              <AnimatedNumber value={proof.libraryVideosApprox} />
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {proof.libraryVideosLabel}
            </p>
          </div>

          <div className="border border-foreground/15 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">
              מושגים שפורקו
            </dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedNumber value={proof.conceptsExploredMin} />+
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {proof.conceptsExploredLabel}
            </p>
          </div>

          <div className="border border-foreground/15 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">מאז</dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedNumber value={proof.activeSinceYear} />
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {proof.activeSinceLabel}
            </p>
          </div>

          <div className="border border-foreground/15 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">
              רמות פירוק
            </dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedNumber value={proof.investigationLevels} />
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              מהבסיס עד הפירוק הגולמי. סדר בתהליך החקירה.
            </p>
          </div>

          <div className="border border-action/30 bg-background p-5 sm:p-6">
            <dt className="text-sm font-medium text-foreground">המועדון</dt>
            <dd className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {proof.communityLabel}
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {proof.communityBody}
            </p>
          </div>
        </dl>

        <div className="mt-14">
          <h3 className="text-sm font-medium tracking-wide text-action">
            {proof.investigationLevels} רמות חקירה
          </h3>
          <p className="mt-2 max-w-prose text-sm text-muted">
            סדר בתהליך הפירוק של המחשבה. מהבסיס עד הפירוק הגולמי.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {MEMBERS_INVESTIGATION_LEVELS.map((level) => (
              <li
                key={level.id}
                className="border border-foreground/15 bg-background p-5"
              >
                <p className="text-xs font-medium tracking-wide text-muted">
                  רמה {level.level}
                </p>
                <h4 className="mt-2 text-lg font-semibold tracking-tight">
                  {level.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                  {level.body}
                </p>
                <Link
                  href={`/videos?breakdown=${level.id}`}
                  className="mt-3 inline-flex text-sm text-action underline-offset-4 hover:underline"
                >
                  סרטונים ברמה זו
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {(stats.totalVideos > 0 || clubSamples.length > 0) && (
          <>
            <h3 className="mt-14 text-sm font-medium tracking-wide text-action">
              כמה פתוח. כמה למועדון
            </h3>
            <p className="mt-2 max-w-prose text-sm text-muted">
              ספירה חיה מהאתר. מתעדכנת עם הסנכרון.
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-foreground/15 bg-background p-5 sm:p-6">
                <dt className="text-sm font-medium text-foreground">
                  סרטוני מועדון
                </dt>
                <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                  <AnimatedNumber value={stats.clubVideos} />
                </dd>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  לא רשומים או חסומים. הכותרת גלויה. הצפייה אחרי כניסה.
                </p>
              </div>
              <div className="border border-foreground/15 bg-background p-5 sm:p-6">
                <dt className="text-sm font-medium text-foreground">
                  סרטונים פתוחים
                </dt>
                <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                  <AnimatedNumber value={stats.publicVideos} />
                </dd>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  זמינים לכולם באתר, בלי סיסמה.
                </p>
              </div>
            </dl>

            <p className="mt-4 text-sm text-muted">
              סך הכל בספרייה:{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatHe(stats.totalVideos)}
              </span>
              {stats.concepts > 0 ? (
                <>
                  {" "}
                  · מושגים באינדקס:{" "}
                  <Link
                    href="/concepts"
                    className="font-medium tabular-nums text-foreground underline-offset-4 hover:underline"
                  >
                    {formatHe(stats.concepts)}
                  </Link>
                </>
              ) : null}
            </p>

            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/videos?filter=club" className="link-arrow">
                סרטוני מועדון בוידאו
              </Link>
              <Link href="/videos?filter=open" className="link-arrow">
                סרטונים פתוחים
              </Link>
              <Link href="/search" className="link-arrow">
                חיפוש
              </Link>
              <Link href="/articles" className="link-arrow">
                מאמרים
              </Link>
            </p>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium tracking-wide text-action">
                  דוגמאות מהמועדון
                </h3>
                {clubSamples.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {clubSamples.map((video) => (
                      <SampleCard key={video.id} video={video} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    עדיין אין סרטוני מועדון מסומנים במסד.
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium tracking-wide text-action">
                  דוגמאות פתוחות
                </h3>
                {publicSamples.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {publicSamples.map((video) => (
                      <SampleCard key={video.id} video={video} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    אין דוגמאות פתוחות כרגע.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
