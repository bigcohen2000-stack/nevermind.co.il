# DECISIONS.md
## NeverMinde Project - Key Decisions & Open Questions

**Last Updated:** August 2, 2026  
**Status:** Planning + video/search + investigation protocol locked  


---

## Completed Decisions (Locked)

### 1. Framework Choice: Next.js 16 + App Router
**Decision:** Use Next.js with App Router (not Pages Router)  
**Rationale:**
- App Router supports Server Components natively
- Better code splitting and performance
- Streaming support for faster FCP
- Native image optimization with `<Image />`
- Server Actions avoid API route exposure
- Vercel's first-class support

**Implications:**
- Requires TypeScript knowledge
- Learning curve for async Server Components
- All new Next.js docs are App Router-focused

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 2. Content Storage: Git-Based MDX (Not Headless CMS)
**Decision:** Store all articles as `.mdx` files in Git, not in a database CMS  
**Rationale:**
- Version control = content audit trail
- No vendor lock-in (no Contentful, Strapi, etc.)
- Git is the CMS—simpler infrastructure
- Build-time compilation → zero runtime database calls
- Frontmatter as metadata (no separate schema)
- Easy to migrate/backup (files are files)
- Open source philosophy aligns with content
- No external service fees

**Implications:**
- Content editors must use Git (learning curve)
- No WYSIWYG editor (text-based Markdown)
- No real-time collaboration (Git merges needed)
- Larger build times as content scales (< 1 min for 100 articles)

**Alternative Rejected:** Headless CMS (Sanity, Contentful)
- Too much overhead for a knowledge site
- Vendor lock-in risk
- Monthly costs
- Adds complexity

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 3. Service Worker: Serwist Over next-pwa
**Decision:** Use Serwist instead of next-pwa for PWA support  
**Rationale:**
- `next-pwa` no longer maintained for App Router
- Serwist is the spiritual successor, actively maintained
- Explicit caching strategies (StaleWhileRevalidate, NetworkFirst, etc.)
- Better offline control
- Cleaner configuration with TypeScript support
- Smaller bundle size than legacy next-pwa

**Implications:**
- Serwist is newer (but stable)
- Documentation is good but less abundant than next-pwa
- Requires explicit strategy configuration (good for control)

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 4. Authentication: Magic Links (Email-Only, No Passwords)
**Decision:** Use email-based magic link auth, not password-based auth  
**Rationale:**
- Simpler UX: no password reset flows
- More secure: no password database (phishing surface)
- Faster onboarding: paste link, instant access
- Aligns with minimalist philosophy (fewer form fields)
- Lower support burden (no "forgot password" tickets)
- Better accessibility: no password complexity rules

**Implications:**
- Users must have email access (reasonable assumption)
- Link expires in 24 hours (time-limited security)
- Email delivery delay (2–5 seconds is acceptable)
- No OAuth/social login (for now—can add later)

**Auth Library Choice: Better_Auth**
- Open source (Apache 2.0 license)
- Next.js native support
- Works with Resend for email delivery
- Lightweight compared to NextAuth

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 5. Email Service: Resend
**Decision:** Use Resend for transactional email (magic links, newsletters)  
**Rationale:**
- Built for Next.js developers
- Native React Email template support
- Clean API, good documentation
- Pay-as-you-go pricing (no monthly fee)
- Fast delivery (< 2 seconds typical)
- Good spam score (high inbox placement)

**Implications:**
- Requires RESEND_API_KEY environment variable
- Domain must be verified in Resend dashboard
- Email templates written as React components (fun!)
- Email tracking is optional

**Alternative Rejected:** SendGrid, Mailgun
- Both are older, larger APIs
- Resend integrates better with Next.js

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 6. Deploy Platform: Vercel
**Decision:** Deploy on Vercel (not AWS, Netlify, self-hosted)  
**Rationale:**
- Vercel is built for Next.js (owned by Vercel Inc.)
- Zero-config deployment from GitHub
- Edge Functions for Server Actions
- Global CDN with auto-optimized caching
- Preview deployments for every PR
- Free SSL, custom domains, environment variables
- Integrated monitoring and analytics
- Fastest cold start for serverless functions

**Implications:**
- Domain must point to Vercel
- Environment variables managed in Vercel dashboard
- GitHub commits auto-deploy (set up CI/CD carefully)
- No Docker/Kubernetes needed (Vercel handles infra)

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 7. Language Direction: RTL for Hebrew Content
**Decision:** Full RTL support from day one, build for Hebrew  
**Rationale:**
- Project is in Hebrew (Yakir Cohen)
- RTL must be architected early (not bolted on)
- Tailwind CSS has RTL mode (experimental, but good)
- Text, forms, navigation must be right-aligned
- Icons may need mirroring

**Implications:**
- All components must support RTL variants
- Testing must verify text direction
- Custom CSS may be needed (logical properties)
- Fonts must support Hebrew characters

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 8. Colors: No Gradients, No Shadows
**Decision:** Hard minimalism—only solid colors from token system  
**Rationale:**
- Aligns with "zero drama" philosophy
- Cleaner code (no gradient definitions)
- Faster rendering (fewer CSS properties)
- Easier to test and maintain
- Reduces cognitive load for users

**Color Palette:**
- `#FAFAF8` - Off-white background
- `#1A1A1A` - Deep black text
- `#D42B2B` - Red accent (actions only)
- `#9CA3AF` - Muted gray (interpretation layer)

**Implications:**
- No "hover" state gradients (color shift only)
- No box shadows (borders instead, if needed)
- Design must be clear and crisp (no visual fuzz)

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 9. Redirects: 301 Mapped, Not URL Parameters
**Decision:** Use 301 permanent redirects for old URLs, not `?old_url=` query parameters  
**Rationale:**
- Preserves SEO domain authority
- Google crawlers follow 301s correctly
- Cleaner URLs without query params
- Implemented in `next.config.ts` (zero runtime cost)
- One-time setup, then forgotten

**Implications:**
- Old URL structure dies (new structure replaces it)
- All old backlinks work (redirect transparently)
- Need to map all old URLs in a spreadsheet first

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 10. Performance Target: Lighthouse 95+
**Decision:** Maintain Lighthouse score 95+ on all pages (all categories)  
**Rationale:**
- Reflects Core Web Vitals performance
- Performance is part of search ranking
- Signals respect for user bandwidth
- Challenging but achievable for a knowledge site

**Implications:**
- Every feature must be audited
- Large images must be compressed and lazy-loaded
- Third-party scripts must be monitored
- Third-party libraries must be lightweight

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### 11. Database for Video Search Index: New Isolated Supabase Project
**Decision:** Use a **new** Supabase (PostgreSQL) project under a new user/org for the video/concepts/transcripts search index only. Do not reuse the outdated existing Supabase project or any keys from other Cursor projects/deployments.  
**Rationale:**
- Prevents env/API key/RLS collisions across projects
- Clean schema tailored to Hebrew search (`tsvector` + GIN first; `pgvector` later)
- Articles remain Git-based MDX (Decision 2) — Supabase is not the article CMS
- Existing dumps can be mapped/imported into the new schema without blind copy

**Implications:**
- Create new Supabase project (e.g. `nevermind-co-il-prod` / `nevermind-dev`)
- Stage dumps under `supabase/imports/` (no PII in git)
- Env vars only for this app: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus `YOUTUBE_API_KEY`, `CRON_SECRET`
- Vercel env vars must be scoped to the NeverMind project only

**Alternative Rejected:** Reusing the old Supabase project  
- Stale schema, shared keys, risk of cross-project deploy collisions

**Date Decided:** July 29, 2026  
**Status:** ✅ LOCKED

---

### 12. YouTube Player: Dual-Layer (Facade + Watch Player)
**Decision:** Lite facade (thumbnail + play) on list/card surfaces; interactive IFrame API player only on `/watch/[videoId]` with `?t=[seconds]` support.  
**Rationale:**
- Protects LCP/INP on browse pages (aligns with Decision 10 and Blueprint lite-embed)
- Timestamp jumps needed for concept research only on the watch page
- Avoids loading `react-youtube` (or equivalent) on every list item

**Implications:**
- Prefer `@next/third-parties` / lite-youtube pattern for lists
- Watch page is a client island for player controls only
- `next/image` for `i.ytimg.com` thumbnails

**Alternative Rejected:** `react-youtube` everywhere (heavy CWV cost); lite-only everywhere (weak timestamp UX)

**Date Decided:** July 29, 2026  
**Status:** ✅ LOCKED

---

### 13. Watch-Page Booking CTA: WhatsApp First
**Decision:** Stage 1 CTA under the watch player is context-aware. Primary path: dark booking modal (name / phone / email) emailed to admin via Resend Server Action. WhatsApp remains available on `/contact` and other lead surfaces.  
**Rationale:**
- User explicitly approved Resend + contextual modal (Aug 2026)
- Keeps keys server-side (`RESEND_API_KEY`, `BOOKING_ADMIN_EMAIL`)
- Prefills video title or search query as context

**Implications:**
- Set `RESEND_API_KEY`, `BOOKING_ADMIN_EMAIL`, optional `RESEND_FROM_EMAIL` in `.env.local` and Vercel
- Without those keys the modal shows a clear config error (no silent fail)

**Date Decided:** July 29, 2026 (WhatsApp-first). Updated August 1, 2026.  
**Status:** ✅ LOCKED (modal + Resend + WhatsApp)

---

### 14. Investigation Protocol: Breakdown Levels + Tags + Soft Metrics
**Decision:** Videos get a single `breakdown_level` (primary / no_difference / perspective_flip / unfiltered). Investigation tags are curated concepts with `category = investigation`. Watch pages show "מדדי חקירה" from duration + concept-density peaks (not YouTube Analytics). Public watch pages show a "המשך החקירה" club teaser (`club_teaser_label` / `club_teaser_href`, with /members default).  
**Rationale:**
- Depth taxonomy helps sync, browse, and Cursor link videos by פירוק level, not only topic
- Reuses concepts junction instead of a second tag system
- Honest metrics now: duration + heatmap peaks. Retention and comment word-clouds wait for Analytics/comments APIs
- Upsell on public pages without building a new paywall

**Implications:**
- Apply migration `24_investigation_protocol.sql`
- Re-run YouTube sync to backfill `breakdown_level` (does not overwrite curator values) and investigation concept categories
- Optional per-video teaser copy via `club_teaser_*` columns
- Browse filter: `?breakdown=`

**Alternative Rejected:** Fake audience-retention UI without Analytics data.

**Date Decided:** August 2, 2026  
**Status:** ✅ LOCKED

---

## Open Questions (Needs Decision)

### Q1: Premium Pricing & Tier Structure
**Status:** ❓ OPEN  
**Question:** How many premium tiers? One price or multiple levels?

**Options:**
- A) Single tier: "Premium" = $X/month, all premium content unlocked
- B) Multiple tiers: "Basic" ($X/mo) vs. "Deep Dive" ($Y/mo) with different content
- C) One-time purchase: "$X for lifetime access"

**Implications:**
- Single tier: simpler billing, less revenue potential
- Multiple tiers: complex billing logic, higher revenue potential
- One-time: simpler billing, hard to update pricing later

**Decision Needed:** Before Phase 9 (Premium/Auth)  
**Owner:** Yakir Cohen  
**Timeline:** By end of Phase 7

---

### Q2: Domain Name
**Status:** ✅ LOCKED  
**Question:** What's the final domain?

**Options:**
- A) `neverminde.co.il` (Israel-specific TLD)
- B) `neverminde.com` (global)
- C) `yakir-cohen.com` (personal brand)
- D) Other?

**Implications:**
- Domain affects SEO (country TLD gives geo-preference)
- Domain affects branding (which is the "brand"?)
- Domain affects email sender address (hello@domain)

**Decision Needed:** Before Phase 2 (configure in `next.config.ts`)  
**Owner:** Yakir Cohen  
**Timeline:** Immediately (before Phase 2)

---

**DECIDED:** Domain decision deferred.  
**Chosen Option:** D) Other / Deferred  
**Rationale:** Use `NEXT_PUBLIC_SITE_URL` as environment variable. For local development, use `localhost:3000`. For production, update env var on Vercel. This unblocks Phase 2 without waiting for domain decision.  
**Implementation:**
- Create `.env.local` with `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Create `.env.example` template
- On Vercel production, set `NEXT_PUBLIC_SITE_URL=https://[domain-to-be-decided]`
- All canonical URLs and OG tags use this env var

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### Q3: Newsletter Frequency & Strategy
**Status:** ❓ OPEN  
**Question:** How often should newsletter be sent? What's the content strategy?

**Options:**
- A) Weekly digest of new articles
- B) Monthly deep-dive on one mechanism
- C) Ad-hoc (when new premium content drops)
- D) No newsletter (email signup for login only)

**Implications:**
- Frequency affects subscriber churn (too often = unsubscribe)
- Strategy affects content calendar
- Affects Resend volume/costs

**Decision Needed:** Before Phase 10 (Email/Newsletter)  
**Owner:** Yakir Cohen  
**Timeline:** By end of Phase 7

---

### Q4: Premium Content Leakage Risk
**Status:** ❓ OPEN  
**Question:** How to prevent premium content from leaking to non-paying users?

**Options:**
- A) Server-side render only for authenticated users (current plan)
- B) Client-side gate (show modal, don't block HTML)
- C) Watermark images + videos (tracks if shared)
- D) Accept leakage as marketing (piracy is OK)

**Implications:**
- Server-side gate: more secure, complex implementation
- Client-side gate: simpler, less secure
- Watermarking: trust users, tracking adds complexity
- Accept leakage: simpler, but risk revenue loss

**Decision Needed:** Before Phase 9 (Premium/Auth)  
**Owner:** Yakir Cohen  
**Timeline:** By Phase 8

---

### Q5: Analytics & User Tracking
**Status:** ❓ OPEN  
**Question:** Should we track user behavior? Use analytics (Google Analytics, Plausible, etc.)?

**Options:**
- A) No analytics at all (pure privacy-first)
- B) Vercel Analytics only (privacy-respecting, no third-party)
- C) Plausible Analytics (privacy-respecting, paid)
- D) Google Analytics (powerful, but privacy concerns)

**Implications:**
- No analytics: can't measure user behavior, harder to improve UX
- Vercel only: basic metrics, no heatmaps or flow analysis
- Plausible: privacy-respecting, costs $9–19/month
- Google: detailed, but requires GDPR consent

**Decision Needed:** Flexible (can be done in Phase 11)  
**Owner:** Yakir Cohen  
**Timeline:** By Phase 11 (can defer)

---

### Q6: Database Choice (If Needed)
**Status:** ✅ LOCKED (see Completed Decision 11)  
**Question:** Which database for users, subscribers, analytics?

**Chosen:** New isolated Supabase project for **video search index only** (videos, concepts, transcripts). Not for MDX articles. Auth/subscribers DB still deferred until Phase 9 if needed beyond this.

**Still open for later:** Whether premium users/subscribers reuse the same Supabase project or a separate store — decide before Phase 9.

**Date Decided:** July 29, 2026  

---

### Q7: Content Audit Results
**Status:** ❓ OPEN  
**Question:** How many articles exist? Which are premium vs. public?

**Deliverable from Phase 1:** Spreadsheet with all article titles, URLs, categories  
**Info Needed:**
- Total article count
- Public vs. premium split
- Estimated migration time (manual review + editing)
- Any content that should be deleted/archived?

**Decision Needed:** Before Phase 5 (MDX Content System)  
**Owner:** Yakir Cohen  
**Timeline:** End of Phase 1

---

### Q8: Video Content Inventory
**Status:** ❓ OPEN  
**Question:** How many videos? How are they stored currently?

**Info Needed:**
- Count of videos
- YouTube channel (if exists)?
- Unlisted vs. public?
- Duration of videos (affects loading strategy)
- Premium vs. public split

**Decision Needed:** Before Phase 6 (Video Integration)  
**Owner:** Yakir Cohen  
**Timeline:** End of Phase 1

---

### Q9: Brand/Logo Assets
**Status:** ✅ LOCKED  
**Question:** What logo/brand assets exist?

**Info Needed:**
- Logo (if exists)
- Color guidance beyond palette provided
- Typography preference (serif vs. sans-serif already chosen as variable)
- Imagery guidelines (AI-generated or stock?)

**Decision Needed:** Before Phase 3 (Design System)  
**Owner:** Yakir Cohen  
**Timeline:** By Phase 2

---

**DECIDED:** Text-based logo for Phase 1.  
**Chosen Option:** Minimal text logo (no graphic asset)  
**Rationale:** Do not block Phase 2 waiting for brand assets. Launch with clean typography. Logo will be simple: "NeverMinde" stacked above "Yakir Cohen" in serif font. Professional but minimal. Graphic assets (symbol, icon) can be added post-launch (Phase 12+).  
**Implementation:**
- Phase 2: Create header component with text logo (no image asset)
- Phase 3: Design token for logo typography
- Post-launch: If needed, add graphic logo without changing header structure

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### Q10: Maintenance & Content Updates After Launch
**Status:** ✅ LOCKED  
**Question:** Who updates content after launch? What's the process?

**Options:**
- A) Yakir edits `.mdx` files directly in Git (needs Git knowledge)
- B) Non-technical editor + developer handles commits
- C) Build a custom admin UI for editing (Phase 12+)
- D) Use a headless CMS later (Phase 12+)

**Implications:**
- Direct Git: free, but steep learning curve
- Editor + dev: slower updates, dependency on developer
- Admin UI: expensive, scope creep
- Headless CMS: abandons git-based approach, more complex

**Decision Needed:** Before Phase 2 (architecture decision)  
**Owner:** Yakir Cohen  
**Timeline:** By Phase 1 or Phase 2

---

**DECIDED:** Developer/technical operator handles content updates initially.  
**Chosen Option:** B) Non-technical editor + developer handles commits  
**Rationale:** Keeps Git-based MDX architecture clean and version-controlled, but avoids forcing Yakir to learn Git immediately. A technical operator (developer/content manager) pulls content from Yakir, creates `.mdx` files with proper Frontmatter, and commits to GitHub. Yakir focuses on content authorship, not Git operations.  
**Implementation:**
- Phase 2+: Create CONTRIBUTING.md documenting Frontmatter schema
- Yakir writes content in Google Docs or text format
- Technical operator converts to `.mdx`, validates Frontmatter, commits
- Future (Phase 12+): If volume increases, migrate to admin UI for self-service

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### Q11: Mobile-First or Desktop-First Design?
**Status:** ✅ LOCKED  
**Current Plan:** Mobile-first design  
**Question:** Should we truly mobile-first instead?

**Options:**
- A) Mobile-first (design for small screens, expand to desktop)
- B) Desktop-first (design for desktop, shrink for mobile)
- C) Hybrid (design both equally)

**Implications:**
- Mobile-first: better for mobile users, can feel cramped on desktop
- Desktop-first: desktop readers happy, mobile feels squeezed
- Hybrid: more work, best UX, but slower design

**Decision Needed:** Before Phase 4 (Page Structure)  
**Owner:** Yakir Cohen  
**Timeline:** By end of Phase 2

---

**DECIDED:** Mobile-first approach.  
**Chosen Option:** A) Mobile-first  
**Rationale:** NeverMinde is primarily Hebrew content-heavy reading material. Hebrew readers, RTL layout, and on-the-go consumption heavily favor mobile. Desktop is secondary (researchers, archive browsing). Mobile-first keeps the base layout lean (single column, vertical flow), then adds desktop enhancements (sidebar, wider text width, two-column grids) via media queries.  
**Implementation:**
- Phase 4: Design article page as single-column mobile first
- Use Tailwind responsive prefixes (`md:`, `lg:`) for desktop breakpoints
- Typography grows gracefully: mobile ~16px base → desktop ~18px
- Navigation stays minimal and stacked on mobile, expands on desktop

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

### Q12: Internationalization (i18n)
**Status:** ✅ LOCKED  
**Question:** Should the site support English + Hebrew, or Hebrew only?

**Options:**
- A) Hebrew only (RTL, Hebrew fonts, Hebrew content)
- B) Dual language (English + Hebrew, with language toggle)
- C) English + Hebrew + other languages (more complex)

**Implications:**
- Hebrew only: simpler, focused, authentic
- Dual: more content to maintain, need translations
- Multi-lang: too complex for Phase 1

**Decision Needed:** Before Phase 2 (affects i18n setup)  
**Owner:** Yakir Cohen  
**Timeline:** Immediately (affects architecture)

---

**DECIDED:** Hebrew only for Phase 1.  
**Chosen Option:** A) Hebrew only  
**Rationale:** The project should launch focused, simple, and fully optimized for RTL. All content, navigation, UI text is Hebrew. This keeps architecture clean, testing simpler, and brand authentic. If English expansion is needed later, it can be added in Phase 12+ as a post-launch feature (separate URL paths like `/en/topics/...`).  
**Implementation:**
- Phase 2: No i18n library (next-i18n, etc.) - unnecessary overhead
- All UI strings hardcoded in Hebrew in components
- HTML lang attribute: `<html lang="he" dir="rtl">`
- Content: All MDX files in Hebrew
- Future: If English needed, revisit with proper i18n library

**Date Decided:** June 18, 2026  
**Status:** ✅ LOCKED

---

## Decision Log Template (For Future Decisions)

When a new decision must be made, use this format:

```markdown
### Q#: [Question Title]
**Status:** ❓ OPEN  
**Question:** [What's the decision?]

**Options:**
- A) [Option 1 + brief rationale]
- B) [Option 2 + brief rationale]
- C) [Option 3 + brief rationale]

**Implications:** [What changes if we pick A vs. B vs. C?]

**Decision Needed:** [Before which phase?]  
**Owner:** [Who decides?]  
**Timeline:** [When must it be decided?]

---

**DECIDED:** [Once decided, fill this in]  
**Chosen Option:** [A, B, or C]  
**Rationale:** [Why this choice?]  
**Date Decided:** [Date]  
**Status:** ✅ LOCKED
```

---

## Risk Assessment

### High Risk

1. **Content Migration at Scale**
   - Risk: 50+ articles, manual editing, typos, broken images
   - Mitigation: Automate with script where possible, batch testing
   - Owner: Yakir Cohen

2. **Performance Regression**
   - Risk: As content grows, Lighthouse score drops
   - Mitigation: Performance budget in CI/CD, image optimization
   - Owner: Developer

3. **SEO Domain Loss**
   - Risk: URL restructuring causes Google to de-index old content
   - Mitigation: 301 redirects set up correctly, Monitor GSC for crawl errors
   - Owner: Developer

### Medium Risk

1. **Email Deliverability**
   - Risk: Magic links land in spam folder
   - Mitigation: Domain verified in Resend, SPF/DKIM configured
   - Owner: Developer

2. **PWA Compatibility**
   - Risk: Service Worker bugs on some browsers
   - Mitigation: Test on iOS, Android, Chrome, Firefox, Safari
   - Owner: Developer

3. **Premium Gate Leakage**
   - Risk: Premium content visible in source code or Google Cache
   - Mitigation: Server-side rendering, noindex on premium content
   - Owner: Developer

### Low Risk

1. **Framework Obsolescence**
   - Risk: Next.js changes API (unlikely)
   - Mitigation: Regular dependency updates, monitor releases
   - Owner: Developer

2. **Design Token Conflicts**
   - Risk: Tailwind class naming conflicts
   - Mitigation: Use semantic naming, CSS modules if needed
   - Owner: Developer

---

## Dependencies & Blockers

### Must Be Decided Before Phase 2:
- ✅ Framework (Next.js)
- ❓ Domain name
- ❓ Internationalization (Hebrew only or dual language?)

### Must Be Decided Before Phase 3:
- ❓ Brand assets (logo, colors, typography)

### Must Be Decided Before Phase 5:
- ❓ Content audit results (how many articles?)
- ❓ Premium vs. public split

### Must Be Decided Before Phase 6:
- ❓ Video inventory (how many, stored where?)

### Must Be Decided Before Phase 9:
- ❓ Premium pricing structure
- ✅ Database for video search index (new isolated Supabase — Decision 11)
- ❓ Whether premium users/subscribers share that Supabase project
- ❓ Premium content leakage prevention

---

## Success Criteria for Planning Phase (Phase 1)

- ✅ BLUEPRINT_REVISED.md created and reviewed
- ✅ TASKS.md created with 11 clear phases
- ✅ DECISIONS.md created with locked decisions
- ✅ Q2 (Domain Name) decided - deferred with env var approach
- ✅ Q9 (Brand/Logo) decided - text-based logo only
- ✅ Q10 (Content Updates) decided - developer + operator model
- ✅ Q11 (Mobile-First Design) decided - mobile-first approach
- ✅ Q12 (i18n) decided - Hebrew only for Phase 1
- [ ] Q1 (Premium Pricing) - decide before Phase 9
- [ ] Q3 (Newsletter Strategy) - decide before Phase 10
- [ ] Q4 (Premium Leakage Prevention) - decide before Phase 9
- [ ] Q5 (Analytics) - decide before Phase 11
- ✅ Q6 (Database) - new isolated Supabase for video index (Decision 11); subscribers store still open for Phase 9
- [ ] Q7 (Content Audit) - complete spreadsheet by end of Phase 1
- [ ] Q8 (Video Inventory) - complete by end of Phase 1
- ✅ Cursor rule `.cursor/rules/video-search-platform.mdc` — video/search master guidance
- ✅ Decisions 12–13 locked (dual-layer player, WhatsApp CTA)

---

## Next Steps

1. Create the **new** Supabase project/user; keep old project unused
2. Place existing dumps for mapping under `supabase/imports/` (no PII in git)
3. Add `.env.local` for this app only (never copy keys from other Cursor projects)
4. When ready, implement Modules 1→4 one at a time per the Cursor rule

---

### Local search go-live (Aug 2026)

**Decision:** Local browse/search uses `.env.local`. Production env lives only on Vercel project `nevermind.co.il` (not YakirCohen).

**Mirrored Production keys:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_API_KEY`, `CRON_SECRET`, `YOUTUBE_CHANNEL_IDS`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL=https://nevermind.co.il`, `NEXT_PUBLIC_USE_MOCK_SEARCH=false`.

**Helper:** `node scripts/push-vercel-env.mjs` (refuses non-nevermind linked projects).

---

**Document Status:** UPDATED (investigation protocol Aug 2, 2026)  
**Last Updated:** August 2, 2026  
**Next Review:** YouTube Analytics retention / comment frequency cloud
