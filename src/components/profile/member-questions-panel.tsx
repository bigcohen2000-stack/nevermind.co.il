"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitMethodQuestion } from "@/actions/viewer-feedback";
import type { ViewerFeedback } from "@/types/supabase";

const STATUS_LABEL: Record<string, string> = {
  open: "ממתין לתשובה",
  replied: "נענה",
  closed: "סגור",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type MemberQuestionsPanelProps = {
  items: ViewerFeedback[];
};

export function MemberQuestionsPanel({ items }: MemberQuestionsPanelProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <form
        className="border border-[#FAFAF8]/10 bg-[#0A0A0B] p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setOkMsg(null);
          startTransition(async () => {
            const result = await submitMethodQuestion({ body });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setBody("");
            setOkMsg("השאלה נשלחה. תשובה תופיע כאן ובמייל כשתהיה מוכנה.");
            router.refresh();
          });
        }}
      >
        <label htmlFor="method-q" className="block text-sm font-medium">
          שאלה על יישום השיטה
        </label>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          שאלה אחת, ממוקדת. בלי רעש של רשתות. תשובה אובייקטיבית כשמוכנה.
        </p>
        <textarea
          id="method-q"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          required
          maxLength={4000}
          className="mt-3 w-full border border-[#FAFAF8]/20 bg-transparent p-3 text-sm text-[#FAFAF8]"
          placeholder="מה קרה בפועל, ומה אתם מנסים לפרק."
        />
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        {okMsg ? <p className="mt-2 text-sm text-[#9CA3AF]">{okMsg}</p> : null}
        <button
          type="submit"
          disabled={pending || body.trim().length < 2}
          className="mt-4 bg-action px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          שליחת שאלה
        </button>
      </form>

      <section aria-labelledby="member-q-list-title">
        <h2
          id="member-q-list-title"
          className="text-lg font-semibold tracking-tight"
        >
          השאלות שלי
        </h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-[#9CA3AF]">עדיין אין שאלות.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((row) => (
              <li
                key={row.id}
                className="border border-[#FAFAF8]/10 bg-[#0A0A0B] p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#9CA3AF]">
                    {formatWhen(row.created_at)}
                  </span>
                  <span className="text-xs text-[#FAFAF8]/80">
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[#FAFAF8]">
                  {row.body}
                </p>
                {row.reply_body ? (
                  <div className="mt-3 border-t border-[#FAFAF8]/10 pt-3">
                    <p className="text-xs tracking-wide text-action uppercase">
                      תשובה
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[#FAFAF8]/90">
                      {row.reply_body}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
