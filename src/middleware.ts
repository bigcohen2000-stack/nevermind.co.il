import { NextResponse, type NextRequest } from "next/server";

import { cloudflareAccessOk } from "@/lib/studio/cf-access";
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
  res.headers.set("cdn-cache-control", "no-store");
  return res;
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
    if (!(await cloudflareAccessOk(request))) {
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
