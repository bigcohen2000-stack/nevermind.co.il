import type { PreMeetingLeadsDashboardData } from "@/lib/studio/pre-meeting-leads";
import type { PreMeetingLead } from "@/types/supabase";

type PreMeetingLeadsDashboardProps = {
  data: PreMeetingLeadsDashboardData;
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
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">{lead.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lead.phone}
            {lead.email ? `, ${lead.email}` : ""}
          </p>
        </div>
        <div className="text-end">
          <p className="text-xs text-zinc-500">{formatDateTime(lead.created_at)}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">{lead.source}</p>
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
    </article>
  );
}

export function PreMeetingLeadsDashboard({
  data,
}: PreMeetingLeadsDashboardProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Pre-meeting leads
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Thought Deconstructor submissions: facts, story, and contact details
          before a deep-dive call.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <h3 className="text-sm font-medium tracking-wide text-zinc-400">
            Today
          </h3>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalToday}
          </p>
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <h3 className="text-sm font-medium tracking-wide text-zinc-400">
            Last 7 days
          </h3>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
            {data.totalThisWeek}
          </p>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Recent leads</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {data.rows.length} lead{data.rows.length === 1 ? "" : "s"} (newest
              first)
            </p>
          </div>
        </div>

        {data.rows.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No pre-meeting leads yet. Submissions from /booking will appear here.
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
