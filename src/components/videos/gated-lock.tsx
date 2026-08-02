import Image from "next/image";
import Link from "next/link";

import { SmsContactButton } from "@/components/contact/sms-contact-button";
import { ArchiveTierPicker } from "@/components/premium/archive-tier-picker";
import { SingleVideoRequestCta } from "@/components/videos/single-video-request";
import {
  ACCESS_GATE_PRIMARY_CTA,
  ACCESS_GATE_PRIMARY_WHATSAPP,
} from "@/lib/premium/access-gate-copy";
import { GATED_LOCK_IMAGE } from "@/lib/videos/watch-path";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type GatedLockProps = {
  title: string;
  isAuthenticated?: boolean;
  /** Optional opaque thumb (already proxied). Never a YouTube URL. */
  thumbSrc?: string | null;
  /** Internal UUID for single-video WhatsApp unlock. */
  videoId?: string;
};

/**
 * Hard lock shell for members-only watch.
 * No player, no YouTube href/src, no video id in markup.
 */
export function GatedLock({ title, thumbSrc, videoId }: GatedLockProps) {
  const primaryHref = buildWhatsAppHref(ACCESS_GATE_PRIMARY_WHATSAPP);
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
          <p className="text-sm text-[#FAFAF8]/70">
            <span aria-hidden="true">🔒 </span>
            מאגר המועדון
          </p>
          <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-[#FAFAF8]">
            התוכן פתוח לחברי המועדון
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#FAFAF8]/75">
            {title}. הצפייה חסומה כאן. אין קישור למקור חיצוני בעמוד זה.
          </p>
        </div>
      </div>

      <div className="bg-background px-6 py-8 text-center">
        {videoId ? (
          <SingleVideoRequestCta
            title={title}
            videoId={videoId}
            variant="lock"
          />
        ) : null}

        <p className="mt-8 text-sm leading-relaxed text-foreground/70">
          או נכנסים עם קישור אישי / סיסמה, או מבקשים הרשאה למאגר המלא עם מסגרת
          מחיר.
        </p>

        <div className="mx-auto mt-6 max-w-lg text-start">
          <ArchiveTierPicker density="compact" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/members#login" className="btn btn-primary">
            כניסה למועדון
          </Link>
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            {ACCESS_GATE_PRIMARY_CTA}
          </a>
          <SmsContactButton
            message={ACCESS_GATE_PRIMARY_WHATSAPP}
            label="SMS רגיל"
          />
        </div>
      </div>
    </div>
  );
}
