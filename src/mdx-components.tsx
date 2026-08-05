import type { ComponentPropsWithoutRef, ComponentType } from "react";

/**
 * Global MDX component map.
 *
 * Next.js (App Router) automatically reads this file to resolve the React
 * components used when rendering MDX. Pull quotes carry AEO hints so answer
 * engines can extract a clear claim. Custom components can be added later.
 */
type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>;

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return <blockquote data-ai-hint="key-claim" {...props} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    blockquote: Blockquote as ComponentType<Record<string, unknown>>,
  };
}
