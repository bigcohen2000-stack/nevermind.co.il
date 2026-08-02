"use client";

import ForceGraph2D from "react-force-graph-2d";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ConceptGraphLink,
  ConceptKnowledgeGraph,
} from "@/lib/concepts/knowledge-graph";

type GraphNode = {
  id: string;
  name: string;
  videoCount: number;
  x?: number;
  y?: number;
};

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
};

function linkEndId(end: string | GraphNode): string {
  return typeof end === "object" ? end.id : end;
}

type ConceptKnowledgeGraphCanvasProps = {
  graph: ConceptKnowledgeGraph;
};

/**
 * Canvas force-graph (client-only). Loaded via dynamic(ssr:false) from the wrapper.
 */
export function ConceptKnowledgeGraphCanvas({
  graph,
}: ConceptKnowledgeGraphCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const neighborIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of graph.links) {
      const a = link.source;
      const b = link.target;
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a)!.add(b);
      map.get(b)!.add(a);
    }
    return map;
  }, [graph.links]);

  const graphData = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.links.map((l: ConceptGraphLink) => ({ ...l })),
    }),
    [graph],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(360, Math.floor(rect.height)),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoverId) return false;
      if (nodeId === hoverId) return true;
      return neighborIds.get(hoverId)?.has(nodeId) ?? false;
    },
    [hoverId, neighborIds],
  );

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const count = Math.max(1, node.videoCount);
      const radius =
        Math.min(10, 2.5 + Math.sqrt(count) * 1.4) /
        Math.max(globalScale * 0.35, 0.5);
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const active = !hoverId || isHighlighted(node.id);
      const hovered = hoverId === node.id;

      ctx.beginPath();
      ctx.arc(x, y, radius * (hovered ? 1.35 : 1), 0, 2 * Math.PI, false);

      if (active) {
        ctx.shadowColor = "rgba(212, 43, 43, 0.85)";
        ctx.shadowBlur = hovered ? 18 : 10;
        ctx.fillStyle = hovered ? "#FF4D4D" : "#D42B2B";
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(156, 163, 175, 0.25)";
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (hovered) {
        const fontSize = 12 / Math.max(globalScale * 0.4, 0.55);
        ctx.font = `${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#FAFAF8";
        ctx.fillText(node.name, x, y + radius * 1.6 + 2);
      }
    },
    [hoverId, isHighlighted],
  );

  const paintPointer = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const count = Math.max(1, node.videoCount);
      const radius = 2.5 + Math.sqrt(count) * 1.4 + 4;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [],
  );

  const linkColor = useCallback(
    (link: GraphLink) => {
      if (!hoverId) return "rgba(156, 163, 175, 0.28)";
      const sourceId = linkEndId(link.source);
      const targetId = linkEndId(link.target);
      if (sourceId === hoverId || targetId === hoverId) {
        return "rgba(212, 43, 43, 0.55)";
      }
      return "rgba(156, 163, 175, 0.08)";
    },
    [hoverId],
  );

  const linkWidth = useCallback(
    (link: GraphLink) => {
      const base = Math.min(2.5, 0.6 + link.weight * 0.25);
      if (!hoverId) return base;
      const sourceId = linkEndId(link.source);
      const targetId = linkEndId(link.target);
      if (sourceId === hoverId || targetId === hoverId) return base + 1;
      return 0.4;
    },
    [hoverId],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[min(70vh,560px)] w-full overflow-hidden border border-white/10 bg-black"
      role="img"
      aria-label="מפת מושגים אינטראקטיבית. העבירו עכבר על נקודה לראות קשרים. לחצו לחיפוש."
    >
      <ForceGraph2D<GraphNode, GraphLink>
        graphData={graphData}
        width={size.width}
        height={size.height}
        backgroundColor="#000000"
        nodeRelSize={4}
        cooldownTicks={80}
        warmupTicks={40}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.35}
        enableNodeDrag
        linkColor={linkColor}
        linkWidth={linkWidth}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintPointer}
        onNodeHover={(node) => setHoverId(node?.id ?? null)}
        onNodeClick={(node) => {
          if (!node?.name) return;
          router.push(`/search?q=${encodeURIComponent(node.name)}`);
        }}
      />

      <p className="pointer-events-none absolute bottom-3 start-3 text-xs text-[#9CA3AF]">
        העבירו עכבר להדגשה. לחצו לחיפוש.
      </p>
    </div>
  );
}
