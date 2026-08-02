"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setProfileAccessExpiry } from "@/actions/studio-video-access";

type ProfileAccessExpiryEditorProps = {
  userId: string;
  accessExpiresAt: string | null;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function ProfileAccessExpiryEditor({
  userId,
  accessExpiresAt,
}: ProfileAccessExpiryEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(toDateInputValue(accessExpiresAt));
  const [pending, startTransition] = useTransition();

  const expired =
    accessExpiresAt && new Date(accessExpiresAt).getTime() < Date.now();

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
          dir="ltr"
          className={`rounded border bg-zinc-950 px-2 py-1 text-xs ${
            expired
              ? "border-red-500/60 text-red-200"
              : "border-zinc-600 text-zinc-100"
          }`}
        />
        <button
          type="button"
          disabled={pending}
          className="rounded border border-zinc-600 px-2 py-1 text-[10px] text-zinc-300"
          onClick={() => {
            startTransition(async () => {
              const result = await setProfileAccessExpiry(
                userId,
                value.trim() ? value.trim() : null,
              );
              if (result.ok) router.refresh();
            });
          }}
        >
          {pending ? "..." : "שמור"}
        </button>
      </div>
      {accessExpiresAt ? (
        <p className={`text-[10px] ${expired ? "text-red-400" : "text-zinc-500"}`}>
          {expired ? "פג תוקף" : "פעיל"}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-600">ללא תפוגה</p>
      )}
    </div>
  );
}
