import { NextResponse } from "next/server";

import { suggestSearch } from "@/lib/videos/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 1) {
    return NextResponse.json({ items: [], concepts: [] });
  }

  try {
    const result = await suggestSearch(q);
    return NextResponse.json(result);
  } catch (err) {
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
