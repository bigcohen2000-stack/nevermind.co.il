import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

/**
 * Cryptographic Cloudflare Access JWT verification for Studio.
 * Requires CF_ACCESS_TEAM_DOMAIN + CF_ACCESS_AUD when STUDIO_REQUIRE_CF_ACCESS=1.
 * Falls back to header presence + email allowlist only when those are unset
 * (must pair with Vercel Authentication on *.vercel.app so headers cannot be spoofed on origin).
 */

function teamDomain(): string {
  return (process.env.CF_ACCESS_TEAM_DOMAIN || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function audience(): string {
  return (process.env.CF_ACCESS_AUD || "").trim();
}

function allowedEmails(): string[] {
  return (process.env.STUDIO_ALLOWED_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(domain: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${domain}/cdn-cgi/access/certs`),
    );
  }
  return jwks;
}

export async function cloudflareAccessOk(
  request: NextRequest,
): Promise<boolean> {
  const required = process.env.STUDIO_REQUIRE_CF_ACCESS === "1";
  if (!required) return true;

  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    request.headers.get("Cf-Access-Jwt-Assertion");
  const emailHeader =
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("Cf-Access-Authenticated-User-Email");

  if (!jwt) return false;

  const domain = teamDomain();
  const aud = audience();
  const allow = allowedEmails();

  if (domain && aud) {
    try {
      const { payload } = await jwtVerify(jwt, getJwks(domain), {
        audience: aud,
        issuer: `https://${domain}`,
      });
      const email =
        typeof payload.email === "string"
          ? payload.email.trim().toLowerCase()
          : "";
      if (!email) return false;
      if (allow.length === 0) return true;
      return allow.includes(email);
    } catch {
      return false;
    }
  }

  // Header-only mode: safe only when *.vercel.app is behind Vercel Auth
  // so attackers cannot hit origin and forge CF headers.
  if (!emailHeader) return false;
  if (allow.length === 0) return true;
  return allow.includes(emailHeader.trim().toLowerCase());
}
