import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/** Supabase origin for connect-src (browser client: auth + REST). */
function supabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

/**
 * Full Content-Security-Policy, shipped as Report-Only first so violations
 * surface in /api/csp-report (Vercel logs) before enforcement. `script-src`
 * keeps 'unsafe-inline' for the Next.js RSC payload and the theme / a11y
 * bootstrap scripts; there is no 'unsafe-eval'.
 */
function buildCsp(): string {
  const supabase = supabaseOrigin();
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.youtube.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://i.ytimg.com https://img.youtube.com",
    "font-src 'self' data:",
    `connect-src 'self'${supabase ? ` ${supabase}` : ""}`,
    "media-src 'self'",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ];
  return directives.join("; ");
}

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
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      },
      // Enforced now: directives with zero breakage risk.
      {
        key: "Content-Security-Policy",
        value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      },
      // Full policy in report mode. Flip to Content-Security-Policy once
      // /api/csp-report stays quiet in production (see docs/launch-checklist.md).
      {
        key: "Content-Security-Policy-Report-Only",
        value: buildCsp(),
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
