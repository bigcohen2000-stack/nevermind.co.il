import type { ComponentType } from "react";

/**
 * Global MDX component map.
 *
 * Next.js (App Router) automatically reads this file to resolve the React
 * components used when rendering MDX. For Phase 5 we keep it minimal and let
 * MDX fall back to plain HTML elements, which are already styled globally in
 * globals.css (RTL, minimal, no shadows/gradients). Custom components such as
 * <FactVsStory /> will be wired in here in a later phase.
 */
type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
