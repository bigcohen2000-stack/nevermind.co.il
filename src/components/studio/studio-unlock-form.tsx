"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { unlockStudio } from "@/actions/studio-auth";

type StudioUnlockFormProps = {
  /** Bookmark path, e.g. /nm-ops */
  gatePath?: string;
};

export function StudioUnlockForm({ gatePath = "/nm-ops" }: StudioUnlockFormProps) {
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
      router.replace("/studio");
      router.refresh();
    });
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8" dir="rtl">
      <p className="text-xs text-zinc-500">כניסה פנימית</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
        כניסת ניהול
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        הזינו את סוד הניהול. הנתיב הזה לסימנייה בלבד ({gatePath}). אחרי
        הפתיחה הסטודיו פתוח ל־8 שעות במכשיר הזה.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="studio-secret" className="sr-only">
            סוד ניהול
          </label>
          <input
            id="studio-secret"
            name="secret"
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="סוד ניהול"
            className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-500/70"
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
          className="inline-flex w-full items-center justify-center bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "פותחים..." : "פתיחה"}
        </button>
      </form>
    </div>
  );
}
