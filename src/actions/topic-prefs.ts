"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type TopicPrefOption = {
  id: string;
  name: string;
  selected: boolean;
};

export async function listTopicPrefOptions(
  limit = 40,
): Promise<TopicPrefOption[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const [{ data: concepts }, { data: prefs }] = await Promise.all([
      supabase
        .from("concepts")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(limit),
      supabase
        .from("user_topic_prefs")
        .select("concept_id")
        .eq("user_id", user.id),
    ]);

    const selected = new Set((prefs ?? []).map((p) => p.concept_id));
    return (concepts ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      selected: selected.has(c.id),
    }));
  } catch {
    return [];
  }
}

export async function toggleTopicPref(
  conceptId: string,
): Promise<{ ok: true; selected: boolean } | { ok: false; error: string }> {
  try {
    const id = conceptId.trim();
    if (!id) return { ok: false, error: "חסר מושג." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "יש להתחבר." };

    const { data: existing } = await supabase
      .from("user_topic_prefs")
      .select("concept_id")
      .eq("user_id", user.id)
      .eq("concept_id", id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("user_topic_prefs")
        .delete()
        .eq("user_id", user.id)
        .eq("concept_id", id);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/profile");
      return { ok: true, selected: false };
    }

    const { error } = await supabase.from("user_topic_prefs").insert({
      user_id: user.id,
      concept_id: id,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/profile");
    return { ok: true, selected: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
