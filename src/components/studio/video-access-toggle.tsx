"use client";

import { useState, useTransition } from "react";

import { setStudioVideoAccess } from "@/actions/studio-video-access";

type VideoAccessToggleProps = {
  userId: string;
  enabled: boolean;
};

export function VideoAccessToggle({
  userId,
  enabled: initialEnabled,
}: VideoAccessToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !enabled;
    setError("");
    startTransition(async () => {
      const result = await setStudioVideoAccess(userId, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEnabled(result.enabled);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
          enabled
            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            : "border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100"
        }`}
      >
        {pending ? "..." : enabled ? "Access ON" : "Grant access"}
      </button>
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}
