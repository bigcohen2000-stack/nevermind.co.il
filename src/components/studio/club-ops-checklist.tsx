"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nm_studio_club_ops_checklist";

const STEPS = [
  {
    id: "grant",
    title: "פתיחת גישה + תוקף",
    body: "מוסיפים טלפון לרשימה המורשית, שם לתצוגה, ותאריך סיום אם יש.",
  },
  {
    id: "mint",
    title: "יצירת קישור או סיסמה",
    body: "מנפיקים קישור אישי, או מוודאים שהסיסמה המשותפת פעילה.",
  },
  {
    id: "whatsapp",
    title: "תבנית וואטסאפ",
    body: "מעתיקים תבנית גישה / תזכורת ומדביקים בוואטסאפ ללקוח.",
  },
  {
    id: "sent",
    title: "סימון נשלח",
    body: "מסמנים כאן אחרי שההודעה יצאה. זה מקומי במכשיר הניהול בלבד.",
  },
] as const;

type ChecklistState = Record<string, boolean>;

function loadState(): ChecklistState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ChecklistState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Local ops checklist for club grant flow. Not synced to DB.
 */
export function ClubOpsChecklist() {
  const [state, setState] = useState<ChecklistState>({});

  useEffect(() => {
    setState(loadState());
  }, []);

  function toggle(id: string) {
    setState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function reset() {
    setState({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const doneCount = STEPS.filter((s) => state[s.id]).length;

  return (
    <section
      className="border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6"
      aria-labelledby="club-ops-checklist-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="club-ops-checklist-title"
            className="text-base font-semibold text-zinc-100"
          >
            רשימת פעולות למועדון
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            ארבעה שלבים קבועים. {doneCount}/{STEPS.length} סומנו במכשיר הזה.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-400"
        >
          איפוס
        </button>
      </div>

      <ol className="mt-6 space-y-3">
        {STEPS.map((step, index) => {
          const checked = Boolean(state[step.id]);
          return (
            <li key={step.id}>
              <label className="flex cursor-pointer items-start gap-3 border border-zinc-700 bg-zinc-950/40 p-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(step.id)}
                  className="mt-1 size-4 shrink-0 accent-red-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-zinc-100">
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                    {step.body}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
