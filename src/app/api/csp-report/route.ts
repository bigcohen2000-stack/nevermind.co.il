import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Reports larger than this are truncated before logging. */
const MAX_REPORT_CHARS = 4096;

/**
 * Sink for Content-Security-Policy violation reports (report-uri).
 * Logs a compact single line so violations are visible in Vercel logs
 * while the policy runs in Report-Only mode.
 * POST /api/csp-report
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body = "";
  try {
    body = (await req.text()).slice(0, MAX_REPORT_CHARS);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (body.trim()) {
    console.warn(
      JSON.stringify({
        scope: "csp.report",
        ts: new Date().toISOString(),
        report: body,
      }),
    );
  }

  return new NextResponse(null, { status: 204 });
}
