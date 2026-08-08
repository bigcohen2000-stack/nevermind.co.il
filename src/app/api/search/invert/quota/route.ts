import { NextResponse } from "next/server";

import {
  TOOL_SUBJECT_COOKIE,
  getInvertQuotaStatus,
  resolveToolSubject,
} from "@/lib/premium/tool-quota";

/** Non-consuming quota peek for UI teasers. */
export async function GET() {
  const subject = await resolveToolSubject();
  const status = await getInvertQuotaStatus(subject);
  const response = NextResponse.json({
    unlimited: status.unlimited,
    used: status.used,
    limit: status.limit,
    remaining: status.remaining,
  });
  if (subject.setCookie) {
    response.cookies.set(TOOL_SUBJECT_COOKIE, subject.setCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return response;
}
