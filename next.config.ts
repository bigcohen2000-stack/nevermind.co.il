import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md / .mdx alongside the usual page extensions so MDX content
  // can be imported and (later) routed. Articles live in /content for now.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  // Keep the MDX pipeline minimal for Phase 5: no remark/rehype plugins yet.
});

export default withMDX(nextConfig);
