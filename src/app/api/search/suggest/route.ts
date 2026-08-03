import { NextResponse } from "next/server";

import { getMockSuggest, isMockSearchEnabled } from "@/lib/search/mock-suggest";
import { suggestSearch } from "@/lib/videos/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const breakdown = searchParams.get("breakdown") ?? undefined;
  const trimmed = q.trim();

  if (trimmed.length < 2) {
    return NextResponse.json({ items: [], concepts: [] });
  }

  try {
    if (isMockSearchEnabled()) {
      return NextResponse.json(getMockSuggest(trimmed));
    }
    const result = await suggestSearch(q, { breakdown });
    return NextResponse.json(result);
  } catch (err) {
    console.error(
      JSON.stringify({
        scope: "api.search.suggest",
        ts: new Date().toISOString(),
        event: "suggest_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return NextResponse.json(
      {
        items: [],
        concepts: [],
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
