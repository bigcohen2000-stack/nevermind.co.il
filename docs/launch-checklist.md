# Launch checklist (nevermind.co.il)

## Clean before go-live

- [x] Remove internal prompts / READMEs from `public/` (moved to `docs/`)
- [x] Remove unused Next.js boilerplate SVGs from `public/`
- [x] Rename `club-lock-overlay.png.png` to `club-lock-overlay.png`
- [x] Studio guide tab at `/studio/guide`
- [x] CF Access JWT helper (`src/lib/studio/cf-access.ts`) with optional cryptographic verify
- [ ] Do not commit `.next/`, `.env*`, or raw `supabase/imports` dumps

## Blocker: DNS still on GitHub Pages

As of 2026-08-03:

- Nameservers: Cloudflare (`leanna` / `renan`) — keep them
- Apex + www: CNAME → `bigcohen2000-stack.github.io` (old site)
- Live `https://nevermind.co.il` returns `Server: GitHub.com`
- Vercel already aliases `nevermind.co.il` / `www`, but DNS must point at Vercel
- Cloudflare MCP token is **read-only** for DNS. Edit in Cloudflare dashboard (or grant `DNS:Edit`)

### DNS change (dashboard)

| Name | Action | Value | Proxy |
| --- | --- | --- | --- |
| `nevermind.co.il` | Replace GitHub CNAME with **A** | `76.76.21.21` | Grey first, then Orange after SSL OK |
| `www` | CNAME | `cname.vercel-dns.com` | Same as apex |
| `club` | Delete AAAA + Workers route `nm-club-auth` | — | — |

Do **not** touch MX / SPF / DKIM / DMARC / Resend / `send.`.

Do **not** switch nameservers to `ns1.vercel-dns.com` (breaks CF Email + Access).

After edit: wait 1–5 minutes, confirm `Server: Vercel` on `https://nevermind.co.il/`.

Then in GitHub `nevermind-html` → Settings → Pages → remove custom domain.

## Vercel Production env

- [x] Core Supabase / YouTube / CRON / WhatsApp / site URL
- [x] `NEXT_PUBLIC_USE_MOCK_SEARCH=false` on Production
- [x] Resend: `RESEND_API_KEY`, `BOOKING_ADMIN_EMAIL`, `RESEND_FROM_EMAIL`
- [x] `CLUB_GATE_SECRET` on Production
- [x] `*.vercel.app` behind Vercel SSO (anti-bypass)
- [ ] Re-deploy Production after latest merge
- [ ] `STUDIO_SECRET` dedicated (or confirm CRON_SECRET fallback is strong)
- [ ] After Access live: `STUDIO_REQUIRE_CF_ACCESS=1`, `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`

Re-push later with: `node scripts/push-vercel-env.mjs`

## Supabase

- [ ] Apply pending migrations on production (25–30 especially)
- [ ] Auth redirect URLs include `https://nevermind.co.il/**` (+ localhost for dev)
- [ ] Google OAuth for this project only
- [ ] Club password set in Studio
- [ ] Gated / unlisted videos synced and marked

## Security (Zero Trust)

- [ ] Cloudflare Access app: `/nm-ops*` + `/studio*` → email `bigcohen2000@gmail.com` only
- [ ] Retire old Access apps for `/admin`, `/dashboard` (static site)
- [ ] WAF rate limit on `/nm-ops*` (about 10/min/IP)
- [ ] Run validation matrix (vercel.app blocked, /studio = 404, wrong email blocked, wrong secret rejected, Google user ≠ Studio)

## Smoke test (after DNS cutover)

- [ ] `/` home, `/search`, `/articles`, public `/watch/...`
- [ ] Gated watch blocked without club access
- [ ] Contact / booking email via Resend
- [ ] `/api/health` returns 200
- [ ] `/robots.txt` and `/sitemap.xml`
- [ ] Studio unlock via `/nm-ops` + guide at `/studio/guide`
