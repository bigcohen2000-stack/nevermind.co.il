"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  toggleTopicPref,
  type TopicPrefOption,
} from "@/actions/topic-prefs";
import { cn } from "@/lib/utils";

type TopicPrefsSettingsProps = {
  options: TopicPrefOption[];
};

/**
 * Profile: pick concepts for interest-based alerts.
 */
export function TopicPrefsSettings({ options: initial }: TopicPrefsSettingsProps) {
  const router = useRouter();
  const [options, setOptions] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (options.length === 0) {
    return (
      <p className="mt-4 text-sm text-[#9CA3AF]">
        אין מושגים זמינים כרגע. אחרי סנכרון ספרייה אפשר לבחור כאן נושאים.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-[#9CA3AF]">
        מסמנים מושגים. כשיוצא סרטון חדש עם התגית הזו, נשלחת התראה רלוונטית.
      </p>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <ul className="mt-4 flex flex-wrap gap-2">
        {options.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              disabled={pending}
              aria-pressed={opt.selected}
              onClick={() => {
                setError(null);
                const previous = opt.selected;
                setOptions((list) =>
                  list.map((row) =>
                    row.id === opt.id
                      ? { ...row, selected: !previous }
                      : row,
                  ),
                );
                startTransition(async () => {
                  const result = await toggleTopicPref(opt.id);
                  if (!result.ok) {
                    setOptions((list) =>
                      list.map((row) =>
                        row.id === opt.id
                          ? { ...row, selected: previous }
                          : row,
                      ),
                    );
                    setError(result.error);
                    return;
                  }
                  setOptions((list) =>
                    list.map((row) =>
                      row.id === opt.id
                        ? { ...row, selected: result.selected }
                        : row,
                    ),
                  );
                  router.refresh();
                });
              }}
              className={cn(
                "border px-3 py-1.5 text-xs transition disabled:opacity-60",
                opt.selected
                  ? "border-action bg-action/15 text-action"
                  : "border-[#FAFAF8]/20 text-[#FAFAF8]/85 hover:border-[#FAFAF8]/40",
              )}
            >
              {opt.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
