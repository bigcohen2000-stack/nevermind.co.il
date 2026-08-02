import "server-only";

import { resolveBlindSpot } from "@/lib/search/blind-spot-map";
import type { InvertSource } from "@/lib/search/types";

export type InvertResult = {
  premise: string;
  opposite: string;
  tease: string;
  source: InvertSource;
};

const SYSTEM_PROMPT = `You map a Hebrew search sentence to a NeverMind-style philosophical blind spot.
The user often searches a symptom. You return the inverted root concept.
Return JSON only with keys: premise, opposite, tease.
premise: short Hebrew phrase for the user's assumption or symptom.
opposite: short Hebrew root concept (1 to 4 words). Prefer roots like מציאות, הזדהות, אגו, חוסר ודאות, אשמה, אשליה.
tease: one short Hebrew sentence explaining why the opposite is the useful direction.
No markdown. No extra keys.`;

/**
 * Map-first logical inversion. Falls back to OpenAI when the Blind Spot map misses.
 * Soft-fails (null) when neither map nor LLM can invert.
 */
export async function invertSearchQuery(
  rawQuery: string,
): Promise<InvertResult | null> {
  const q = normalize(rawQuery);
  if (q.length < 2) return null;

  const mapped = resolveBlindSpot(q);
  if (mapped) {
    return {
      premise: mapped.premise,
      opposite: mapped.opposite,
      tease: mapped.tease,
      source: "map",
    };
  }

  return invertWithOpenAI(q);
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

async function invertWithOpenAI(query: string): Promise<InvertResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CORE_FACTS_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Sentence:\n${query}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error(
        JSON.stringify({
          scope: "search.invert",
          event: "openai_failed",
          status: res.status,
        }),
      );
      return null;
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = parseInvertJson(raw);
    if (!parsed) return null;

    return { ...parsed, source: "llm" };
  } catch (err) {
    console.error(
      JSON.stringify({
        scope: "search.invert",
        event: "openai_error",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return null;
  }
}

function parseInvertJson(
  raw: string,
): Omit<InvertResult, "source"> | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const premise =
      typeof parsed.premise === "string" ? normalize(parsed.premise) : "";
    const opposite =
      typeof parsed.opposite === "string" ? normalize(parsed.opposite) : "";
    const tease =
      typeof parsed.tease === "string" ? normalize(parsed.tease) : "";
    if (premise.length < 2 || opposite.length < 2) return null;
    return {
      premise,
      opposite,
      tease:
        tease ||
        "לפעמים מה שאתה מחפש הוא רק הסימפטום, והתשובה נמצאת בכיוון ההפוך.",
    };
  } catch {
    return null;
  }
}
