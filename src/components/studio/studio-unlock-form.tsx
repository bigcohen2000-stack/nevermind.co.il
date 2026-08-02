"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { unlockStudio } from "@/actions/studio-auth";

export function StudioUnlockForm() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await unlockStudio(secret);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40">
      <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
        Admin
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
        Studio Unlock
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Enter the admin secret (`CRON_SECRET`) to open Video Ingestion Studio.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="studio-secret" className="sr-only">
            Admin secret
          </label>
          <input
            id="studio-secret"
            name="secret"
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Unlocking..." : "Unlock Studio"}
        </button>
      </form>
    </div>
  );
}
