import { NextResponse } from "next/server";

import {
  getNewsletterDashboard,
  newsletterRowsToCsv,
} from "@/lib/studio/newsletter-subscribers";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getNewsletterDashboard();
  if (data.loadError) {
    return NextResponse.json({ error: data.loadError }, { status: 500 });
  }

  const csv = newsletterRowsToCsv(data.rows);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
