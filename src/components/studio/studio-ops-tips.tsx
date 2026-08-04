"use client";

import { useState } from "react";

import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import {
  PASSWORD_OPS_TIPS,
  PUBLISH_OPS_TIPS,
  QUICK_ANNOUNCE_TEMPLATES,
  UPDATE_OPS_TIPS,
  getAnnounceTemplate,
  type StudioOpsTip,
} from "@/lib/studio/ops-tips";

function TipList({ tips }: { tips: StudioOpsTip[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {tips.map((tip) => (
        <li key={tip.id} className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">• {tip.title}: </span>
          {tip.body}
        </li>
      ))}
    </ul>
  );
}

function AnnounceTemplatesBlock({
  ids,
  heading = "תבניות עדכון להעתקה",
}: {
  ids?: string[];
  heading?: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const items = ids
    ? QUICK_ANNOUNCE_TEMPLATES.filter((t) => ids.includes(t.id))
    : QUICK_ANNOUNCE_TEMPLATES;

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-200">{heading}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
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
  );
}

type StudioOpsTipsPanelProps = {
  /** Show only password tips (embed under password panel). */
  mode?: "full" | "password" | "library";
};

/**
 * Ops hints + copy-ready announce templates. Low effort, no new services.
 */
export function StudioOpsTipsPanel({ mode = "full" }: StudioOpsTipsPanelProps) {
  if (mode === "password") {
    const rotateText = getAnnounceTemplate("password-rotated") ?? "";
    return (
      <aside className="space-y-4 border border-amber-900/30 bg-zinc-950/50 p-4">
        <div>
          <h3 className="text-sm font-medium text-amber-200/90">
            1. ניהול סיסמאות וגישות
          </h3>
          <TipList tips={PASSWORD_OPS_TIPS} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3">
          <StudioCopyButton
            text={rotateText}
            label="העתק הודעת החלפת סיסמה"
          />
        </div>
      </aside>
    );
  }

  if (mode === "library") {
    return (
      <aside className="border border-zinc-700 bg-zinc-950/40 p-4">
        <AnnounceTemplatesBlock
          ids={["new-video", "new-article"]}
          heading="תבניות עדכון (WhatsApp)"
        />
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
          דגשי ניהול ותפעול - NeverMinde
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          הנחיות עבודה קצרות לניהול סיסמאות, פרסומים ועדכונים (ללא חיבורים
          חדשים):
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            1. ניהול סיסמאות וגישות
          </h3>
          <TipList tips={PASSWORD_OPS_TIPS} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            2. פרסום תוכן
          </h3>
          <TipList tips={PUBLISH_OPS_TIPS} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            3. תפעול ועדכונים
          </h3>
          <TipList tips={UPDATE_OPS_TIPS} />
        </div>
      </div>

      <AnnounceTemplatesBlock heading="תבניות עדכון להעתקה (WhatsApp)" />
    </section>
  );
}
