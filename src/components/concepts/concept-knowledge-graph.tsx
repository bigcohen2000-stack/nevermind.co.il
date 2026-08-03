"use client";

import dynamic from "next/dynamic";

import type { ConceptKnowledgeGraph } from "@/lib/concepts/knowledge-graph";

const ConceptKnowledgeGraphCanvas = dynamic(
  () =>
    import("@/components/concepts/concept-knowledge-graph-canvas").then(
      (mod) => mod.ConceptKnowledgeGraphCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,560px)] w-full items-center justify-center border border-foreground/15 bg-[#121212] text-sm text-[#9CA3AF]">
        טוען מפה...
      </div>
    ),
  },
);

type ConceptKnowledgeGraphViewProps = {
  graph: ConceptKnowledgeGraph;
};

/**
 * SSR-safe wrapper for the force-directed concept map.
 */
export function ConceptKnowledgeGraphView({
  graph,
}: ConceptKnowledgeGraphViewProps) {
  if (graph.nodes.length === 0) return null;
  return <ConceptKnowledgeGraphCanvas graph={graph} />;
}
