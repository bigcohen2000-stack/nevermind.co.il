import { NextResponse } from "next/server";

import { searchInvertedCaptions } from "@/lib/search/invert-caption-search";
import { invertSearchQuery } from "@/lib/search/invert-query";
import type { InvertSearchResponse } from "@/lib/search/types";

const EMPTY: InvertSearchResponse = {
  premise: null,
  opposite: null,
  tease: null,
  source: null,
  hits: [],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit") ?? "1");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 1;

  if (q.length < 2) {
    return NextResponse.json(EMPTY);
  }

  try {
    const inverted = await invertSearchQuery(q);
    if (!inverted) {
      return NextResponse.json(EMPTY);
    }

    const hits = await searchInvertedCaptions(inverted.opposite, limit);

    const body: InvertSearchResponse = {
      premise: inverted.premise,
      opposite: inverted.opposite,
      tease: inverted.tease,
      source: inverted.source,
      hits,
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error(
      JSON.stringify({
        scope: "api.search.invert",
        ts: new Date().toISOString(),
        event: "invert_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return NextResponse.json(
      {
        ...EMPTY,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
