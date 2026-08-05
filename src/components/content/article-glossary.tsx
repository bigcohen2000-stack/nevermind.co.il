"use client";

import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

import { ConceptTerm } from "@/components/content/concept-term";
import {
  glossaryDefinition,
  glossaryTerms,
} from "@/lib/concepts/glossary";

const SKIP_TAGS = new Set([
  "A",
  "BUTTON",
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "TEXTAREA",
  "INPUT",
  "SVG",
  "NOSCRIPT",
]);

type ArticleGlossaryProps = {
  children: ReactNode;
};

/**
 * After mount, wrap curated glossary terms in article prose with tooltips.
 * Skips links and interactive nodes. Longest term match wins.
 */
export function ArticleGlossary({ children }: ArticleGlossaryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountsRef = useRef<Root[]>([]);
  const terms = useMemo(() => glossaryTerms(), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || terms.length === 0) return;

    const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "g");

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      textNodes.push(node as Text);
      node = walker.nextNode();
    }

    const mounts: Root[] = [];
    const enhancedTerms = new Set<string>();

    for (const textNode of textNodes) {
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (parent.closest("[data-glossary-term]")) continue;
      if (SKIP_TAGS.has(parent.tagName)) continue;
      if (parent.closest("a, button, [data-glossary-skip]")) continue;

      const value = textNode.nodeValue ?? "";
      if (!value.trim()) continue;
      pattern.lastIndex = 0;
      if (!pattern.test(value)) continue;

      pattern.lastIndex = 0;
      const parts = value.split(pattern);
      if (parts.length <= 1) continue;

      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (!part) continue;
        const definition = glossaryDefinition(part);
        if (definition && !enhancedTerms.has(part)) {
          enhancedTerms.add(part);
          const span = document.createElement("span");
          span.setAttribute("data-glossary-term", part);
          frag.appendChild(span);
          const mount = createRoot(span);
          mounts.push(mount);
          mount.render(
            createElement(ConceptTerm, {
              term: part,
              definition,
            }),
          );
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    }

    mountsRef.current = mounts;
    return () => {
      const mountedRoots = mountsRef.current;
      mountsRef.current = [];
      root.querySelectorAll("[data-glossary-term]").forEach((el) => {
        const term = el.getAttribute("data-glossary-term") ?? "";
        el.replaceWith(document.createTextNode(term));
      });
      window.setTimeout(() => {
        for (const mount of mountedRoots) {
          mount.unmount();
        }
      }, 0);
    };
  }, [terms]);

  return (
    <div ref={rootRef} data-glossary-root="">
      {children}
    </div>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
