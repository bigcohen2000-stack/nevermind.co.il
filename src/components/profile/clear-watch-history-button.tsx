"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { clearWatchHistory } from "@/actions/watch-history";

export function ClearWatchHistoryButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onClear() {
    setError("");
    startTransition(async () => {
      const result = await clearWatchHistory();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onClear}
        disabled={pending}
        className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "מנקה..." : "נקה היסטוריית צפייה"}
      </button>
      {error ? (
        <p className="text-sm text-[#D42B2B]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
