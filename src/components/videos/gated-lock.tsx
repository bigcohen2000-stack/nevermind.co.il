import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ClubLoginForm } from "@/components/members/club-login-form";
import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { ArchiveTierPicker } from "@/components/premium/archive-tier-picker";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
import { ViewerFeedbackForm } from "@/components/videos/viewer-feedback-form";
import { GATED_LOCK_IMAGE } from "@/lib/videos/watch-path";

type GatedLockProps = {
  title: string;
  isAuthenticated?: boolean;
  /** Optional opaque thumb (already proxied). Never a YouTube URL. */
  thumbSrc?: string | null;
  /** Internal UUID for single-video WhatsApp unlock. */
  videoId?: string;
  /** Refresh stay on this watch URL after club login. */
  returnPath?: string;
  /** True when a dedicated teaser clip was (or will be) shown above. */
  hasTeaser?: boolean;
  /** RSC banner slot content (passed from a Server Component parent). */
  gateBanner?: ReactNode;
};

/**
 * Hard lock shell for members-only watch.
 * Three clear paths: member login, full archive, this video only.
 */
export function GatedLock({
  title,
  thumbSrc,
  videoId,
  returnPath,
  hasTeaser = false,
  gateBanner,
}: GatedLockProps) {
  const imageSrc = thumbSrc?.trim() || GATED_LOCK_IMAGE;

  return (
    <div className="w-full border border-foreground/15 bg-ink text-foreground">
      <div className="relative aspect-video w-full overflow-hidden bg-[#1A1A1A]">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 768px"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 px-6 text-center">
          <p className="text-sm text-[#FAFAF8]/70">מאגר המועדון</p>
          <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-[#FAFAF8]">
            להמשיך בחקירה דרך המועדון
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#FAFAF8]/75">
            {title}.
            {hasTeaser
              ? " הטעימה הסתיימה. להמשך בוחרים מסלול למטה."
              : " הסרטון המלא פתוח לחברי מועדון. בוחרים מסלול למטה."}
          </p>
        </div>
      </div>

      <div className="space-y-10 bg-background px-6 py-8">
        {gateBanner ? (
          <div className="mx-auto max-w-lg">{gateBanner}</div>
        ) : null}

        <section aria-labelledby="gate-path-member" className="mx-auto max-w-md">
          <p
            id="gate-path-member"
            className="text-xs font-medium tracking-wide text-action"
          >
            כבר יש לך גישה
          </p>
          <p className="mt-1 text-sm text-muted">
            כניסה עם שם, טלפון וסיסמה שקיבלת בוואטסאפ.
          </p>
          <div className="mt-4">
            <ClubLoginForm
              variant="gate"
              nextPath={returnPath || undefined}
            />
          </div>
        </section>

        <section
          aria-labelledby="gate-path-archive"
          className="mx-auto max-w-lg border-t border-foreground/10 pt-10"
        >
          <p
            id="gate-path-archive"
            className="text-xs font-medium tracking-wide text-action"
          >
            רוצה את כל המאגר
          </p>
          <p className="mt-1 text-sm text-muted">
            קודם בוחרים משך מנוי. אחר כך וואטסאפ לבדיקת התאמה וסגירה. אין
            סליקה באתר.
          </p>
          <div className="mt-4">
            <ArchiveTierPicker density="compact" requireExplicitSelect />
          </div>
          <div className="mt-6">
            <PrivatePodcastBanner density="compact" />
          </div>
        </section>

        {videoId ? (
          <section
            aria-labelledby="gate-path-single"
            className="mx-auto max-w-lg border-t border-foreground/10 pt-10"
          >
            <p
              id="gate-path-single"
              className="text-xs font-medium tracking-wide text-action"
            >
              רק הסרטון הזה
            </p>
            <p className="mt-1 text-sm text-muted">
              בלי מנוי מלא. בקשה בוואטסאפ לסרטון ספציפי.
            </p>
            <div className="mt-4">
              <SingleVideoRequestCta
                title={title}
                videoId={videoId}
                variant="lock"
              />
            </div>
          </section>
        ) : null}

        <section
          aria-labelledby="gate-path-feedback"
          className="mx-auto max-w-lg border-t border-foreground/10 pt-10"
        >
          <p
            id="gate-path-feedback"
            className="text-xs font-medium tracking-wide text-action"
          >
            לא אהבת / רוצה תשובה
          </p>
          <p className="mt-1 text-sm text-muted">
            משוב קצר על הסרטון או שאלה. אפשר גם בלי פרטי קשר.
          </p>
          <div className="mt-4">
            <ViewerFeedbackForm
              videoId={videoId}
              videoTitle={title}
            />
          </div>
        </section>

        <div className="mx-auto max-w-lg border-t border-foreground/10 pt-8">
          <p className="text-center text-sm text-muted">
            חשבון מייל לא פותח את המאגר. רק כניסת מועדון.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/members#access" className="btn btn-primary">
              בקשת גישה למועדון
            </Link>
            <Link
              href="/profile?mode=register"
              className="btn btn-secondary"
            >
              חשבון חינם
            </Link>
            <Link href="/videos?filter=open" className="btn btn-secondary">
              סרטונים פתוחים
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
