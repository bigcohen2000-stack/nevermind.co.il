"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_STORED = 5;

export async function pushUserSearchHistory(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Drop prior duplicates of the same query (case-insensitive via app filter).
    const { data: existing } = await supabase
      .from("user_search_history")
      .select("id, query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);

    const dupIds = (existing ?? [])
      .filter((row) => row.query.trim().toLowerCase() === trimmed.toLowerCase())
      .map((row) => row.id);

    if (dupIds.length > 0) {
      await supabase.from("user_search_history").delete().in("id", dupIds);
    }

    await supabase.from("user_search_history").insert({
      user_id: user.id,
      query: trimmed,
    });

    // Cap stored rows per user.
    const { data: all } = await supabase
      .from("user_search_history")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const overflow = (all ?? []).slice(MAX_STORED).map((row) => row.id);
    if (overflow.length > 0) {
      await supabase.from("user_search_history").delete().in("id", overflow);
    }

    return listUserSearchHistory();
  } catch {
    return [];
  }
}

export async function listUserSearchHistory(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("user_search_history")
      .select("query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_STORED);

    return (data ?? [])
      .map((row) => row.query.trim())
      .filter(Boolean)
      .slice(0, MAX_STORED);
  } catch {
    return [];
  }
}
