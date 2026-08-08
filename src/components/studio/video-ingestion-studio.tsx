"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import {
  markUnlistedVideos,
  type MarkUnlistedResult,
} from "@/actions/mark-unlisted";
import {
  ingestVideoData,
  type IngestVideoResult,
} from "@/actions/video-ingestion";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

type ToastState =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

type VideoIngestionStudioProps = {
  initialVideos: Video[];
  /** When true, skip page header/nav (embedded in Studio accordion). */
  embedded?: boolean;
};

async function ingestFormAction(
  _prev: IngestVideoResult | null,
  formData: FormData,
): Promise<IngestVideoResult> {
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "");
  return ingestVideoData(youtubeUrl);
}

async function markUnlistedFormAction(
  _prev: MarkUnlistedResult | null,
  formData: FormData,
): Promise<MarkUnlistedResult> {
  const rawIds = String(formData.get("unlistedIds") ?? "");
  return markUnlistedVideos(rawIds);
}

function SyncSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "מייבאים..." : "ייבוא סרטון"}
    </button>
  );
}

function MarkUnlistedSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center border border-zinc-600 bg-zinc-950 px-5 text-sm font-semibold text-zinc-100 transition hover:border-red-500/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "מסמנים..." : "סמן כמועדון (לא רשום)"}
    </button>
  );
}

export function VideoIngestionStudio({
  initialVideos,
}: VideoIngestionStudioProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [videos, setVideos] = useState(initialVideos);
  const [result, formAction, isPending] = useActionState(
    ingestFormAction,
    null,
  );
  const [unlistedResult, unlistedFormAction, isUnlistedPending] =
    useActionState(markUnlistedFormAction, null);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    lastTitle?: string;
  } | null>(null);
  const [bulkPending, startBulkTransition] = useTransition();

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  useEffect(() => {
    if (!result) return;

    if (result.ok) {
      const gateNote =
        result.isUnlisted || result.isGated
          ? " סומן כמועדון / לא רשום."
          : "";
      setToast({
        kind: "success",
        message: `יובא: "${result.title}" (${result.concepts.length} מושגים, תמליל ${result.transcriptLength} תווים).${gateNote}`,
      });
      router.refresh();
      return;
    }

    setToast({ kind: "error", message: result.error });
  }, [result, router]);

  useEffect(() => {
    if (!unlistedResult) return;

    if (unlistedResult.ok) {
      const soft =
        unlistedResult.errors.length > 0
          ? ` שגיאות רכות: ${unlistedResult.errors.length}.`
          : "";
      setToast({
        kind: "success",
        message: `עודכנו ${unlistedResult.upserted} סרטונים (מועדון: ${unlistedResult.gatedCount}, לא רשום: ${unlistedResult.unlistedCount}).${soft}`,
      });
      router.refresh();
      return;
    }

    setToast({ kind: "error", message: unlistedResult.error });
  }, [unlistedResult, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="space-y-6" dir="rtl">
      <section
        id="ingest"
        className="scroll-mt-6 border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-zinc-100">ייבוא סרטון</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          מדביקים קישור יוטיוב. המערכת מושכת כותרת, תמליל ומושגים ושומרת
          במאגר.
        </p>
        <form action={formAction} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="youtube-url"
              className="mb-1.5 block text-sm text-zinc-300"
            >
              קישור יוטיוב
            </label>
            <input
              id="youtube-url"
              name="youtubeUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              dir="ltr"
              placeholder="https://youtu.be/... או https://www.youtube.com/watch?v=..."
              disabled={isPending}
              className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-500/70 disabled:opacity-60"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SyncSubmitButton />
            {isPending ? (
              <p className="text-sm text-zinc-400" aria-live="polite">
                מושכים מטא־דאטה ותמליל...
              </p>
            ) : null}
          </div>
        </form>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <h3 className="text-sm font-semibold text-zinc-200">ייבוא מרובה</h3>
          <p className="mt-2 text-sm text-zinc-400">
            שורה לכל קישור יוטיוב. המערכת מייבאת ברצף ומציגה התקדמות.
          </p>
          <textarea
            id="bulk-youtube-urls"
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            rows={6}
            dir="ltr"
            disabled={bulkPending || isPending}
            placeholder={"https://youtu.be/abc\nhttps://www.youtube.com/watch?v=xyz"}
            className="mt-4 w-full border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-500/70 disabled:opacity-60"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={bulkPending || isPending || !bulkUrls.trim()}
              className="inline-flex min-h-11 items-center justify-center border border-zinc-600 bg-zinc-950 px-5 text-sm font-semibold text-zinc-100 transition hover:border-red-500/60 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                const lines = bulkUrls
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean);
                if (lines.length === 0) return;

                startBulkTransition(async () => {
                  let okCount = 0;
                  let failCount = 0;
                  for (let i = 0; i < lines.length; i++) {
                    setBulkProgress({
                      current: i + 1,
                      total: lines.length,
                    });
                    const result = await ingestVideoData(lines[i]!);
                    if (result.ok) {
                      okCount++;
                      setBulkProgress({
                        current: i + 1,
                        total: lines.length,
                        lastTitle: result.title,
                      });
                    } else {
                      failCount++;
                    }
                  }
                  setBulkProgress(null);
                  setBulkUrls("");
                  setToast({
                    kind: failCount > 0 ? "error" : "success",
                    message: `ייבוא מרובה: ${okCount} הצליחו, ${failCount} נכשלו.`,
                  });
                  router.refresh();
                });
              }}
            >
              {bulkPending ? "מייבאים..." : "ייבוא מרובה"}
            </button>
            {bulkProgress ? (
              <p className="text-sm text-zinc-400" aria-live="polite">
                {bulkProgress.current} / {bulkProgress.total}
                {bulkProgress.lastTitle
                  ? `: ${bulkProgress.lastTitle}`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        id="unlisted"
        className="scroll-mt-6 border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-zinc-100">
          סימון סרטונים לא רשומים
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          סנכרון הערוץ הציבורי לא רואה סרטונים לא רשומים. מדביקים מזהי יוטיוב
          מיוטיוב סטודיו (שורה לכל מזהה או מופרדים בפסיק). כל מזהה נשמר
          ומסומן כמועדון + לא רשום.
        </p>
        <form action={unlistedFormAction} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="unlisted-ids"
              className="mb-1.5 block text-sm text-zinc-300"
            >
              מזהי יוטיוב
            </label>
            <textarea
              id="unlisted-ids"
              name="unlistedIds"
              rows={5}
              dir="ltr"
              disabled={isUnlistedPending}
              placeholder={"dQw4w9WgXcQ\nanother11chr"}
              className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-500/70 disabled:opacity-60"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MarkUnlistedSubmitButton />
            {isUnlistedPending ? (
              <p className="text-sm text-zinc-400" aria-live="polite">
                מעדכנים במאגר...
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section
        id="recent"
        className="scroll-mt-6 border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">
            5 סרטונים אחרונים
          </h2>
          <p className="text-xs text-zinc-500">חדש למעלה</p>
        </div>

        {videos.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-400">
            עדיין אין סרטונים. ייבאו אחד למעלה כדי לבדוק שהצינור עובד.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="px-2 py-3 font-medium">תמונה</th>
                  <th className="px-2 py-3 font-medium">כותרת</th>
                  <th className="px-2 py-3 font-medium">מזהה</th>
                  <th className="px-2 py-3 font-medium">נוצר</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => {
                  const thumb =
                    video.thumbnail_url ??
                    `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;
                  return (
                    <tr
                      key={video.id}
                      className="border-b border-zinc-800/80 text-zinc-200"
                    >
                      <td className="px-2 py-3">
                        <div className="relative h-12 w-20 overflow-hidden bg-zinc-800">
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <Link
                          href={getWatchHref(video)}
                          className="font-medium text-zinc-100 underline-offset-2 hover:underline"
                        >
                          {video.title}
                        </Link>
                      </td>
                      <td className="px-2 py-3 font-mono text-xs text-zinc-400" dir="ltr">
                        {video.youtube_id}
                      </td>
                      <td className="px-2 py-3 text-zinc-400">
                        {new Date(video.created_at).toLocaleString("he-IL")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 start-6 z-50 max-w-sm border px-4 py-3 text-sm ${
            toast.kind === "success"
              ? "border-emerald-500/40 bg-emerald-950 text-emerald-100"
              : "border-red-500/40 bg-red-950 text-red-100"
          }`}
        >
          <p className="font-semibold">
            {toast.kind === "success" ? "הצלחה" : "שגיאה"}
          </p>
          <p className="mt-1 leading-relaxed opacity-90">{toast.message}</p>
        </div>
      ) : null}
    </div>
  );
}
