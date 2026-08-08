# Launch checklist (nevermind.co.il)

Updated 2026-08-08. Production on Vercel. DNS behind Cloudflare.

## Verified live (automated)

- `/api/health` ok
- `/robots.txt` 200
- `/sitemap.xml` 200
- `/newsletter/unsubscribe` 200
- `/`, `/search`, `/articles`, `/videos` 200
- `/api/admin/sync` without secret → not a public success (auth required)
- App middleware does **not** wrap `/api/admin/*` (only `/studio*` + gate slug)

## Closed in product

- Membership tiers UX + Studio newsletter
- Club ops stages in Supabase (`ops_link_minted_at`, `ops_whatsapp_sent_at`)
- Studio club board (live queue, not localStorage)
- Extend membership months in Studio
- Health checks: gated playlist env + missing teasers
- Unit tests via `npm test` (CI workflow file is local until pushed with GitHub `workflow` scope)

## Still human (dashboards / Incognito)

1. [ ] Supabase Auth: Site URL + `https://nevermind.co.il/**` redirect allowlist
2. [ ] Cloudflare: delete leftover Access on `/api/admin/*` if it still exists in Zero Trust
3. [ ] Cloudflare: remove `club.nevermind.co.il` leftovers if present
4. [ ] Smoke gated watch in Incognito (teaser/lock, email account does not unlock)
5. [ ] Smoke contact/booking lead → Resend / Studio leads
6. [ ] Smoke Studio: Access → `/nm-ops` → `/studio/club` + `/studio/newsletter`
7. [ ] Set `GATED_PLAYLIST_IDS` in Vercel if empty
8. [ ] Close teaser gaps from Studio health / `#teasers`
9. [ ] Run `supabase/migrations/43_club_renewal_request.sql` (member renewal mark in the expiry banner)
10. [ ] CSP: after a few quiet days in Vercel logs (`scope: "csp.report"`), rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `next.config.ts` (keep the small enforced header until then)

## Keep

| Item | Why |
| --- | --- |
| `YOUTUBE_API_KEY` | Studio ingest + sync |
| `CRON_SECRET` | `/api/admin/sync` |
| Supabase + Resend + Club secrets | Core |

## Out of scope

No checkout. Articles open. No new external services without approval.
