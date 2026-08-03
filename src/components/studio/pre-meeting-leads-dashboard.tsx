"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updatePreMeetingLeadStatus } from "@/actions/studio-lead-status";
import { LeadMeetingInviteTools } from "@/components/studio/lead-meeting-invite-tools";
import { StudioCsvExportButton } from "@/components/studio/studio-csv-export-button";
import {
  buildLeadTelHref,
  buildLeadWhatsAppHref,
} from "@/lib/studio/lead-contact";
import type { PreMeetingLeadsDashboardData } from "@/lib/studio/pre-meeting-leads";
import type { PreMeetingLead } from "@/types/supabase";

type PreMeetingLeadsDashboardProps = {
  data: PreMeetingLeadsDashboardData;
};

const STATUS_OPTIONS = ["new", "contacted", "closed"] as const;
const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  closed: "סגור",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function preview(text: string, max = 120): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}...`;
}

function LeadCard({ lead }: { lead: PreMeetingLead }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const status = (lead.status ?? "new") as (typeof STATUS_OPTIONS)[number];

  return (
    <article className="border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">{lead.name}</h3>
          <p className="mt-1 text-sm text-zinc-400" dir="ltr">
            {lead.phone}
            {lead.email ? ` · ${lead.email}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={buildLeadTelHref(lead.phone)}
              className="inline-flex min-h-10 items-center gap-1.5 border border-zinc-700 px-3 text-xs text-zinc-200 hover:border-zinc-500"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              חיוג
            </a>
            <a
              href={buildLeadWhatsAppHref(
                lead.phone,
                `היי ${lead.name}, כאן יקיר מ-NeverMinde. קיבלתי את הפנייה מהאתר.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 border border-zinc-700 px-3 text-xs text-zinc-200 hover:border-zinc-500"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              וואטסאפ
            </a>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs text-zinc-500">
            {formatDateTime(lead.created_at)}
          </p>
          <label className="mt-2 block text-xs text-zinc-500">
            סטטוס
            <select
              className="mt-1 block min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
              value={STATUS_OPTIONS.includes(status) ? status : "new"}
              disabled={pending}
              onChange={(e) => {
                const next = e.target.value;
                startTransition(async () => {
                  await updatePreMeetingLeadStatus({
                    id: lead.id,
                    status: next,
                  });
                  router.refresh();
                });
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">
            {lead.source}
          </p>
        </div>
      </header>

      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-medium tracking-wide text-zinc-500">
            המצב והמחשבה
          </dt>
          <dd className="mt-1 leading-relaxed text-zinc-200">
            {preview(lead.situation_text, 280)}
          </dd>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-red-400/80">
              עובדות
            </dt>
            <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-zinc-300">
              {preview(lead.objective_facts, 200)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500">
              הסיפור
            </dt>
            <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-zinc-300">
              {preview(lead.subjective_story, 200)}
            </dd>
          </div>
        </div>
      </dl>
      <LeadMeetingInviteTools
        name={lead.name}
        phone={lead.phone}
        email={lead.email}
        contextHint={lead.situation_text}
      />
    </article>
  );
}

export function PreMeetingLeadsDashboard({
  data,
}: PreMeetingLeadsDashboardProps) {
  return (
    <div className="space-y-8">
      {data.loadError ? (
        <p
          role="alert"
          className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          לא נטען: {data.loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-medium tracking-wide text-zinc-400">
            היום
          </h3>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalToday}
          </p>
        </section>
        <section className="border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-medium tracking-wide text-zinc-400">
            7 ימים
          </h3>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalThisWeek}
          </p>
        </section>
        <section className="border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-medium tracking-wide text-zinc-400">
            פתוחים
          </h3>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.openCount}
          </p>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              לידים אחרונים
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {data.rows.length} לידים (חדש למעלה)
            </p>
          </div>
          <StudioCsvExportButton
            filename={`pre-meeting-leads-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={[
              "name",
              "phone",
              "email",
              "status",
              "source",
              "created_at",
              "situation",
            ]}
            rows={data.rows.map((row) => [
              row.name,
              row.phone,
              row.email,
              row.status ?? "new",
              row.source,
              row.created_at,
              row.situation_text,
            ])}
          />
        </div>

        {data.rows.length === 0 ? (
          <p className="text-sm text-zinc-400">
            עדיין אין לידים. שליחות ממפרק המחשבות יופיעו כאן.
          </p>
        ) : (
          <ul className="space-y-4">
            {data.rows.map((lead) => (
              <li key={lead.id}>
                <LeadCard lead={lead} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
