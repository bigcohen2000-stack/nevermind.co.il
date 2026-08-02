import { NextResponse, type NextRequest } from "next/server";

import {
  getStudioGateSlug,
  getStudioUnlockSecret,
  isValidStudioCookieValue,
  STUDIO_COOKIE,
} from "@/lib/studio/token";

const NOINDEX =
  "noindex, nofollow, noarchive, nosnippet, noimageindex, max-snippet:0";

function denyStudioProbe(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/not-found-studio";
  const res = NextResponse.rewrite(url);
  res.headers.set("x-robots-tag", NOINDEX);
  res.headers.set("cache-control", "private, no-store, max-age=0");
  res.headers.set("referrer-policy", "no-referrer");
  return res;
}

function withStudioHardening(res: NextResponse): NextResponse {
  res.headers.set("x-robots-tag", NOINDEX);
  res.headers.set("cache-control", "private, no-store, max-age=0");
  res.headers.set("referrer-policy", "no-referrer");
  // Do not advertise this surface to browsers as a shared cacheable page.
  res.headers.set("cdn-cache-control", "no-store");
  return res;
}

/**
 * Optional Cloudflare Access JWT presence check.
 * When STUDIO_REQUIRE_CF_ACCESS=1, requests without CF Access identity headers
 * are treated as probes (look like 404). Configure Access on Cloudflare to
 * allow only Bigcohen2000@gmail.com (or your allowlist).
 */
function cloudflareAccessOk(request: NextRequest): boolean {
  const required = process.env.STUDIO_REQUIRE_CF_ACCESS === "1";
  if (!required) return true;

  // Cloudflare Access sets these after successful login (email OTP / IdP).
  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    request.headers.get("Cf-Access-Jwt-Assertion");
  const email =
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("Cf-Access-Authenticated-User-Email");

  if (!jwt || !email) return false;

  const allow = (process.env.STUDIO_ALLOWED_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length === 0) {
    // CF Access is on, but no email allowlist in app: trust CF policy alone.
    return true;
  }

  return allow.includes(email.trim().toLowerCase());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const gateSlug = getStudioGateSlug();
  const secret = getStudioUnlockSecret();
  const cookieValue = request.cookies.get(STUDIO_COOKIE)?.value;
  const authed = await isValidStudioCookieValue(cookieValue, secret);

  const isGatePath = pathname === `/${gateSlug}`;
  const isStudioPath =
    pathname === "/studio" || pathname.startsWith("/studio/");

  if (isGatePath || isStudioPath) {
    if (!cloudflareAccessOk(request)) {
      return denyStudioProbe(request);
    }
  }

  // Obscure unlock entry: /{STUDIO_GATE_SLUG} → internal /studio/gate
  if (isGatePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/gate";
    return withStudioHardening(NextResponse.rewrite(url));
  }

  // Direct /studio/gate is hidden (only via gate slug rewrite).
  if (pathname === "/studio/gate") {
    return denyStudioProbe(request);
  }

  // All studio routes require a valid session cookie.
  if (isStudioPath) {
    if (!authed) {
      return denyStudioProbe(request);
    }
    return withStudioHardening(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio",
    "/studio/:path*",
    // Default gate. If STUDIO_GATE_SLUG differs, add that path here too.
    "/nm-ops",
  ],
};
