"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { sendTestLivePush } from "@/actions/live-push";
import { endLiveStream, startLiveStream } from "@/actions/live-stream";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { LIVE_PAGE_URL } from "@/lib/live/schedule";
import {
  liveNowAnnounce,
  liveUpcomingAnnounce,
} from "@/lib/studio/whatsapp-templates";

export type LiveStudioStatus = {
  isLive: boolean;
  youtubeUrl: string;
  topic: string;
  startedAt: string | null;
  updatedAt: string | null;
};

type LiveStreamStudioPanelProps = {
  status: LiveStudioStatus;
  pushReady?: boolean;
  liveOptIns?: number;
};

/**
 * Studio control for שידור חי מהאין: paste unlisted YouTube Live URL and go live.
 */
export function LiveStreamStudioPanel({
  status,
  pushReady = false,
  liveOptIns = 0,
}: LiveStreamStudioPanelProps) {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState(status.youtubeUrl);
  const [topic, setTopic] = useState(status.topic);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const startedLabel = status.startedAt
    ? new Date(status.startedAt).toLocaleString("he-IL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const groupText = useMemo(
    () => liveNowAnnounce({ topic: topic || status.topic, individual: false }),
    [topic, status.topic],
  );
  const individualText = useMemo(
    () => liveNowAnnounce({ topic: topic || status.topic, individual: true }),
    [topic, status.topic],
  );
  const reminderText = useMemo(
    () =>
      liveUpcomingAnnounce({
        whenLabel: "לפי לוח השידורים באתר",
        topic: topic || status.topic,
      }),
    [topic, status.topic],
  );

  return (
    <section
      className="scroll-mt-6 space-y-5 border border-red-900/40 bg-red-950/15 p-5 sm:p-6"
      dir="rtl"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            שידור חי מהאין
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            הדביקו קישור YouTube Live לא רשום. כשהשידור פעיל, הקישור נחשף
            ב-/live רק אחרי הרשמה חינם ואישור גיל 18+.
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-medium ${
            status.isLive
              ? "bg-red-500/20 text-red-300"
              : "bg-zinc-700/60 text-zinc-300"
          }`}
        >
          {status.isLive ? "בשידור" : "כבוי"}
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        התראות דפדפן:{" "}
        {pushReady ? (
          <span className="text-emerald-400">VAPID מוכן</span>
        ) : (
          <span className="text-amber-300">חסר VAPID</span>
        )}
        {", "}
        {liveOptIns} נרשמו ללייב
      </p>

      {startedLabel && status.isLive ? (
        <p className="text-xs text-zinc-500">התחיל {startedLabel}.</p>
      ) : null}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="live-youtube-url"
            className="block text-xs text-zinc-400"
          >
            קישור YouTube (לא רשום)
          </label>
          <input
            id="live-youtube-url"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            dir="ltr"
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 w-full border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="live-topic" className="block text-xs text-zinc-400">
            נושא (אופציונלי)
          </label>
          <input
            id="live-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={300}
            placeholder="נושא מהתגובות השבוע"
            className="mt-1 w-full border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            className="bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-red-500"
            onClick={() => {
              setError(null);
              setMessage(null);
              startTransition(async () => {
                const result = await startLiveStream({
                  youtubeUrl,
                  topic,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(result.message ?? "בשידור. העתק הודעה לקבוצה למטה.");
                router.refresh();
              });
            }}
          >
            {pending ? "שומר..." : "התחל שידור"}
          </button>
          <button
            type="button"
            disabled={pending || !status.isLive}
            className="border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-400 disabled:opacity-40"
            onClick={() => {
              setError(null);
              setMessage(null);
              startTransition(async () => {
                const result = await endLiveStream();
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(result.message ?? "הסתיים.");
                router.refresh();
              });
            }}
          >
            סיים שידור
          </button>
          <button
            type="button"
            disabled={pending || !pushReady}
            className="border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400 disabled:opacity-40"
            title={
              pushReady
                ? "שולח התראת בדיקה למי שנרשם ללייב"
                : "חסרים מפתחות VAPID"
            }
            onClick={() => {
              setError(null);
              setMessage(null);
              startTransition(async () => {
                const result = await sendTestLivePush({
                  topic: topic || "בדיקת התראה",
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(result.message);
              });
            }}
          >
            בדיקת התראה
          </button>
        </div>
      </div>

      <div className="space-y-3 border border-zinc-800 bg-zinc-950/50 p-4">
        <p className="text-xs text-zinc-400">
          קישור ציבורי:{" "}
          <span className="text-zinc-200" dir="ltr">
            {LIVE_PAGE_URL}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <StudioCopyButton
            text={LIVE_PAGE_URL}
            label="העתק /live"
            onCopied={() => setMessage("קישור /live הועתק.")}
          />
          <StudioCopyButton
            text={groupText}
            label="העתק לקבוצה"
            onCopied={() => setMessage("הודעת קבוצה הועתקה.")}
          />
          <StudioCopyButton
            text={individualText}
            label="העתק לבודד"
            onCopied={() => setMessage("הודעה לבודד הועתקה.")}
          />
          <StudioCopyButton
            text={reminderText}
            label="תזכורת מראש"
            onCopied={() => setMessage("תזכורת הועתקה.")}
          />
        </div>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-sans text-xs text-zinc-500">
          {status.isLive ? groupText : reminderText}
        </pre>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    </section>
  );
}
