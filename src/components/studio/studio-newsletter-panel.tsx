import Link from "next/link";

import type { NewsletterDashboardData } from "@/lib/studio/newsletter-subscribers";

type StudioNewsletterPanelProps = {
  data: NewsletterDashboardData;
};

export function StudioNewsletterPanel({ data }: StudioNewsletterPanelProps) {
  if (data.loadError) {
    return (
      <div className="border border-amber-700/50 bg-amber-950/30 p-4 text-sm text-amber-200">
        {data.loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          עדיין אין שליחה אוטומטית. הרשימה מוכנה לייצוא ולביטול הרשמה.
        </p>
        <a
          href="/api/studio/newsletter/export"
          className="inline-flex min-h-10 items-center border border-zinc-600 px-4 text-xs font-medium text-zinc-100 hover:border-zinc-400"
        >
          ייצוא CSV
        </a>
      </div>

      {data.rows.length === 0 ? (
        <p className="text-sm text-zinc-500">אין מנויים עדיין.</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-800">
          <table className="min-w-full text-start text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
              <tr>
                <th className="px-3 py-2 font-medium">אימייל</th>
                <th className="px-3 py-2 font-medium">סטטוס</th>
                <th className="px-3 py-2 font-medium">מקור</th>
                <th className="px-3 py-2 font-medium">נרשם</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800/80 text-zinc-200"
                >
                  <td className="px-3 py-2 font-mono text-xs">{row.email}</td>
                  <td className="px-3 py-2">
                    {row.status === "active" ? "פעיל" : "בוטל"}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">{row.source}</td>
                  <td className="px-3 py-2 text-zinc-500">
                    {new Date(row.created_at).toLocaleString("he-IL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        מדיניות:{" "}
        <Link href="/privacy" className="text-zinc-300 underline-offset-2 hover:underline">
          מדיניות פרטיות
        </Link>
        . ביטול הרשמה דרך קישור אישי במייל אישור.
      </p>
    </div>
  );
}
