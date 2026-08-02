"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setStudioVideoTeaser } from "@/actions/studio-video-teaser";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import type { Video } from "@/types/supabase";

type StudioTeaserPanelProps = {
  videos: Video[];
};

/**
 * Assign dedicated short public teaser clips to gated videos.
 */
export function StudioTeaserPanel({ videos }: StudioTeaserPanelProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const gated = videos.filter((v) => isMembersOnlyVideo(v));

  if (gated.length === 0) {
    return (
      <section
        className="scroll-mt-6 border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6"
        dir="rtl"
      >
        <h2 className="text-base font-semibold text-zinc-100">
          קליפי טעימה
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          עדיין אין סרטוני מועדון ברשימה. קודם מייבאים או מסמנים לא רשום,
          ואז מחברים כאן קליפ קצר נפרד.
        </p>
      </section>
    );
  }

  return (
    <section
      className="scroll-mt-6 border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6"
      dir="rtl"
    >
      <h2 className="text-base font-semibold text-zinc-100">קליפי טעימה</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
        מעלים ליוטיוב קליפ קצר ציבורי (בערך 2 דקות). מדביקים כאן קישור או
        מזהה. אורחים מקבלים רק את הקליפ הזה. המזהה של הסרטון המלא לא מגיע
        לדפדפן בלי גישת מועדון.
      </p>

      <ul className="mt-5 space-y-5">
        {gated.map((video) => (
          <li
            key={video.id}
            className="border-b border-zinc-800 pb-5 last:border-0 last:pb-0"
          >
            <p className="text-sm font-medium text-zinc-100">{video.title}</p>
            <p className="mt-1 font-mono text-xs text-zinc-500" dir="ltr">
              מלא: {video.youtube_id}
              {video.teaser_youtube_id
                ? ` · טעימה: ${video.teaser_youtube_id}`
                : " · טעימה: (אין, שער בלבד)"}
            </p>
            <form
              className="mt-3 flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const input = new FormData(form).get("teaser");
                const value = typeof input === "string" ? input : "";
                setMessage(null);
                setError(null);
                setPendingId(video.id);
                startTransition(async () => {
                  const result = await setStudioVideoTeaser(video.id, value);
                  setPendingId(null);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setMessage(
                    result.teaserYoutubeId
                      ? `נשמרה טעימה: ${result.teaserYoutubeId}`
                      : "הטעימה נמחקה. נשאר שער בלבד.",
                  );
                  form.reset();
                  router.refresh();
                });
              }}
            >
              <label className="min-w-[14rem] flex-1 text-xs text-zinc-400">
                קישור או מזהה של הטעימה
                <input
                  name="teaser"
                  defaultValue={video.teaser_youtube_id ?? ""}
                  dir="ltr"
                  placeholder="https://youtu.be/... או מזהה בן 11 תווים"
                  className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-red-500/70"
                />
              </label>
              <button
                type="submit"
                disabled={isPending && pendingId === video.id}
                className="inline-flex min-h-10 items-center justify-center bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {isPending && pendingId === video.id ? "שומרים..." : "שמירה"}
              </button>
              {video.teaser_youtube_id ? (
                <button
                  type="button"
                  disabled={isPending && pendingId === video.id}
                  onClick={() => {
                    setMessage(null);
                    setError(null);
                    setPendingId(video.id);
                    startTransition(async () => {
                      const result = await setStudioVideoTeaser(video.id, "");
                      setPendingId(null);
                      if (!result.ok) {
                        setError(result.error);
                        return;
                      }
                      setMessage("הטעימה נמחקה. נשאר שער בלבד.");
                      router.refresh();
                    });
                  }}
                  className="inline-flex min-h-10 items-center justify-center border border-zinc-600 px-4 text-sm font-semibold text-zinc-200 transition hover:border-red-500/60 disabled:opacity-60"
                >
                  מחק טעימה
                </button>
              ) : null}
            </form>
          </li>
        ))}
      </ul>

      {message ? (
        <p className="mt-4 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
