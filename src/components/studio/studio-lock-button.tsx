"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { lockStudio } from "@/actions/studio-auth";

export function StudioLockButton() {
  const router = useRouter();
  const [locking, startLockTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startLockTransition(async () => {
          await lockStudio();
          router.refresh();
        });
      }}
      disabled={locking}
      className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
    >
      {locking ? "נועלים..." : "נעילת ניהול"}
    </button>
  );
}
