import { NextResponse } from "next/server";

import { logSingleVideoLead } from "@/actions/single-video-leads";

export const runtime = "nodejs";

/**
 * Optional CTA beacon for single-video request logging.
 * Body: { videoId: string, videoTitle: string }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const videoId =
    "videoId" in body && typeof body.videoId === "string" ? body.videoId : "";
  const videoTitle =
    "videoTitle" in body && typeof body.videoTitle === "string"
      ? body.videoTitle
      : "";

  const result = await logSingleVideoLead({ videoId, videoTitle });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
