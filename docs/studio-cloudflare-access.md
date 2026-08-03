/**
 * Cloudflare Access setup for NeverMind Studio (ops only).
 *
 * Goal: Studio is invisible to Google and locked to one email via Cloudflare,
 * then still requires the existing Studio secret cookie.
 *
 * Prerequisites
 * - nevermind.co.il DNS is proxied through Cloudflare (orange cloud).
 * - Site still deploys on Vercel. Access sits in front of the hostname.
 *
 * Steps (Zero Trust dashboard)
 * 1. Zero Trust → Access → Applications → Add an application → Self-hosted
 * 2. Application name: NeverMind Studio
 * 3. Session duration: e.g. 24 hours
 * 4. Public hostname: nevermind.co.il
 *    Path: /nm-ops*
 *    (If STUDIO_GATE_SLUG changed, use that path instead.)
 * 5. Add a second public hostname path: /studio*
 * 6. Policy name: Yakir only
 *    Action: Allow
 *    Include → Emails → bigcohen2000@gmail.com
 *    (One-time PIN email login works without Google Workspace.)
 * 7. Optional: block App Launcher visibility so Studio does not appear in CF portal
 * 8. Save
 *
 * App env (Vercel + local .env)
 *   STUDIO_REQUIRE_CF_ACCESS=1
 *   STUDIO_ALLOWED_EMAILS=bigcohen2000@gmail.com
 *   STUDIO_SECRET=... (keep existing)
 *   STUDIO_GATE_SLUG=nm-ops
 *   CF_ACCESS_TEAM_DOMAIN=yourteam.cloudflareaccess.com
 *   CF_ACCESS_AUD=<Access application AUD tag>
 *
 * Middleware verifies the Access JWT signature against Cloudflare JWKS when
 * TEAM_DOMAIN + AUD are set. Without them it only checks headers + email
 * (safe only if *.vercel.app is locked with Vercel Authentication).
 *
 * Direct Vercel URL
 * - Keep Vercel Authentication (SSO) on *.vercel.app so nobody bypasses Cloudflare.
 * - Custom domain nevermind.co.il stays public for visitors.
 * - Cloudflare Access only covers traffic that hits the Cloudflare hostname.
 *
 * WAF (optional but recommended)
 * - Rate limit path /nm-ops* (e.g. 10 requests / minute / IP → Block or Managed Challenge).
 *
 * After setup
 * 1. Open https://nevermind.co.il/nm-ops
 * 2. Cloudflare asks for email → enter bigcohen2000@gmail.com → OTP
 * 3. Then enter Studio secret as today
 * 4. /studio without Access or secret still looks like a normal 404
 *
 * Google indexing
 * - robots.txt disallows /studio and gate slug
 * - Middleware sends X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
 * - In Search Console: Removals for /studio and /nm-ops if they ever appeared
 */

export {};
