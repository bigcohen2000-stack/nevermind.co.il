# Launch checklist (nevermind.co.il)

Updated 2026-08-04: Polish merged to `main` and live on Vercel. DNS behind Cloudflare proxy. Health OK.

**Production (`main`):** site polish live (club chrome, watch/members wiring, search tabs, greetings).

**Schema:** missing tables/columns from 21, 23, 30, 31, 32 applied and probed PASS (2026-08-04).

## Done

- [x] DNS apex A `76.76.21.21`, www CNAME `cname.vercel-dns.com` (proxied / orange cloud)
- [x] Production deploy Ready on Vercel
- [x] Clean `public/` (prompts/READMEs/boilerplate moved or removed)
- [x] Studio guide at `/studio/guide`
- [x] CF Access JWT helper (`src/lib/studio/cf-access.ts`)
- [x] `*.vercel.app` behind Vercel SSO
- [x] Core env: Supabase, YouTube, CRON, WhatsApp, Resend, Club, Studio flags
- [x] Cloudflare Access app **NeverMind Studio** (`/nm-ops*` + `/studio*`, email `bigcohen2000@gmail.com`)
- [x] Vercel Production: `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `STUDIO_REQUIRE_CF_ACCESS=1`
- [x] `STUDIO_GATE_SLUG=nm-ops`, `STUDIO_ALLOWED_EMAILS=bigcohen2000@gmail.com`
- [x] Google OAuth callback cookies + visible `auth_error` on `/my-list`
- [x] Branded 404 with search, hubs, login, contact

## Keep vs junk (do not delete blindly)

### Keep (needed even with manual Studio updates)

| Item | Why |
| --- | --- |
| `YOUTUBE_API_KEY` | Studio "ייבוא" still calls YouTube Data API for title, description, privacy, then transcript/concepts. Removing it breaks manual ingest and `getServerEnv()`. |
| `CRON_SECRET` | Protects `/api/admin/sync` and is Studio secret fallback. |
| `googleapis` + sync code | Used by Studio library sync button and optional weekly cron. |
| Supabase keys, Resend, Club secrets | Core product. |

### Optional (manual-only ops)

| Item | Recommendation |
| --- | --- |
| Weekly cron `/api/admin/sync` in `vercel.json` | Safe to **disable** if you only ingest from Studio and never want auto channel walk. Keep the route for on-demand sync. |
| `YOUTUBE_CHANNEL_IDS` / playlist ID envs | Keep if you still press "סנכרון ספרייה" in Studio. Harmless if unused. |
| `OPENAI_API_KEY` | Only for Blind Spot invert + core_facts. Optional. |

### Delete / retire (junk from old stack)

| Item | Action |
| --- | --- |
| `club.nevermind.co.il` DNS AAAA + Worker `nm-club-auth` + route | Delete in Cloudflare (API token is read-only: do in dashboard) |
| Cloudflare Access apps: `/admin/*`, `/dashboard/*`, `/api/dashboard/*`, `/api/club-admin/*` | Delete (old static site) |
| Cloudflare Access app: `nevermind.co.il/api/admin/*` | **Delete before orange cloud**, or Vercel cron/Studio sync can get blocked by Access |
| GitHub Pages custom domain on old/new repos | Remove if still set |
| `nevermind-html` repo | Archive only. Do not point DNS at it again |

**Verdict:** leave `YOUTUBE_API_KEY` in place. Manual Studio updates still need it. Do not remove sync code. Optionally turn off the weekly cron only.

## Your next clicks (Cloudflare dashboard)

### 1. Delete club leftovers

1. DNS → delete `club` AAAA `100::`
2. Workers → Routes → delete `club.nevermind.co.il/*`
3. Workers → delete script `nm-club-auth` if unused

### 2. Clean old Access apps

Zero Trust → Access → Applications → delete:

- Club Admin API (`/api/club-admin/*`)
- NeverMind Admin (`/admin/*`)
- NeverMind Dashboard (`/dashboard/*`)
- NeverMind Dashboard API (`/api/dashboard/*`)
- NeverMind Admin API (`/api/admin/*`)  ← important before proxy

### 3. Studio Access (done)

Access app + policy are live. Production env has AUD + team domain + `REQUIRE=1`.
Redeploy Production after env change so middleware picks them up.
Optional: WAF rate limit `/nm-ops*` about 10 req/min/IP → Managed Challenge.

Details: `docs/studio-cloudflare-access.md`

### 4. Schema apply (do this next)

1. Supabase → SQL Editor → paste `docs/sql/APPLY_MISSING_2026-08-04.sql` → Run
2. Local verify: `node scripts/_probe-schema-matrix.mjs` (all PASS)
3. QA: theme toggle (signed-in), LIVE likes/requests, Studio banners/quotes, presence, single-video leads

## Supabase (dashboard)

- [x] Core search/auth tables (videos, club_members, premium flags, live_stream_config, …)
- [x] Migration 33 `booking_leads` + pre_meeting status
- [x] Migration 34 meeting confirm columns + `/m/[token]` + Studio schedule/V UI
- [x] Apply `APPLY_MISSING_2026-08-04.sql` (21, 23, 30, 31, 32) — verified 2026-08-04
- [ ] Auth URL config: see `docs/auth-google.md` (Site URL + `https://nevermind.co.il/**`)
- [ ] Google OAuth: provider on + Google Cloud redirect = `https://<ref>.supabase.co/auth/v1/callback`
- [ ] Club password in Studio
- [ ] Confirm gated/unlisted videos look right

Smoke auth: Incognito → `/my-list` → Google → signed-in list (or visible `auth_error`).

## Validation matrix

| Check | Expected |
| --- | --- |
| `https://nevermind.co.il` | `Server: Vercel`, home OK |
| `https://nevermind.co.il/api/health` | `{"ok":true,"db":"ok"}` |
| `https://nevermind.co.il/studio` (logged out) | Looks like 404 |
| `https://nevermind.co.il/nm-ops` (before Access) | Gate form |
| `*.vercel.app/nm-ops` Incognito | Vercel SSO |
| Google user → `/studio` | 404 |
| After Access: wrong email | CF blocks |
| After Access: right email + wrong secret | No Studio session |

## Smoke

- [ ] `/`, `/search`, article, public watch
- [ ] Gated watch blocked without club
- [ ] Contact/booking Resend
- [ ] `/robots.txt`, `/sitemap.xml`
- [ ] Studio `/nm-ops` → `/studio` → `/studio/guide`
