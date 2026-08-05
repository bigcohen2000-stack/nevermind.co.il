import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md / .mdx alongside the usual page extensions so MDX content
  // can be imported and (later) routed. Articles live in /content for now.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(self), geolocation=()",
      },
    ];

    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withMDX = createMDX({
  // Keep the MDX pipeline minimal for Phase 5: no remark/rehype plugins yet.
});

export default withMDX(nextConfig);
