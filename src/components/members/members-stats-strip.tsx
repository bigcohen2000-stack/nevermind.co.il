"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

import { InfoTip } from "@/components/ui/info-tip";
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
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            {gated ? "נפתח אחרי כניסה למועדון" : "פתוח לכולם"}
            <InfoTip
              label={gated ? "הסבר על סרטון מועדון" : "הסבר על סרטון פתוח"}
            >
              {gated
                ? "הכותרת גלויה. הצפייה המלאה רק אחרי כניסה למועדון במכשיר."
                : "אפשר לצפות בלי סיסמה ובלי חברות במועדון."}
            </InfoTip>
          </span>
        </span>
      </Link>
    </li>
  );
}

function ProofStat({
  title,
  tipLabel,
  tip,
  children,
  hint,
  href,
  hrefLabel,
}: {
  title: string;
  tipLabel: string;
  tip: string;
  children: ReactNode;
  hint: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="border border-foreground/15 bg-background p-5 sm:p-6">
      <dt className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span>{title}</span>
        <InfoTip label={tipLabel}>{tip}</InfoTip>
      </dt>
      <dd className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        {children}
      </dd>
      <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
      {href && hrefLabel ? (
        <Link
          href={href}
          className="mt-3 inline-flex text-sm text-action underline-offset-4 hover:underline"
        >
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}

function AccordionItem({
  id,
  title,
  tip,
  tipLabel,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  tip: string;
  tipLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      id={id}
      open={defaultOpen || undefined}
      className="group border border-foreground/15 bg-background open:bg-background"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-1.5 text-start text-base font-semibold tracking-tight">
          <span>{title}</span>
          <span
            onClick={(e) => e.preventDefault()}
            onKeyDown={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <InfoTip label={tipLabel}>{tip}</InfoTip>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-sm text-muted transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-foreground/10 px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </div>
    </details>
  );
}

type MembersStatsStripProps = {
  preview: MembersLibraryPreview;
};

const proof = MEMBERS_STATIC_PROOF;

/**
 * Depth proof (static) + live club/open split + sample titles.
 * Primary numbers stay visible. Details open in accordion panels.
 */
export function MembersStatsStrip({ preview }: MembersStatsStripProps) {
  const { stats, clubSamples, publicSamples } = preview;

  return (
    <section
      aria-labelledby="members-stats-title"
      className="scroll-mt-24 border-y border-foreground/10 bg-paper text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16 lg:py-20">
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
          ארבעה מדדי עומק יציבים. פירוט הרמות, הספירה החיה והדוגמאות נפתחים
          למטה. לחצו על סימן המידע ליד כל מושג.
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProofStat
            title="שעות חקירה"
            tipLabel="הסבר על שעות חקירה"
            tip={proof.libraryHoursTip}
            hint={proof.libraryHoursLabel}
            href="/videos"
            hrefLabel="לעמוד הווידאו"
          >
            <AnimatedNumber value={proof.libraryHoursMin} />+
          </ProofStat>

          <ProofStat
            title="סרטוני ארכיון"
            tipLabel="הסבר על סרטוני ארכיון"
            tip={proof.libraryVideosTip}
            hint={proof.libraryVideosLabel}
            href="/videos?filter=club"
            hrefLabel="סרטוני מועדון"
          >
            ~
            <AnimatedNumber value={proof.libraryVideosApprox} />
          </ProofStat>

          <ProofStat
            title="מושגים שפורקו"
            tipLabel="הסבר על מושגים שפורקו"
            tip={proof.conceptsExploredTip}
            hint={proof.conceptsExploredLabel}
            href="/concepts"
            hrefLabel="למדריך המושגים"
          >
            <AnimatedNumber value={proof.conceptsExploredMin} />+
          </ProofStat>

          <ProofStat
            title="מאז"
            tipLabel="הסבר על שנת ההתחלה"
            tip={proof.activeSinceTip}
            hint={proof.activeSinceLabel}
            href="/mechanisms"
            hrefLabel="למפת המנגנונים"
          >
            <AnimatedNumber value={proof.activeSinceYear} />
          </ProofStat>
        </dl>

        <div className="mt-6 flex flex-wrap items-start gap-2 border border-action/25 bg-background p-5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <span>{proof.communityLabel}</span>
              <InfoTip label="הסבר על הקהילה הסגורה">
                {proof.communityTip}
              </InfoTip>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {proof.communityBody}
            </p>
          </div>
          <Link href="#login" className="btn btn-secondary shrink-0 text-sm">
            לכניסה
          </Link>
        </div>

        <div className="mt-10 space-y-3">
          <AccordionItem
            id="members-levels"
            title={`${proof.investigationLevels} רמות חקירה`}
            tipLabel="הסבר על רמות חקירה"
            tip={proof.investigationLevelsTip}
            defaultOpen
          >
            <p className="max-w-prose text-sm text-muted">
              סדר בתהליך הפירוק של המחשבה. מהבסיס עד הפירוק הגולמי.
            </p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {MEMBERS_INVESTIGATION_LEVELS.map((level) => (
                <li
                  key={level.id}
                  className="border border-foreground/15 bg-paper p-5"
                >
                  <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted">
                    <span>רמה {level.level}</span>
                    <InfoTip label={`הסבר על רמה ${level.level}`}>
                      {level.body}
                    </InfoTip>
                  </p>
                  <h4 className="mt-2 text-lg font-semibold tracking-tight">
                    {level.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                    {level.body}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <Link
                      href={`/videos?breakdown=${level.id}`}
                      className="text-action underline-offset-4 hover:underline"
                    >
                      סרטונים ברמה זו
                    </Link>
                    <Link
                      href="/search"
                      className="text-foreground/70 underline-offset-4 hover:underline"
                    >
                      חיפוש במאגר
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm">
              <Link href="/mechanisms" className="link-arrow">
                איך המנגנונים מאורגנים ←
              </Link>
            </p>
          </AccordionItem>

          {(stats.totalVideos > 0 || clubSamples.length > 0) && (
            <AccordionItem
              id="members-live-split"
              title="כמה פתוח. כמה למועדון"
              tipLabel="הסבר על הספירה החיה"
              tip="ספירה מהמסד באתר אחרי סנכרון. יכולה להיות נמוכה מהאומדן הסטטי של כל הארכיון ההיסטורי."
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="border border-foreground/15 bg-paper p-5">
                  <dt className="flex items-center gap-1.5 text-sm font-medium">
                    <span>סרטוני מועדון</span>
                    <InfoTip label="הסבר על סרטוני מועדון">
                      לא רשומים או חסומים. הכותרת גלויה. הצפייה אחרי כניסה.
                    </InfoTip>
                  </dt>
                  <dd className="mt-2 text-4xl font-semibold tracking-tight">
                    <AnimatedNumber value={stats.clubVideos} />
                  </dd>
                </div>
                <div className="border border-foreground/15 bg-paper p-5">
                  <dt className="flex items-center gap-1.5 text-sm font-medium">
                    <span>סרטונים פתוחים</span>
                    <InfoTip label="הסבר על סרטונים פתוחים">
                      זמינים לכולם באתר, בלי סיסמה ובלי חברות.
                    </InfoTip>
                  </dt>
                  <dd className="mt-2 text-4xl font-semibold tracking-tight">
                    <AnimatedNumber value={stats.publicVideos} />
                  </dd>
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

              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link href="/videos?filter=club" className="link-arrow">
                  סרטוני מועדון
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
                <Link href="/paths" className="link-arrow">
                  מסלולים ומחירים
                </Link>
              </p>
            </AccordionItem>
          )}

          {(clubSamples.length > 0 || publicSamples.length > 0) && (
            <AccordionItem
              id="members-samples"
              title="דוגמאות מהמאגר"
              tipLabel="הסבר על הדוגמאות"
              tip="כותרות לדוגמה מהמאגר. סרטון מועדון דורש כניסה. סרטון פתוח זמין מיד."
            >
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-action">
                    <span>מהמועדון</span>
                    <InfoTip label="הסבר על דוגמאות מועדון">
                      דוגמאות חסומות. אפשר לבקש סרטון בודד או להיכנס למועדון.
                    </InfoTip>
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
                  <h3 className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-action">
                    <span>פתוחות</span>
                    <InfoTip label="הסבר על דוגמאות פתוחות">
                      אפשר לצפות בלי כניסה. דרך טובה לבדוק את הכיוון לפני מועדון.
                    </InfoTip>
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
            </AccordionItem>
          )}

          <AccordionItem
            id="members-credibility-faq"
            title="שאלות על האמינות"
            tipLabel="הסבר על שאלות האמינות"
            tip="תשובות קצרות על המספרים, הקהילה, וההבדל בין אומדן סטטי לספירה חיה."
          >
            <dl className="space-y-5 text-sm leading-relaxed">
              <div>
                <dt className="font-semibold text-foreground">
                  למה יש אומדן וגם ספירה חיה?
                </dt>
                <dd className="mt-1 text-muted">
                  האומדן מתאר את עומק הארכיון ההיסטורי. הספירה החיה מתארת מה
                  מסונכרן ופתוח/חסום באתר עכשיו.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">
                  למה אין מספר מנויים?
                </dt>
                <dd className="mt-1 text-muted">
                  כי הכמות לא מדד לעומק. הקהילה סגורה אחרי בדיקת התאמה.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">
                  איך בודקים לפני שמצטרפים?
                </dt>
                <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  <Link href="/videos?filter=open" className="link-arrow">
                    סרטונים פתוחים
                  </Link>
                  <Link href="/articles" className="link-arrow">
                    מאמרים
                  </Link>
                  <Link href="/contact" className="link-arrow">
                    שאלות בצור קשר
                  </Link>
                  <Link href="/paths" className="link-arrow">
                    מסלולים
                  </Link>
                </dd>
              </div>
            </dl>
          </AccordionItem>
        </div>
      </div>
    </section>
  );
}
