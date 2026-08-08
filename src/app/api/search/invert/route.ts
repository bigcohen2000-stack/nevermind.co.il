import { NextResponse } from "next/server";

import { searchInvertedCaptions } from "@/lib/search/invert-caption-search";
import { invertSearchQuery } from "@/lib/search/invert-query";
import type { InvertSearchResponse } from "@/lib/search/types";
import {
  TOOL_SUBJECT_COOKIE,
  consumeInvertQuota,
  resolveToolSubject,
} from "@/lib/premium/tool-quota";

const EMPTY: InvertSearchResponse = {
  premise: null,
  opposite: null,
  tease: null,
  source: null,
  hits: [],
};

function withSubjectCookie(
  response: NextResponse,
  setCookie: string | null,
): NextResponse {
  if (setCookie) {
    response.cookies.set(TOOL_SUBJECT_COOKIE, setCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return response;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit") ?? "1");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 1;

  const subject = await resolveToolSubject();

  if (q.length < 2) {
    return withSubjectCookie(NextResponse.json(EMPTY), subject.setCookie);
  }

  try {
    const quota = await consumeInvertQuota(subject);
    if (!quota.ok) {
      return withSubjectCookie(
        NextResponse.json(
          {
            ...EMPTY,
            error: "quota_exceeded",
            quota: {
              used: quota.status.used,
              limit: quota.status.limit,
              remaining: 0,
            },
          },
          { status: 429 },
        ),
        subject.setCookie,
      );
    }

    const inverted = await invertSearchQuery(q);
    if (!inverted) {
      return withSubjectCookie(
        NextResponse.json({
          ...EMPTY,
          quota: {
            used: quota.status.used,
            limit: quota.status.limit,
            remaining: quota.status.remaining,
            unlimited: quota.status.unlimited,
          },
        }),
        subject.setCookie,
      );
    }

    const hits = await searchInvertedCaptions(inverted.opposite, limit);

    const body: InvertSearchResponse = {
      premise: inverted.premise,
      opposite: inverted.opposite,
      tease: inverted.tease,
      source: inverted.source,
      hits,
    };
    return withSubjectCookie(
      NextResponse.json({
        ...body,
        quota: {
          used: quota.status.used,
          limit: quota.status.limit,
          remaining: quota.status.remaining,
          unlimited: quota.status.unlimited,
        },
      }),
      subject.setCookie,
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        scope: "api.search.invert",
        ts: new Date().toISOString(),
        event: "invert_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return withSubjectCookie(
      NextResponse.json(
        {
          ...EMPTY,
          error: err instanceof Error ? err.message : String(err),
        },
        { status: 500 },
      ),
      subject.setCookie,
    );
  }
}
