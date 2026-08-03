import { buildLiveCalendarIcs } from "@/lib/live/schedule";

export const dynamic = "force-dynamic";

/**
 * Downloadable .ics for weekly LIVE slots (Israel time).
 * No auth. Public reminder calendar only.
 */
export function GET() {
  const body = buildLiveCalendarIcs();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="nevermind-live.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
