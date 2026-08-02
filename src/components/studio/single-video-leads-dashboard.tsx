"use client";

import { useMemo, useState, useTransition } from "react";

import {
  fulfillSingleVideoLead,
  updateSingleVideoLeadStatus,
} from "@/actions/single-video-leads";
import type { SingleVideoLeadsDashboardData } from "@/lib/studio/single-video-leads";
import type { SingleVideoLead } from "@/types/supabase";

type SingleVideoLeadsDashboardProps = {
  data: SingleVideoLeadsDashboardData;
};

const STATUS_OPTIONS = [
  "requested",
  "chatting",
  "paid",
  "sent",
  "closed",
] as const;

type StatusFilter = "all" | "open" | "paid" | "sent" | "closed";

const FILTER_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "open", label: "פתוח" },
  { id: "paid", label: "שולם" },
  { id: "sent", label: "נשלח" },
  { id: "closed", label: "סגור" },
];

const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
  requested: "פתוח",
  chatting: "בשיחה",
  paid: "שולם",
  sent: "נשלח",
  closed: "סגור",
};

function matchesFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "open") {
    return status === "requested" || status === "chatting";
  }
  if (filter === "paid") return status === "paid";
  if (filter === "sent") return status === "sent";
  if (filter === "closed") return status === "closed";
  return true;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function LeadRow({
  lead,
  onRefreshHint,
}: {
  lead: SingleVideoLead;
  onRefreshHint: (msg: string) => void;
}) {
  const [phone, setPhone] = useState(lead.phone ?? "");
  const [days, setDays] = useState(30);
  const [whatsappText, setWhatsappText] = useState<string | null>(
    lead.watch_url
      ? `צפייה: ${lead.watch_url}`
      : null,
  );
  const [pending, startTransition] = useTransition();

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-50">
            {lead.video_title}
          </h3>
          <p className="mt-1 font-mono text-[11px] text-zinc-500" dir="ltr">
            {lead.video_id ?? "no video id"}
          </p>
          {lead.phone ? (
            <p className="mt-1 text-sm text-zinc-400" dir="ltr">
              {lead.phone}
            </p>
          ) : null}
        </div>
        <div className="text-end">
          <p className="text-xs text-zinc-500">
            {formatDateTime(lead.created_at)}
          </p>
          <p className="mt-1 text-xs font-medium text-red-400/90">
            {STATUS_LABEL[lead.status as (typeof STATUS_OPTIONS)[number]] ??
              lead.status}
          </p>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">
            {lead.source}
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label
            className="block text-[10px] text-zinc-500"
            htmlFor={`status-${lead.id}`}
          >
            סטטוס
          </label>
          <select
            id={`status-${lead.id}`}
            defaultValue={lead.status}
            disabled={pending}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100"
            onChange={(e) => {
              const status = e.target.value as (typeof STATUS_OPTIONS)[number];
              startTransition(async () => {
                const result = await updateSingleVideoLeadStatus(
                  lead.id,
                  status,
                );
                onRefreshHint(
                  result.ok
                    ? result.message ?? "עודכן."
                    : result.error,
                );
              });
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        className="mt-5 flex flex-wrap items-end gap-3 border-t border-zinc-800 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await fulfillSingleVideoLead({
              leadId: lead.id,
              phone,
              daysValid: days,
            });
            if (!result.ok) {
              onRefreshHint(result.error);
              return;
            }
            setWhatsappText(result.whatsappText ?? null);
            onRefreshHint(result.message ?? "נוצר קישור.");
          });
        }}
      >
        <div>
          <label
            className="block text-[10px] text-zinc-500"
            htmlFor={`phone-${lead.id}`}
          >
            טלפון (fulfill)
          </label>
          <input
            id={`phone-${lead.id}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
            required
          />
        </div>
        <div>
          <label
            className="block text-[10px] text-zinc-500"
            htmlFor={`days-${lead.id}`}
          >
            ימים
          </label>
          <input
            id={`days-${lead.id}`}
            type="number"
            min={1}
            max={730}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 30)}
            className="mt-1 w-20 rounded-md border border-zinc-600 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950"
        >
          סמן שולם + קישור
        </button>
      </form>

      {whatsappText ? (
        <div className="mt-3 space-y-2 rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs">
          <p className="whitespace-pre-wrap text-zinc-300">{whatsappText}</p>
          <button
            type="button"
            className="rounded-md border border-zinc-500 px-2 py-1 text-zinc-100"
            onClick={() => {
              void navigator.clipboard.writeText(whatsappText);
              onRefreshHint("הועתק ללוח.");
            }}
          >
            העתק טקסט לוואטסאפ
          </button>
        </div>
      ) : null}

      {lead.watch_url ? (
        <p className="mt-2 font-mono text-[11px] text-zinc-500" dir="ltr">
          watch: {lead.watch_url}
        </p>
      ) : null}
    </article>
  );
}

export function SingleVideoLeadsDashboard({
  data,
}: SingleVideoLeadsDashboardProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredRows = useMemo(
    () => data.rows.filter((row) => matchesFilter(row.status, statusFilter)),
    [data.rows, statusFilter],
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          לידים לסרטון בודד
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          בקשות צפייה בודדת מה־CTA. רישום לחיצה, עדכון סטטוס, הנפקת קישור.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="סינון לפי סטטוס"
      >
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setStatusFilter(chip.id)}
            className={`border px-3 py-1.5 text-xs transition ${
              statusFilter === chip.id
                ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-500">היום</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {data.totalToday}
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-500">7 ימים</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {data.totalThisWeek}
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-500">פתוחים</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {data.openCount}
          </p>
        </div>
      </div>

      {hint ? (
        <p className="text-sm text-zinc-300" role="status">
          {hint}
        </p>
      ) : null}

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">
          {data.rows.length === 0
            ? "עדיין אין לידים. לחיצות על בקשת סרטון יופיעו כאן."
            : "אין לידים בסינון הזה."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredRows.map((lead) => (
            <li key={lead.id}>
              <LeadRow lead={lead} onRefreshHint={setHint} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
