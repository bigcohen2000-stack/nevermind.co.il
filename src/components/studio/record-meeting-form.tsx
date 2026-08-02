"use client";

import { useState, useTransition, type FormEvent } from "react";

import { recordUserMeeting } from "@/actions/studio-user-meeting";

type RecordMeetingFormProps = {
  userId: string;
};

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Minimal Studio control: log a held meeting for profile progress.
 */
export function RecordMeetingForm({ userId }: RecordMeetingFormProps) {
  const [heldAt, setHeldAt] = useState(() => toLocalInputValue(new Date()));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await recordUserMeeting({ userId, heldAt });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("נרשם");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-1">
      <input
        type="datetime-local"
        value={heldAt}
        onChange={(e) => setHeldAt(e.target.value)}
        disabled={pending}
        className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-[10px] text-zinc-200"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-600 px-2 py-1 text-[10px] text-zinc-300 transition hover:border-zinc-400 hover:text-zinc-100 disabled:opacity-50"
      >
        {pending ? "..." : "רשום פגישה"}
      </button>
      {message ? (
        <p className="text-[10px] text-emerald-400">{message}</p>
      ) : null}
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </form>
  );
}
