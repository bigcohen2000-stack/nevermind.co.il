import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ConceptGraphNode = {
  id: string;
  name: string;
  videoCount: number;
};

export type ConceptGraphLink = {
  source: string;
  target: string;
  /** How many videos mention both concepts. */
  weight: number;
};

export type ConceptKnowledgeGraph = {
  nodes: ConceptGraphNode[];
  links: ConceptGraphLink[];
};

async function tryCreateClient() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

/**
 * Concepts as nodes. An edge exists when at least one visible video
 * is tagged with both concepts. Edge weight = shared video count.
 */
export async function getConceptKnowledgeGraph(): Promise<ConceptKnowledgeGraph> {
  try {
    const supabase = await tryCreateClient();
    if (!supabase) return { nodes: [], links: [] };

    const { data, error } = await supabase
      .from("video_concepts")
      .select("video_id, concept_id, concepts(id, name)");

    if (error || !data?.length) {
      return { nodes: [], links: [] };
    }

    const conceptMeta = new Map<string, { name: string; videos: Set<string> }>();
    const conceptsByVideo = new Map<string, string[]>();

    for (const row of data) {
      const conceptRel = row.concepts as
        | { id: string; name: string }
        | { id: string; name: string }[]
        | null;

      const concept = Array.isArray(conceptRel) ? conceptRel[0] : conceptRel;
      const conceptId = concept?.id ?? row.concept_id;
      const conceptName = concept?.name?.trim() ?? "";
      if (!conceptId || !conceptName) continue;

      const meta = conceptMeta.get(conceptId) ?? {
        name: conceptName,
        videos: new Set<string>(),
      };
      meta.name = conceptName;
      meta.videos.add(row.video_id);
      conceptMeta.set(conceptId, meta);

      const list = conceptsByVideo.get(row.video_id) ?? [];
      if (!list.includes(conceptId)) list.push(conceptId);
      conceptsByVideo.set(row.video_id, list);
    }

    const pairWeights = new Map<string, number>();
    for (const conceptIds of conceptsByVideo.values()) {
      if (conceptIds.length < 2) continue;
      const sorted = [...conceptIds].sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}|${sorted[j]}`;
          pairWeights.set(key, (pairWeights.get(key) ?? 0) + 1);
        }
      }
    }

    const nodes: ConceptGraphNode[] = [...conceptMeta.entries()]
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        videoCount: meta.videos.size,
      }))
      .filter((n) => n.videoCount > 0)
      .sort(
        (a, b) =>
          b.videoCount - a.videoCount ||
          a.name.localeCompare(b.name, "he"),
      );

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links: ConceptGraphLink[] = [];
    for (const [key, weight] of pairWeights) {
      const [source, target] = key.split("|");
      if (!source || !target) continue;
      if (!nodeIds.has(source) || !nodeIds.has(target)) continue;
      links.push({ source, target, weight });
    }

    return { nodes, links };
  } catch {
    return { nodes: [], links: [] };
  }
}
