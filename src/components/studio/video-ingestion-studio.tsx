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
import { lockStudio } from "@/actions/studio-auth";
import { StudioNav } from "@/components/studio/studio-nav";
import type { Video } from "@/types/supabase";

type ToastState =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

type VideoIngestionStudioProps = {
  initialVideos: Video[];
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
          Processing Transcript...
        </>
      ) : (
        "Sync Video"
      )}
    </button>
  );
}

function MarkUnlistedSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-950 px-5 text-sm font-semibold text-zinc-100 transition hover:border-red-500/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Marking unlisted..." : "Mark unlisted + gated"}
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
  const [locking, startLockTransition] = useTransition();

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  useEffect(() => {
    if (!result) return;

    if (result.ok) {
      const gateNote =
        result.isUnlisted || result.isGated
          ? " Marked unlisted/gated."
          : "";
      setToast({
        kind: "success",
        message: `Synced "${result.title}" (${result.concepts.length} concepts, transcript ${result.transcriptLength} chars).${gateNote}`,
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
          ? ` Soft errors: ${unlistedResult.errors.length}.`
          : "";
      setToast({
        kind: "success",
        message: `Unlisted upsert: ${unlistedResult.upserted} rows (gated=${unlistedResult.gatedCount}, unlisted=${unlistedResult.unlistedCount}).${soft}`,
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

  function onLock() {
    startLockTransition(async () => {
      await lockStudio();
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <header className="space-y-6">
        <StudioNav
          active="ingestion"
          actions={
            <button
              type="button"
              onClick={onLock}
              disabled={locking}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
            >
              {locking ? "Locking..." : "Lock Studio"}
            </button>
          }
        />
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            NeverMind Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Video Ingestion Studio
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Paste a YouTube URL. We fetch metadata, transcript, and concepts,
            then upsert into Supabase.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">Ingest one video</h2>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="youtube-url"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              YouTube URL
            </label>
            <input
              id="youtube-url"
              name="youtubeUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70 disabled:opacity-60"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SyncSubmitButton />
            {isPending ? (
              <p className="text-sm text-zinc-400" aria-live="polite">
                Fetching metadata and transcript...
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">
          Mark unlisted (club)
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Public channel sync cannot see unlisted videos. Paste real YouTube
          IDs from YouTube Studio (one per line or comma-separated). Each ID
          is upserted and marked unlisted + gated.
        </p>
        <form action={unlistedFormAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="unlisted-ids"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              YouTube IDs
            </label>
            <textarea
              id="unlisted-ids"
              name="unlistedIds"
              rows={5}
              disabled={isUnlistedPending}
              placeholder={"dQw4w9WgXcQ\nanother11chr"}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70 disabled:opacity-60"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MarkUnlistedSubmitButton />
            {isUnlistedPending ? (
              <p className="text-sm text-zinc-400" aria-live="polite">
                Upserting via videos.list...
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Last 5 videos</h2>
          <p className="text-xs text-zinc-500">Newest first</p>
        </div>

        {videos.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">
            No videos yet. Sync one above to confirm the pipeline.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="px-2 py-3 font-medium">Thumb</th>
                  <th className="px-2 py-3 font-medium">Title</th>
                  <th className="px-2 py-3 font-medium">YouTube ID</th>
                  <th className="px-2 py-3 font-medium">Created</th>
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
                        <div className="relative h-12 w-20 overflow-hidden rounded-md bg-zinc-800">
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
                          href={`/watch/${video.youtube_id}`}
                          className="font-medium text-zinc-100 underline-offset-2 hover:underline"
                        >
                          {video.title}
                        </Link>
                      </td>
                      <td className="px-2 py-3 font-mono text-xs text-zinc-400">
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
          className={`fixed bottom-6 start-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.kind === "success"
              ? "border-emerald-500/40 bg-emerald-950 text-emerald-100"
              : "border-red-500/40 bg-red-950 text-red-100"
          }`}
        >
          <p className="font-semibold">
            {toast.kind === "success" ? "Success" : "Error"}
          </p>
          <p className="mt-1 leading-relaxed opacity-90">{toast.message}</p>
        </div>
      ) : null}
    </div>
  );
}
