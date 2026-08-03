"use client";

import { useState } from "react";

import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import {
  PASSWORD_OPS_TIPS,
  PUBLISH_OPS_TIPS,
  QUICK_ANNOUNCE_TEMPLATES,
  UPDATE_OPS_TIPS,
  type StudioOpsTip,
} from "@/lib/studio/ops-tips";

function TipList({ tips }: { tips: StudioOpsTip[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {tips.map((tip) => (
        <li key={tip.id} className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">{tip.title}. </span>
          {tip.body}
        </li>
      ))}
    </ul>
  );
}

type StudioOpsTipsPanelProps = {
  /** Show only password tips (embed under password panel). */
  mode?: "full" | "password";
};

/**
 * Ops hints + copy-ready announce templates. Low effort, no new services.
 */
export function StudioOpsTipsPanel({ mode = "full" }: StudioOpsTipsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (mode === "password") {
    return (
      <aside className="border border-amber-900/30 bg-zinc-950/50 p-4">
        <h3 className="text-sm font-medium text-amber-200/90">
          הארות לסיסמה
        </h3>
        <TipList tips={PASSWORD_OPS_TIPS} />
      </aside>
    );
  }

  return (
    <section
      className="scroll-mt-6 space-y-6 border border-zinc-700 bg-zinc-900/40 p-5 sm:p-6"
      dir="rtl"
    >
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          עזרה לניהול
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          הארות קצרות לסיסמאות, פרסומים ועדכונים. בלי חיבורים חדשים.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">סיסמאות</h3>
          <TipList tips={PASSWORD_OPS_TIPS} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">פרסומים</h3>
          <TipList tips={PUBLISH_OPS_TIPS} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">עדכונים</h3>
          <TipList tips={UPDATE_OPS_TIPS} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">
          תבניות עדכון להעתקה
        </h3>
        <ul className="mt-3 space-y-3">
          {QUICK_ANNOUNCE_TEMPLATES.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-zinc-800 bg-zinc-950/60 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300">{item.label}</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-zinc-500">
                  {item.text}
                </pre>
              </div>
              <StudioCopyButton
                text={item.text}
                label={copiedId === item.id ? "הועתק" : "העתק"}
                onCopied={() => setCopiedId(item.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
