import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CoreFactsResult =
  | { ok: true; facts: string[]; skipped?: boolean }
  | { ok: false; error: string };

const SYSTEM_PROMPT =
  "You extract only absolute logical facts from a Hebrew or English transcript. Strip emotion, story, metaphor, and persuasion. Return JSON only.";

const USER_PROMPT = `Extract only the absolute logical facts from this transcript, stripped of any emotion or story. Return as a JSON object with key "facts" whose value is an array of 3 to 5 short sentences.

Transcript:
`;

/**
 * Call OpenAI once per video (skip if core_facts already populated or key missing).
 * Saves facts to videos.core_facts.
 */
export async function extractAndSaveCoreFacts(
  videoId: string,
  transcript: string,
): Promise<CoreFactsResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "OPENAI_API_KEY not set (core_facts skipped)" };
  }

  const content = transcript.replace(/\s+/g, " ").trim();
  if (content.length < 40) {
    return { ok: false, error: "transcript too short for core_facts" };
  }

  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("videos")
    .select("core_facts")
    .eq("id", videoId)
    .maybeSingle();

  const prior = existing?.core_facts ?? [];
  if (Array.isArray(prior) && prior.length > 0) {
    return { ok: true, facts: prior, skipped: true };
  }

  const truncated =
    content.length > 12000 ? `${content.slice(0, 12000)}...` : content;

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
          { role: "user", content: `${USER_PROMPT}${truncated}` },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `OpenAI ${res.status}: ${detail.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const facts = parseFactsJson(raw);

    if (facts.length < 1) {
      return { ok: false, error: "OpenAI returned no usable facts" };
    }

    const limited = facts.slice(0, 5);
    const { error } = await admin
      .from("videos")
      .update({ core_facts: limited })
      .eq("id", videoId);

    if (error) {
      return { ok: false, error: `core_facts update: ${error.message}` };
    }

    return { ok: true, facts: limited };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function parseFactsJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (parsed && typeof parsed === "object" && "facts" in parsed) {
      const facts = (parsed as { facts: unknown }).facts;
      if (Array.isArray(facts)) {
        return facts
          .filter((item): item is string => typeof item === "string")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
  } catch {
    /* fall through */
  }
  return [];
}
