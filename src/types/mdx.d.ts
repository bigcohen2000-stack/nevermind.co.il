/**
 * Ambient module declaration for imported .mdx files.
 *
 * Each article exports a `metadata` object (see content/articles/*.mdx) and a
 * default React component for the rendered body. Typed here so the content
 * helper can import metadata with full type-safety. Kept local instead of
 * pulling in @types/mdx to avoid an extra dependency in Phase 5.
 *
 * NOTE: no top-level import/export here — that would make this file a module
 * and turn the wildcard below into an augmentation instead of a global
 * ambient declaration. The inline `import("react")` keeps it global.
 */
declare module "*.mdx" {
  export const metadata: {
    title: string;
    slug: string;
    category: "relationships" | "existence" | "identity";
    isPremium: boolean;
    description: string;
  };

  const MDXComponent: import("react").ComponentType;
  export default MDXComponent;
}
