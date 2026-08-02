"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { confirmLiveAge, revealLiveStreamUrl } from "@/actions/live-stream";
import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { LIVE_OPEN_MIC } from "@/lib/content/offers";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type LiveGateClientProps = {
  isLive: boolean;
  topic: string;
  signedIn: boolean;
  ageConfirmed: boolean;
};

/**
 * Client gate for /live: signup → 18+ → reveal YouTube URL (never in SSR HTML).
 */
export function LiveGateClient({
  isLive,
  topic,
  signedIn,
  ageConfirmed,
}: LiveGateClientProps) {
  const router = useRouter();
  const [ageChecked, setAgeChecked] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const openMicHref = buildWhatsAppHref(LIVE_OPEN_MIC.whatsappText);

  if (!isLive) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-base leading-relaxed text-foreground/80">
          שידור חי מהאין: פעם בשבוע, רק מתוך האתר.
        </p>
        <p className="mt-4 text-sm text-foreground/60">
          כשיהיה שידור פעיל, תופיע כאן דרישת הרשמה ואישור גיל 18+.
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <p className="text-center text-base leading-relaxed text-foreground/80">
          השידור פעיל. הרשמה חינם נדרשת כדי לקבל את הקישור.
        </p>
        {topic ? (
          <p className="text-center text-sm text-foreground/60">נושא: {topic}</p>
        ) : null}
        <MyListSignInForm nextPath="/live" variant="compact" />
      </div>
    );
  }

  if (!ageConfirmed) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <p className="text-center text-base leading-relaxed text-foreground/80">
          לפני הקישור: אשרו שאתם בני 18 ומעלה.
        </p>
        {topic ? (
          <p className="text-center text-sm text-foreground/60">נושא: {topic}</p>
        ) : null}
        <label className="flex items-start gap-3 text-start text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={ageChecked}
            onChange={(e) => setAgeChecked(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--action)]"
          />
          <span>אני מעל גיל 18 ומאשר/ת גישה לשידור החי.</span>
        </label>
        <button
          type="button"
          disabled={!ageChecked || pending}
          className="btn btn-primary w-full disabled:opacity-50"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await confirmLiveAge();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.refresh();
            });
          }}
        >
          {pending ? "מאשר..." : "המשך"}
        </button>
        {error ? (
          <p className="text-center text-sm text-action">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-4 text-center">
        {topic ? (
          <p className="text-sm text-foreground/60">נושא: {topic}</p>
        ) : null}
        {youtubeUrl ? (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-flex"
          >
            לצפייה בשידור החי
          </a>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="btn btn-primary disabled:opacity-50"
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await revealLiveStreamUrl();
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                if (result.youtubeUrl) {
                  setYoutubeUrl(result.youtubeUrl);
                }
              });
            }}
          >
            {pending ? "טוען..." : "קבלת קישור לשידור"}
          </button>
        )}
        {error ? <p className="text-sm text-action">{error}</p> : null}
      </div>

      <section
        aria-labelledby="live-open-mic-title"
        className="border border-foreground/15 p-5 text-start sm:p-6"
      >
        <h2
          id="live-open-mic-title"
          className="text-lg font-semibold tracking-tight"
        >
          {LIVE_OPEN_MIC.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {LIVE_OPEN_MIC.body}
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          {LIVE_OPEN_MIC.priceBeforeVat} לפני מע&quot;מ.
        </p>
        <a
          href={openMicHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-5 inline-flex"
        >
          {LIVE_OPEN_MIC.ctaLabel}
        </a>
      </section>
    </div>
  );
}
