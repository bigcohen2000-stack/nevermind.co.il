# TASKS.md
## NeverMinde Implementation Roadmap - 11 Phases

**Status:** Phase 2 In Progress  
**Current Phase:** Phase 2 (Base Next.js Setup)  
**Last Updated:** June 18, 2026

---

## Design v1 Polish (June 25, 2026)

Focused sharpening pass on the existing (Polish v4) UI — no new packages, routes,
content, auth, or functionality. Locked brand tokens unchanged.

- [x] Added a visible keyboard focus ring to interactive cards/rows/links
      (`.card`, `.row-link`, `.link-arrow` `:focus-visible`) in `globals.css`.
- [x] Introduced the editorial **eyebrow** signature — a short red tick before
      the muted section label (`.eyebrow` / `.eyebrow-on-dark`).
- [x] Extracted the duplicated `Eyebrow` / `Watermark` helpers from all pages
      into a shared `src/components/ui/editorial.tsx`.
- [x] Header: active-page indicator (`aria-current` + red accent via `.nav-link`),
      tighter mobile nav layout.
- [x] Articles index: rebuilt the list as a numbered editorial index (table-of-
      contents rhythm with hairline dividers) instead of generic stacked cards.
- [x] Aligned the orphaned `Button` component to the shared `.btn` system.

---

## Overview

This document breaks the NeverMinde website build into **11 safe, sequential phases**. Each phase is a complete, deployable increment. No phase depends on future code; all phases can be tested independently.

**Phase Duration Estimates:**
- Phase 1: 2 days
- Phase 2: 3 days
- Phase 3: 4 days
- Phase 4: 5 days
- Phase 5: 6 days
- Phase 6: 3 days
- Phase 7: 4 days
- Phase 8: 5 days
- Phase 9: 4 days
- Phase 10: 3 days
- Phase 11: 5 days

**Total Estimate:** ~44 days of development (real timeline depends on content volume)

---

## PHASE 1: Project Planning & Groundwork

### Goals
- Finalize architecture decisions
- Set up development environment
- Create project structure
- Document assumptions and open questions

### Deliverables
1. ✅ **BLUEPRINT_REVISED.md** - Architecture document (COMPLETED)
2. ✅ **TASKS.md** - This implementation plan (COMPLETED)
3. ✅ **DECISIONS.md** - Decision log & open questions (CREATING)
4. **Development Environment Setup**
   - Git repository initialized
   - Project directory structure created (`/content`, `/components`, `/lib`, etc.)
   - `.env.example` template created
5. **Design Tokens File**
   - `tailwind.config.ts` ready (colors, tokens defined)
   - CSS variable setup for `#FAFAF8`, `#1A1A1A`, `#D42B2B`, `#9CA3AF`
6. **Content Audit**
   - List all existing NeverMind articles
   - Map old URLs → new category structure
   - Identify which content is premium vs. public

### Definition of Done
- [ ] All three planning docs created and reviewed
- [ ] Git repository clean and documented
- [ ] Directory structure matches architecture plan
- [ ] Design tokens documented and approved
- [ ] Content audit spreadsheet complete
- [ ] No code written yet (planning only)

### Questions to Resolve
- What's the final domain name?
- Which articles from the old site need migration?
- Should newsletter signup be in Phase 1 or Phase 2?
- Premium content pricing & tier structure?

---

## PHASE 2: Base Next.js Setup & Infrastructure

### Goals
- Initialize Next.js 16 project with App Router
- Configure TypeScript and Tailwind CSS
- Set up deployment pipeline to Vercel
- Create basic layout and navigation skeleton

### Deliverables
1. **Next.js App Router Project**
   - `npx create-next-app@latest` with App Router
   - TypeScript enabled
   - Tailwind CSS configured
2. **Core Layout Files**
   - `app/layout.tsx` - Root layout with RTL support, language setting
   - `app/page.tsx` - Home page (minimal, TBD design)
   - `app/globals.css` - Global styles with design tokens
3. **Navigation**
   - Header component with minimal nav (Home, Relationships, Existence, Identity)
   - Footer with copyright + links
   - Mobile-responsive (not mobile-first, but functional)
4. **Vercel Deployment**
   - Connect GitHub repo to Vercel
   - Set environment variables
   - Configure build settings
   - First deploy to production (empty site is fine)
5. **Font Setup**
   - Load local Hebrew font files
   - Register with `next/font/local`
   - No external font requests
6. **RTL Configuration**
   - Add `dir="rtl"` to root `<html>`
   - Test text direction in browser
   - Verify Tailwind RTL support active

### Definition of Done
- [ ] `npm run dev` works locally
- [ ] Site builds and deploys to Vercel
- [ ] Home page renders (minimal, no content yet)
- [ ] Navigation works and links to non-existent pages (OK for now)
- [ ] Hebrew text renders properly in RTL
- [ ] Lighthouse score measurable (may be < 95 without content)
- [ ] No errors in browser console or Vercel logs

### Tasks
- [ ] Create Next.js project from scratch or use starter
- [ ] Install and configure Tailwind CSS
- [ ] Add TypeScript strict mode
- [ ] Create `/app/layout.tsx` with language meta tags
- [ ] Create basic header and footer components
- [ ] Deploy skeleton to Vercel
- [ ] Add local Hebrew font loading
- [ ] Test RTL rendering

---

## PHASE 3: Design System & Component Library

### Foundation Step (✅ COMPLETED — June 18, 2026)
Minimal design foundation only. Full component library still pending.
- [x] Root layout set to Hebrew RTL (`<html lang="he" dir="rtl">`) with NeverMinde metadata
- [x] Removed default Google Fonts (external requests) in favor of a system font stack with Hebrew support
- [x] Design tokens defined as CSS variables in `globals.css` (`--background`, `--foreground`, `--action`, `--muted`) and wired into Tailwind via `@theme inline`
- [x] RTL-friendly, mobile-first typography defaults (no shadows, gradients, or heavy animations); single palette (no dark mode)
- [x] `src/lib/design-tokens.ts` created with raw + semantic color names
- [x] Minimal `src/components/ui/button.tsx` (primary/secondary variants)
- [x] Default demo homepage replaced with a simple Hebrew placeholder (real homepage deferred to Phase 4)
- [x] `npm run build` passes clean (no TypeScript or build errors)

### Layout Foundation Step (✅ COMPLETED — June 18, 2026)
Minimal RTL layout frame only. Real homepage and content pages still deferred.
- [x] `src/components/layout/site-header.tsx` — text logo (NeverMinde / יקיר כהן) + placeholder nav (ראשי, מאמרים, מנגנונים, וידאו, חברים)
- [x] `src/components/layout/site-footer.tsx` — text logo, placeholder links, copyright line
- [x] `src/components/layout/site-shell.tsx` — header + content + footer column frame (sticky-bottom footer)
- [x] `src/app/layout.tsx` wraps the app with `SiteShell`
- [x] Header/footer are RTL, mobile-first, minimal — no shadows, gradients, animations, or external icons
- [x] Nav links are placeholders (`href="#"`); real routes deferred to Phase 4
- [x] `src/app/page.tsx` kept as a simple Hebrew placeholder
- [x] `npm run build` passes clean

_Remaining Phase 3 work (Card, Badge, Heading/Text, FactVsStory, PremiumGate, VideoEmbed, Callout, icons) is not started._

### Goals
- Build reusable UI components
- Implement design tokens systematically
- Create Storybook or component documentation
- Ensure visual consistency

### Deliverables
1. **Design Tokens (Tailwind Config)**
   - Color tokens: `bg-primary` (off-white), `text-primary` (black), `bg-accent` (red)
   - Semantic colors: `bg-relationships`, `bg-existence`, `bg-identity`
   - Typography scales defined
   - Spacing scales (4px base unit)
   - Shadow restrictions (zero shadows by default)
2. **Core Components (TypeScript + Tailwind)**
   - `Button` - Primary action button (red background)
   - `Card` - Content container
   - `Badge` - Category label (relationships/existence/identity)
   - `Link` - Navigation link with no underline
   - `Heading` - H1–H6 styles
   - `Text` - Body text with semantic variants
3. **Layout Components**
   - `Container` - Max-width wrapper
   - `Grid` - 2–3 column layouts
   - `Sidebar` - For future nav
4. **Content Components (MDX-ready)**
   - `<FactVsStory fact={} story={} />` - Core analysis tool
   - `<PremiumGate isPremium={} content={} />` - Paywall component
   - `<VideoEmbed youtubeId={} />` - Lite YouTube embed
   - `<Callout type="info|warning|tip">` - Highlighted box
5. **Icon System**
   - SVG icons (no icon font library)
   - Icons for categories, actions
   - Minimalist stroke-based design

### Definition of Done
- [ ] All components render correctly
- [ ] Components tested in isolation (Storybook or React component preview)
- [ ] Design tokens applied consistently
- [ ] No component uses shadows, gradients, or rounded corners (unless essential)
- [ ] Typography hierarchy clear and readable
- [ ] Color contrast meets WCAG AA standard
- [ ] Lighthouse score improves or stays stable

### Tasks
- [ ] Create `components/` directory structure
- [ ] Define `tailwind.config.ts` with semantic color tokens
- [ ] Build `Button`, `Card`, `Badge` components
- [ ] Build `FactVsStory` component with gray strikethrough styling
- [ ] Build `PremiumGate` component skeleton
- [ ] Create icon SVG folder
- [ ] Document component props and usage

---

## PHASE 4: Basic Page Structure & Navigation

### Route Structure Step (✅ COMPLETED — June 19, 2026)
Minimal flat route skeleton only. Dynamic `/topics/[category]/[slug]` routes, MDX,
breadcrumbs, 404/error pages, and the full homepage are still deferred.
- [x] Placeholder pages created: `/articles`, `/mechanisms`, `/videos`, `/members` (Hebrew, RTL, right-aligned, content-light, design tokens only)
- [x] Existing `/` placeholder kept as-is
- [x] Header nav links wired to real routes (ראשי → /, מאמרים → /articles, מנגנונים → /mechanisms, וידאו → /videos, חברים → /members)
- [x] Footer nav links wired to the same real routes
- [x] Existing SiteShell, header, and footer reused — no new packages, no MDX/PWA/auth/premium/payments/Resend/database/analytics/video
- [x] `npm run build` passes clean (all routes prerender as static)

_Remaining Phase 4 work (dynamic topic routes, breadcrumbs, 404/error/offline pages, sitemap placeholder, full homepage) is not started._

### Goals
- Create category landing pages (Relationships, Existence, Identity)
- Build article index pages
- Set up routing structure for `/topics/{category}/{topic}`
- Create 404 and error pages

### Deliverables
1. **Category Landing Pages**
   - `/topics/relationships/` - List all relationships articles
   - `/topics/existence/` - List all existence articles
   - `/topics/identity/` - List all identity articles
2. **Article Template**
   - `app/topics/[category]/[slug]/page.tsx` - Dynamic route for articles
   - Basic layout: title, category badge, article metadata
   - Placeholder for content (MDX integration in Phase 5)
3. **Navigation & Routing**
   - Header navigation links work
   - Breadcrumb navigation
   - Category filtering (if applicable)
4. **Error Pages**
   - `app/404.tsx` - Not found page (clean, minimalist)
   - `app/error.tsx` - Error page with retry option
   - `app/~offline.tsx` - Offline fallback page
5. **Sitemap Placeholder**
   - `app/sitemap.ts` created (returns empty array for now)
   - Ready for MDX integration in Phase 5
6. **Home Page Content**
   - Hero section with project mission
   - Links to three mechanisms
   - No heavy graphics (maybe one simple illustration)

### Definition of Done
- [ ] All pages route correctly
- [ ] No 404 errors when navigating
- [ ] Mobile layout works (responsive nav)
- [ ] Breadcrumbs display correctly
- [ ] 404 and error pages styled
- [ ] Lighthouse score 80+ (without heavy content)

### Tasks
- [ ] Create `/topics/[category]` dynamic route
- [ ] Create `/topics/[category]/[slug]` dynamic route
- [ ] Build category landing page component
- [ ] Build article stub component (content TBD)
- [ ] Create navigation bar with category links
- [ ] Add breadcrumb component
- [ ] Design and implement 404/error pages
- [ ] Test all routing scenarios

---

## PHASE 5: MDX Content System & Article Integration

### MDX Foundation Step (✅ COMPLETED — June 19, 2026)
Minimal MDX content foundation for articles only. No premium logic, no sitemap,
no FactVsStory wiring, no bulk migration — those remain deferred.
- [x] Installed minimal MDX packages only: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`
- [x] `next.config.ts` wrapped with `createMDX` (+ `.md`/`.mdx` page extensions); MDX pipeline kept plugin-free
- [x] `src/mdx-components.tsx` created at the correct src-based App Router location (minimal pass-through map)
- [x] `src/types/mdx.d.ts` — local ambient `*.mdx` type (metadata + default component); avoids adding `@types/mdx`
- [x] `content/articles/` created with 2 Hebrew sample articles: `fact-vs-story.mdx`, `what-is-a-mechanism.mdx`
- [x] Each article exports a `metadata` object: `title`, `slug`, `category`, `isPremium: false`, `description`
- [x] `src/lib/content/articles.ts` — small static registry helper (no fs scan, no DB): list, slugs, single-article loader, Hebrew category labels
- [x] `/articles` updated to list the 2 articles (title, category, description) linking to each
- [x] `/articles/[slug]` dynamic route renders MDX (RTL, right-aligned, minimal); `generateStaticParams` + `dynamicParams = false`
- [x] `npm run build` passes clean; both articles prerender as static SSG

_Remaining Phase 5 work (Frontmatter validation, syntax highlighting, dynamic sitemap, `<FactVsStory />` in MDX, migrating the first 5 articles) is not started._

### Visual Direction Rollout — /articles (✅ COMPLETED — June 19, 2026)
Applied the whole-site visual direction (see DESIGN_DIRECTION.md §7) to the
articles index only. No new articles, no content migration, no detail-page changes.
- [x] `src/app/articles/page.tsx` rebuilt as full-bleed bands: dark hero → light "how it's organized" → light editorial cards list
- [x] Reused existing `getAllArticles` and `CATEGORY_LABELS` helpers; MDX internals untouched
- [x] The two sample articles render as clean hairline-bordered editorial cards (category, title, description, "קראו ←")
- [x] Hebrew, RTL, right-aligned, mobile-first; `max-w-3xl` reading measure per the direction doc
- [x] Existing color tokens only; no shadows, gradients, external icons, or external fonts; hover = color shift only
- [x] `npm run build` passes clean; `/articles` still prerenders as static

### Visual Direction Rollout — /members (✅ COMPLETED — June 19, 2026)
Applied the editorial direction (DESIGN_DIRECTION.md §7) to the members page as a
STATIC PLACEHOLDER for the future members area. No auth, login, gate, payment,
checkout, subscription, forms, email signup, or protected content — copy and
layout only. No new packages, no MDX changes.
- [x] `src/app/members/page.tsx` rebuilt: dark hero (status card "בקרוב") → light preview cards → dark "what it is not" → light "what it is" → dark notice + CTA
- [x] Hero states clearly in Hebrew that the area is planned and not active ("מתוכנן. עדיין לא פעיל.")
- [x] Four static preview cards (מאמרים עמוקים, הרצאות סגורות, סדרות תוכן, תרגולים / שאלות) each marked "נעול" + "בקרוב" with hairline-bar hints (no real content)
- [x] "What membership is NOT" (אינו טיפול / מוטיבציה / בידור / אימון רגשי) rendered as muted strikethrough panels
- [x] "What membership IS" (התבוננות מובנית, מנגנונים עמוקים יותר, קריאה וצפייה חוזרות, פחות רעש יותר מבנה)
- [x] Closing notice restates "not active yet"; CTAs link back to `/articles` and `/videos`
- [x] Asymmetric desktop / stacked mobile; oversized low-contrast watermarks; hairline borders; tokens only; no shadows/gradients/external icons/fonts; Hebrew RTL right-aligned
- [x] No forms, no buttons that imply functionality; `npm run build` passes clean (/members stays static)

_All primary routes (/, /articles, /articles/[slug], /mechanisms, /videos, /members) now share the editorial visual system._

### Visual Consistency Pass (✅ COMPLETED — June 19, 2026)
Small consistency fixes only — no redesign, no structural changes, no new functionality.
- [x] Homepage `CtaLink`: added `hover:no-underline` so primary/secondary CTAs no longer pick up the global `a:hover` underline (now matches the buttons on every other page)
- [x] `/articles` normalized to the site-standard responsive rhythm: `md:` → `sm:`/`lg:` breakpoints, hero `py-24 lg:py-32` + `text-4xl sm:text-5xl lg:text-6xl leading-[1.05]`, content bands `py-20 lg:py-28`, section headings `text-2xl lg:text-3xl`, card title `text-xl lg:text-2xl`
- [x] Verified no `md:` breakpoints remain anywhere in `src/app` / `src/components`
- [x] `/articles` keeps its `max-w-3xl` reading measure (per DESIGN_DIRECTION.md §7); width left intentional
- [x] `npm run build` passes clean; all routes stay static

_Phase 6 remains deferred to a later approved step._

### Copy Cleanup Pass 1 (✅ COMPLETED — June 19, 2026)
Copy-only fixes from the audit (COPY_BRIEF.md / CONTENT_STRATEGY.md). No layout,
Tailwind, color, spacing, component, routing, or package changes. MDX article
content untouched.
- [x] Homepage members teaser honesty (F-3): "...זמינים באזור החברים. נדרשת הרשמה." → "...מתוכננים לאזור החברים. האזור עדיין אינו פעיל." + card line "פירוט מלא זמין לחברים בלבד." → "פירוט מלא יתווסף עם פתיחת אזור החברים." — now consistent with /members (planned, not active)
- [x] De-duplicated "אותו ניתוח, בקול" (F-6): homepage video band H2 → "אותו מבנה, בקול." ( /videos keeps "אותו ניתוח, בקול." as its page thesis)
- [x] `/articles` H1 no longer a bare noun (F-4) + dropped footer-echoing "ללא דרמה": eyebrow "ניתוח לוגי בכתב" → "מאמרים"; H1 "מאמרים" → "ניתוח לוגי, מנגנון אחר מנגנון."; subhead drops "ללא דרמה" and trailing "הלוגי"
- [x] `/videos` de-listicled: H2 "ארבעה אופנים לצפות." → "אותם מנגנונים, מזוויות שונות."; subhead reworded to avoid "מזווית" echo
- [x] `/members` unclear line (F-4): "הוא מסיר ממנה." → "הוא עומד מחוץ לה."
- [x] `npm run build` passes clean; all routes stay static

### Five-Article Consistency Pass (✅ COMPLETED — June 19, 2026)
Reviewed all 5 articles as one system. Voice/roles/titles/descriptions/order/contradictions checked; blame article not moralizing, fight not advice, indecision not coaching. One overlap fix between the two relationship articles.
- [x] Confirmed: distinct openings + distinct "what can be checked" intros (5 variants, shared stance phrase); distinct titles/descriptions; registry order kept (flagship → mechanism def → existence example → 2 relationship examples, dependency-correct); no contradictions; no AI tells
- [x] Fixed cross-article overlap (#9/#2): the interpretation "הוא לא מכבד אותי"/"זלזול" was shared by both relationship articles + the flagship ("לא מכבד" in 3 articles). Differentiated why-i-blame-him to the ignoring register: "כי הוא לא מכבד אותי" → "כי הוא מתעלם ממני", and "אין תשובה הופך ל'זלזול'" → "...ל'התעלמות'" — reduces the echo AND fits its unanswered-message example better than "disrespect" did; brief's lack-of-care/rejection coverage preserved (לא אכפת + מתעלם)
- [x] Kept as intentional consistency: the "אינו... הוא רק רואה" close cadence, the "(ל)דוגמה:" label, the "מה אפשר לבדוק לוגית"/"סיכום" structural headings, the canonical "הוא לא מכבד אותי" example in fact-vs-story + why-we-fight
- [x] No full rewrites, no new article, no registry/order change; `npm run build` passes clean (all routes static)

### Editorial Pass — מהי האשמה (✅ COMPLETED — June 19, 2026)
Light copy-edit of `content/articles/why-i-blame-him.mdx` only. No structure/title/metadata/slug change; free status kept; no other files touched.
- [x] Audited against the checklist — already strong (dry, not advice/coaching, non-moralizing: doesn't blame the reader, doesn't say "stop blaming", promises nothing; clean event/feeling/story/mechanism separation; clear blame-vs-fact distinction; dry close)
- [x] One precision edit: mechanism section opened with "אצל אותם אנשים" (vague plural, no referent, against the article's singular "אדם" framing) → "אצל אותו אדם" — clearer and consistent
- [x] Title "מהי האשמה", slug "why-i-blame-him", category "relationships", isPremium:false kept; no rewrite
- [x] `npm run build` passes clean; article stays static SSG

### Article — מהי האשמה (✅ COMPLETED — June 19, 2026)
Wrote ONE real MDX article (backlog R1 sibling, second relationships piece). No layout/Tailwind/color/component changes, no new packages, no interactive components, no edits to existing MDX bodies.
- [x] Title evaluation: chose "מהי האשמה" over "למה אני מאשים אותו" — the article decomposes the *concept* of blame (event/feeling/story), so a definitional title fits (parallels מהי התלבטות); impersonal/dry; avoids a "למה...למה" echo with the sibling "למה אנחנו רבים". Slug kept as required (why-i-blame-him)
- [x] Created `content/articles/why-i-blame-him.mdx` — Hebrew, RTL; metadata matches pattern (title, slug "why-i-blame-him", category "relationships" → יחסים, isPremium:false, description)
- [x] Registered in `src/lib/content/articles.ts` via the static registry (import + entry, appended); now 5 articles, second relationships entry
- [x] Structure per brief: opening (what people call blame) → what actually happened → what the person felt → the story that connects event to feeling → why blame feels like fact → repeating relationship mechanism → what can be checked → dry summary; one pull-quote
- [x] Required concrete example: unanswered message → read as lack of care / disrespect → blame forms around the interpretation, not just the missing reply (distinct from why-we-fight's raised-voice example)
- [x] Three-part decomposition (event real / feeling real / the causal story is the interpretation); kept non-moralizing — explicitly "אינה קובעת מי צודק" and "אינו מחליט שאיש אינו אשם" (not victim-blaming, not letting-off, not coaching)
- [x] Voice: dry/precise/logical; no solution promised; none of the banned words; short paragraphs; straight quotes; no exclamation/emoji; fresh "what can be checked" lead-in ("אפשר להפריד שלושה דברים..."); avoided reusing the "זה גם מסביר" connector
- [x] `npm run build` passes clean; `/articles/why-i-blame-him` prerenders as static SSG (now 5 article pages)

### Four-Article Consistency Pass (✅ COMPLETED — June 19, 2026)
Reviewed all 4 articles as one system. Voice/roles/titles/descriptions/order/contradictions all checked; relationship article isn't advice; indecision isn't coaching. One small repetition fix.
- [x] Confirmed distinct openings, distinct "what can be checked" intros (4 variants, shared stance phrase), distinct titles/descriptions; registry order kept (flagship → mechanism def → existence example → relationship example, dependency-correct)
- [x] Kept intentional brand cadences as consistency features: "אינו מבטל את X... הוא רק רואה...", the "(ל)דוגמה:" label, the shared canonical בן הזוג example (used at two levels), the "מה אפשר לבדוק לוגית"/"סיכום" structural headings
- [x] Reduced one verbatim repetition: "ואינו מפסיק להרגיש" appeared in both fact-vs-story and why-we-fight (the two sharing the בן הזוג example). Trimmed it from why-we-fight's close → "אינו מבטל את הריב. הוא רק רואה במה הריב עוסק..." — de-duplicates and sharpens that close to the fight's subject; kept the clause in fact-vs-story where the not-suppression nuance is more central
- [x] No full rewrites, no new article, no registry/order change; `npm run build` passes clean (all routes static)

### Editorial Pass — למה אנחנו רבים (✅ COMPLETED — June 19, 2026)
Light copy-edit of `content/articles/why-we-fight.mdx` only. No structure/title/metadata/slug change; free status kept; no other files touched.
- [x] Audited against the checklist — already strong (dry, not relationship-advice, all four layers separated event/story/reaction/mechanism, escalation loop clear, dry non-promising close, no banned words)
- [x] One precision edit: "...לשנות אותו. היא לא משנה." → "...היא לא משנה אותו." — the bare "היא לא משנה" risked the idiom reading "לא משנה = doesn't matter" (the NeverMinde/השם לא משנה wordplay); adding the object disambiguates to "doesn't change it"
- [x] Title "למה אנחנו רבים", slug "why-we-fight", category "relationships", isPremium:false kept; no rewrite
- [x] `npm run build` passes clean; article stays static SSG

### Article — למה אנחנו רבים (✅ COMPLETED — June 19, 2026)
Wrote ONE real MDX article (backlog R1, first relationships piece). No layout/Tailwind/color/component changes, no new packages, no interactive components, no edits to existing MDX bodies.
- [x] Title evaluation: chose "למה אנחנו רבים" over "ריב אינו מתחיל מהאירוע" — exact research-attested audience phrase, clean flat question, and the alternative slightly overstates the angle (fights do start from the event, they grow from the interpretation)
- [x] Created `content/articles/why-we-fight.mdx` — Hebrew, RTL; metadata matches the existing pattern (title, slug "why-we-fight", category "relationships" → יחסים, isPremium:false, description)
- [x] Registered in `src/lib/content/articles.ts` via the static registry (import + entry, appended); now 4 articles, first relationships entry
- [x] Structure per brief: opening (what people call a fight) → what actually happened → the story added → why the story feels like the event → the repeating relationship mechanism (ties the "אני יודע שזה מוגזם אבל עדיין מגיב" pain) → what can be checked logically → dry summary; one pull-quote
- [x] Required concrete example included: raised voice → read as disrespect/not-listening/doesn't-care → fight grows around the interpretation, not the sound level (with an escalation loop = the article's value-add beyond fact-vs-story)
- [x] Voice: dry/precise/logical; no solution promised (close: "אינו מבטל את הריב ואינו מפסיק להרגיש"); none of the banned words; short paragraphs; straight quotes; no exclamation/emoji; distinct "what can be checked" lead-in; avoided reusing fact-vs-story's "תווית 'זו פרשנות'" image
- [x] `npm run build` passes clean; `/articles/why-we-fight` prerenders as static SSG (now 4 article pages)

### Three-Article Consistency Pass 2 (✅ COMPLETED — June 19, 2026)
Re-audited the 3 articles as a system. Confirmed Pass 1's fixes hold (de-meta'd thesis line; distinct "what can be checked" intros). One new outlier fixed.
- [x] Verified: same voice; distinct titles/descriptions; clear roles; logical registry order (fact-vs-story → mechanism → indecision); no contradictions; no banned words/hype/therapy/spiritual
- [x] Fixed an example-intro inconsistency missed in Pass 1: indecision used "ניקח אדם שמתלבט..." (the only first-person "let's" connector in the corpus) → "דוגמה: אדם שמתלבט..." — now matches the impersonal label convention used by the other two (לדוגמה:/דוגמה:) and removes the connector
- [x] Left clean items unchanged (fact-vs-story "לדוגמה:" vs mechanism "דוגמה:" — both fine; harmonizing the ל-prefix would be cosmetic churn); no full rewrites, no new article, no registry/order change
- [x] `npm run build` passes clean (all routes static)

### Three-Article Consistency Pass (✅ COMPLETED — June 19, 2026)
Reviewed the 3 articles as one content system. Voice/roles/titles/descriptions/registry-order/contradictions all checked — only two small repetition/meta fixes needed.
- [x] Voice consistent across all three (dry/logical, fact-story + mechanism frame, "מי ש... הוא רק רואה" close); roles distinct (flagship / foundational definition / specific example); titles + descriptions distinct; no contradictions
- [x] Registry order kept (fact-vs-story → what-is-a-mechanism → what-is-indecision) — correct dependency order: mechanism references fact/story, indecision references mechanism
- [x] Reduced repetition: the "what can be checked" intro was verbatim-identical in all three. Varied the lead-in in two while keeping the intentional stance phrase "בלי לפתור ובלי להמליץ" — mechanism → "יש כמה דברים שאפשר לבדוק..."; indecision → "אפשר לבדוק כמה נקודות..."
- [x] Removed the lone meta-sentence in fact-vs-story: "המאמר מפריד בין שני דברים..." → "ההפרדה היא בין שני דברים..." (the other two state their thesis without self-reference)
- [x] No full rewrites, no new article, no registry/order change; `npm run build` passes clean (all routes static)

### Editorial Pass — מהו מנגנון (✅ COMPLETED — June 19, 2026)
Audit-only of `content/articles/what-is-a-mechanism.mdx`. No file change — the article (rewritten the prior step) passed the full foundational checklist with no necessary edits.
- [x] Verified: sounds like NeverMinde; dry/logical/sharp/Hebrew-first; concept clear for a new reader; not abstract (concrete examples); no AI tells (the "פשוט" pattern was already avoided); no therapeutic/motivational/spiritual/hype/coaching; short paragraphs; strong opening; concrete examples; dry non-promising close
- [x] Confirmed all six required explanations present (start-from-emotion, what a mechanism is, emotion as visible result, mechanism vs story, examples across יחסים/קיום/זהות, what can be checked logically)
- [x] No banned words, no exclamation/emoji, straight quotes, grammar/agreements clean
- [x] Per "make only necessary edits / do not rewrite for the sake of rewriting": left unchanged. Title/slug/free status kept
- [x] `npm run build` re-run to confirm clean; all routes stay static

### Foundational Rewrite — מהו מנגנון (✅ COMPLETED — June 19, 2026)
Rewrote the existing `content/articles/what-is-a-mechanism.mdx` body into the foundational article. Slug/category kept; no other files' bodies touched; `articles.ts` unchanged (title flows from metadata).
- [x] Metadata: title "מהו מנגנון" kept; description rewritten to the angle ("רגש הוא התוצאה הגלויה. מנגנון הוא התבנית שמתחתיה. האתר מאורגן לפי מנגנונים, לא לפי רגשות."); slug "what-is-a-mechanism" + category "existence" + isPremium:false kept
- [x] Structure per brief: opening (why people start from emotion) → מהו מנגנון → why emotion is only the visible result → מנגנון מול סיפור (ties to fact/story) → three mechanisms as concrete examples (יחסים/קיום/זהות) → מה אפשר לבדוק לוגית → dry summary
- [x] Kept the strong assets: pull-quote ("הרגש הוא הסימפטום. המנגנון הוא המבנה שמייצר אותו שוב ושוב.") and the close ("זו אינה עבודה רגשית. זו עבודה לוגית.")
- [x] Voice: dry/precise/logical; no solution promised (close: "אינו מבטל את הרגש... רק רואה את המבנה"); checks section "בלי לפתור ובלי להמליץ"; none of the banned words; short paragraphs; straight quotes; no exclamation/emoji; avoided the "פשוט"-editorializing tell
- [x] `npm run build` passes clean; `/articles/what-is-a-mechanism` stays static SSG

### Editorial Pass — מחשבה אינה עובדה (✅ COMPLETED — June 19, 2026)
Light copy-edit of `content/articles/fact-vs-story.mdx` only. No structure/title/metadata/slug change; free status kept; no other files' bodies touched.
- [x] Audited against the NeverMinde flagship checklist — already strong (dry, concrete example, all five required explanations present, dry non-promising close, no banned words)
- [x] Two opening micro-edits only: "המשפט הזה מתאר בדיוק את הבלבול שהמאמר עוסק בו." → "זה בדיוק הבלבול." (removes a self-referential/meta clause); dropped the editorializing prefix "הבלבול הוא פשוט:" so the definition lands declarative (consistent with the "הסיבה פשוטה" removal in the indecision article)
- [x] Title "מחשבה אינה עובדה", slug "fact-vs-story", category "identity", isPremium:false all kept; no rewrite
- [x] `npm run build` passes clean; article stays static SSG

### Flagship Rewrite — מחשבה אינה עובדה (✅ COMPLETED — June 19, 2026)
Rewrote the existing `content/articles/fact-vs-story.mdx` body into the flagship article (backlog I1). Slug/category kept; no other files' bodies touched; `articles.ts` unchanged (title flows from metadata).
- [x] Metadata: title "עובדה מול סיפור" → "מחשבה אינה עובדה"; description rewritten to the thought-vs-fact framing; slug "fact-vs-story" + category "identity" (זהות) + isPremium:false kept
- [x] Opens on the audience pain ("אני יודע שזה לא הגיוני, אבל אני עדיין מגיב לזה" — the "אך מודע לכך" research insight); lead paragraph starts with a letter so the drop-cap renders cleanly
- [x] Structure per brief: opening confusion → מהי עובדה → מהו סיפור → למה הסיפור מרגיש כמו עובדה → איך הרגש נצמד לסיפור → מה אפשר לבדוק לוגית → dry summary; kept the canonical example (בן הזוג הרים את קולו / הוא לא מכבד אותי) that matches the homepage panels; one pull-quote
- [x] Voice: dry/precise/logical; no solution promised (close: "אינו מבטל את המחשבה ואינו מפסיק להרגיש"); none of the banned words; short paragraphs; straight quotes; no exclamation/emoji
- [x] `npm run build` passes clean; `/articles/fact-vs-story` stays static SSG

### Editorial Pass — מהי התלבטות (✅ COMPLETED — June 19, 2026)
Light copy-edit of `content/articles/what-is-indecision.mdx` only. No structure/title/metadata change, no other files' bodies touched.
- [x] Audited against the NeverMinde voice checklist — already strong (dry, concrete, all six required sections present, no solution promised, no banned words)
- [x] Two micro-edits only: "שלב טבעי שלפני החלטה" → "שלב טבעי לפני החלטה" (cleaner flow); removed the faintly-AI connective "הסיבה פשוטה:" so the line stays pure-declarative
- [x] Title kept ("מהי התלבטות" — no clearly better option); no rewrite
- [x] `npm run build` passes clean; article stays static SSG

### First Real Article — מהי התלבטות (✅ COMPLETED — June 19, 2026)
Wrote ONE real MDX article (backlog E1). No layout/Tailwind/color/component changes, no new packages, no interactive components, no edits to existing MDX bodies.
- [x] Created `content/articles/what-is-indecision.mdx` — Hebrew, RTL; metadata matches the existing pattern (title "מהי התלבטות", slug "what-is-indecision", category "existence" → קיום, isPremium: false, description)
- [x] Registered in `src/lib/content/articles.ts` via the existing static registry (import + entry); now 3 articles
- [x] Structure per brief: opening (what people call התלבטות) → what actually happens → עובדה מול סיפור → why more information doesn't solve it → the mechanism underneath → what can be checked logically → dry summary; one distilled pull-quote
- [x] Voice: dry/precise/logical; no solution promised (closing explicitly states identifying the pattern is NOT making the decision); none of the banned words (להשתחרר/לרפא/לשנות את החיים/למצוא את עצמך/להתחבר לעצמך/סוד/מסע); no exclamation/emoji; short paragraphs; straight quotes
- [x] `npm run build` passes clean; `/articles/what-is-indecision` prerenders as static SSG (now 3 article pages)

### Article Strategy + /articles Copy Refinement (✅ COMPLETED — June 19, 2026)
Strategy + one small copy edit. No new MDX, no MDX-body edits, no homepage/other-page edits, no layout/Tailwind/color changes.
- [x] Created `ARTICLE_BACKLOG.md` — 15 candidate articles organized by mechanism (יחסים ×4, קיום ×5, זהות ×6), each with working Hebrew title, audience phrase/pain, angle, Free/Members plan, and legacy-SEO mapping from the CLIENT_SOURCE 301 table
- [x] Included the new decision-paralysis idea (E1 "מהי התלבטות" — "לא מצליח להחליט / מתלבט שנה")
- [x] Flagship identified: I1 "מחשבה אינה עובדה" (built on the "אך מודע לכך" research insight); 6 candidates carry legacy SEO equity → migrate first; recommended writing order added (writing deferred)
- [x] `/articles` copy: hero, subhead, list, and CTAs kept (already strong). One refinement to the explanation text only — "הרגש הוא רק התוצאה הגלויה; ...שמייצר אותה" → "הרגש והדרמה הם רק התוצאה הגלויה; ...שמייצר אותם" (adds the structure-vs-drama distinction, consistent with the homepage pass)
- [x] `CONTENT_STRATEGY.md §5` updated to point at the backlog
- [x] `npm run build` passes clean; all routes stay static. No MDX articles written

### Audience-Language & Market Research — Update 2: Engine Run (✅ COMPLETED — June 19, 2026)
Research only — no copy implemented, no `src/`/MDX edits.
- [x] Python 3.12.13 now installed → the `last30days` engine RAN this time (v3.6.0, 23.6s, saved to ~/Documents/Last30Days/last30days-raw-v3.md)
- [x] Engine sources inspected: Reddit, HN, GitHub, Polymarket, web/grounding (subreddits: Israel, OCD, freewill, Anxiety); X/YouTube unavailable (no auth)
- [x] Honest result: for the Hebrew audience the engine returned only English noise — 6 Reddit threads (all entity-miss, score 0), HN errored on Hebrew, Web/GitHub/Polymarket 0. Class-5 (non-Latin) outcome as the skill predicts
- [x] Genuinely new dated signal kept: English r/freewill is debating רצון חופשי as logic (corroborates the dry angle); r/Anxiety is practical/coping
- [x] WebSearch supplements (skill Step 2) again supplied the real Hebrew signal; added decision-paralysis pain ("מתלבט שנה בין שתי אפשרויות"), 24/7 intrusive thoughts, "בן 40 לא מצליח לצאת מבית ההורים"
- [x] Updated all three reports (MARKET_RESEARCH_NOTES §0/§2.5, AUDIENCE_LANGUAGE_REPORT, COPY_PHRASE_BANK): comparison table, 3 new recurring phrases, 2 new headline angles (#11/#12 decision), 1 new CTA, refined recommendation
- [x] Research-ops note: "אליעד כהן" is now a polluted search anchor (news namesake) → use "שיטת EIP"/"השם לא משנה"
- [x] Verdict unchanged: for this Hebrew/non-Latin audience, WebSearch + Israeli forums beat the engine's keyless English-dominant sources
- [x] No build (no code changes)

### Audience-Language & Market Research (✅ COMPLETED — June 19, 2026)
Research only — no copy implemented, no `src/`/MDX edits.
- [x] Attempted the `last30days` engine; it could NOT run (requires Python 3.12+, none installed). Documented honestly rather than faked.
- [x] Substituted live `WebSearch` (9 Hebrew queries, 2 batches) over public forums/pages — real titles/snippets only (US-routed, not time-filtered, no thread-body/comment reading). Limits disclosed.
- [x] Created `MARKET_RESEARCH_NOTES.md` (method + traceable raw notes + real sources: doctors.co.il, infomed, betipulnet, camoni, fxp, hasolidit, eip.co.il)
- [x] Created `AUDIENCE_LANGUAGE_REPORT.md` (exact phrases, pains/questions/confusions, emotional language, avoid-words vs safe-words — all evidence-based)
- [x] Created `COPY_PHRASE_BANK.md` (20 recurring phrases, 10 homepage headline angles in NeverMinde voice, 10 dry CTAs, next-step recommendation)
- [x] Key strategic finding: the legacy source (Eliad Cohen / EIP) uses spiritual+hype+coaching register — NeverMinde's market gap is being the dry/logical version of the same topics
- [x] No build run (no code changes)

### Homepage Copywriting Pass (✅ COMPLETED — June 19, 2026)
Homepage copy only (`src/app/page.tsx`). No layout, Tailwind, color, spacing,
component, routing, or package changes. Strong copy kept as-is; only weak/unclear
lines sharpened. Three targeted edits:
- [x] Hero subhead: "ניתוח לוגי של המציאות. בלי דרמה, בלי מניפולציה רגשית. רק מה שקרה..." → "ניתוח לוגי של מנגנונים — לא טיפול, לא מוטיבציה, לא רוחניות. רק מה שקרה..." — now states what the site IS (logical analysis of mechanisms) and what it is NOT (therapy / motivation / spiritual), per brief #1; concrete fact/story closer kept
- [x] Hero secondary CTA honesty: "צפו בהרצאות" → "לעמוד ההרצאות" — videos are a placeholder (no player yet), so "watch" overpromised; now navigational like the other CTAs
- [x] Mechanisms intro body: "...הרגש הוא רק התוצאה הגלויה." → "...הרגש והדרמה הם רק התוצאה הגלויה. המנגנון הוא המבנה שמתחתם." — adds the structure-vs-drama distinction (brief #2) alongside mechanism-vs-emotion
- [x] Kept strong/already-honest sections: hero H1, mechanisms H2, articles preview (preserves כתב/קול parallel), video preview, Fact vs Story block, members teaser, final CTA
- [x] `npm run build` passes clean; all routes stay static

### Design Polish v2 — Premium Editorial Pass (✅ COMPLETED — June 19, 2026)
Elevated the whole site from clean draft to premium editorial (see DESIGN_DIRECTION.md §10).
No new packages, no new routes/articles, no MDX-internals changes, no fake functionality.
- [x] `globals.css`: extended palette (`--ink`, `--ink-raised`, `--paper`), soft shadow tokens, radius tokens, and reusable classes (`.band-dark` with restrained glow, `.band-paper`, `.card`, `.card-dark`, `.card-hover`, `.media-frame`, `.btn*`, `.link-arrow`, `.watermark`, `.accent-rule`); reduced-motion + smooth scroll + selection color
- [x] `design-tokens.ts`: documented the two supporting tones (ink, paper) alongside the locked brand four
- [x] Dark bands now use deep **ink** with a layered glow; light bands alternate background ↔ warm **paper** for rhythm
- [x] Cards/media gained modest radii + soft shadows + hover lift; hero portrait gained an offset accent frame; floating cards use `shadow-float`
- [x] `site-header.tsx`: sticky translucent blurred header; `site-footer.tsx`: premium dark ink footer with large wordmark
- [x] All routes restyled with the shared classes: /, /articles, /articles/[slug] (+ article-header/body), /mechanisms, /videos, /members
- [x] Buttons unified as rounded `.btn` variants; focus-visible + ≥44px tap targets preserved; Hebrew RTL right-aligned throughout
- [x] `npm run build` passes clean; all 10 routes stay static / fast

### Design Polish v3 — Craft Refinements (✅ COMPLETED — June 19, 2026)
Premium-through-craft pass, CSS-only, mostly in globals.css (see DESIGN_DIRECTION.md §10.6).
No new packages, routes, articles, MDX changes, or fake functionality.
- [x] `globals.css`: typographic craft (`text-wrap: balance`/`pretty`, tighter display tracking, kerning/ligatures); film-grain `.band-dark::after`; animated `.link-arrow` underline; refined `.btn`/`.btn-primary` (soft red lift shadow, larger target); CSS scroll-reveal gated by `@supports` + `prefers-reduced-motion`
- [x] `site-header.tsx`: stronger blur with opaque `supports-[backdrop-filter]` fallback
- [x] `page.tsx`: hero scales to `xl:text-7xl` + dry "three mechanisms" meta strip under the CTAs
- [x] Cascades to all routes via shared classes; Hebrew RTL right-aligned; `npm run build` passes clean (all 10 routes static)

### Design Polish v4 — Article Craft (✅ COMPLETED — June 19, 2026)
Editorial reading-page craft. (The generative SVG graphics first added in this pass
were REVERTED at the client's request — the hero and media slots are real-image
placeholders awaiting a photo of Yakir, not graphics.)
- [x] `article-body.tsx`: editorial drop cap on the lead paragraph (RTL start) + pull-quote styling (red inline-start rule)
- [x] Added one distilled pull-quote to each sample article (content drawn from the article itself — no invented/fake content)
- [x] REVERTED per feedback: removed `brand-art.tsx` and restored the prior media placeholders — homepage hero (image placeholder), article-card thumbnails, and all video frames (plain play ring)
- [x] `.nm-draw` keyframes left dormant in globals.css (unused, harmless)
- [x] `npm run build` passes clean; all 10 routes stay static / fast

### Visual Direction Rollout — /videos (✅ COMPLETED — June 19, 2026)
Applied the editorial direction (DESIGN_DIRECTION.md §7) to the videos page.
No new packages, no embeds, no player, no MDX changes.
- [x] `src/app/videos/page.tsx` rebuilt: dark hero with a large CSS media-frame placeholder (play glyph + overlapping caption card) → light category cards → dark philosophy band → designed CTA
- [x] Hero explains videos are the same mechanisms in spoken form; states it is a placeholder (no real player)
- [x] Four static category cards with mini CSS media frames: שיחות, הרצאות, מנגנונים, שאלות נפוצות (each tagged "בקרוב")
- [x] Philosophy band: video is not entertainment, it is another way to observe structure, and the articles remain the source of the framework
- [x] CTA back to both `/articles` and `/members`
- [x] Asymmetric desktop / stacked mobile; oversized low-contrast watermarks; hairline borders; tokens only; no shadows/gradients/external icons/fonts; Hebrew RTL right-aligned
- [x] Play glyphs and frames are pure CSS — no external embeds, no packages, no fake functionality; `npm run build` passes clean (/videos stays static)

### Visual Direction Rollout — /mechanisms (✅ COMPLETED — June 19, 2026)
Applied the editorial direction (DESIGN_DIRECTION.md §7) to the mechanisms page.
No new packages, no MDX changes, no per-category routes (honest CTAs to /articles).
- [x] `src/app/mechanisms/page.tsx` rebuilt: dark asymmetric hero (index panel + "מנגנונים" watermark) → light concept band → three mechanism bands → designed bottom CTA
- [x] Concept stated: the site is organized by mechanisms, not emotions
- [x] Three mechanism bands (יחסים · קיום · זהות) alternate dark/light; each has an index number, short explanation, a "שאלות לדוגמה" panel, and a dry red CTA → `/articles`
- [x] Asymmetric `lg:grid-cols-12` desktop / stacked mobile; oversized low-contrast watermark words; hairline borders
- [x] Hebrew, RTL, right-aligned, mobile-first; tokens only; no shadows/gradients/external icons/fonts; hover = color-only
- [x] `npm run build` passes clean (/mechanisms stays static)

### Visual Direction Rollout — /articles/[slug] (✅ COMPLETED — June 19, 2026)
Applied the editorial direction (DESIGN_DIRECTION.md §7) to the article detail page.
No new packages; existing MDX helpers reused; MDX files and mdx-components untouched.
- [x] `src/components/content/article-header.tsx` — dark editorial title strip (breadcrumb, category eyebrow, large title, description; text-only premium label when relevant)
- [x] `src/components/content/article-body.tsx` — reading container that styles rendered MDX via Tailwind child selectors (headings, paragraphs, RTL lists, hr); hides the duplicate `# title` h1
- [x] `src/app/articles/[slug]/page.tsx` rebuilt: dark hero band → clean `max-w-prose` light reading body → designed bottom CTA back to `/articles`
- [x] Dormant text-only members teaser renders only for `isPremium` articles — metadata display, **no gate, no content hidden** (no premium articles exist yet)
- [x] Hebrew, RTL, right-aligned, mobile-first; tokens only; hairline borders; no shadows/gradients/external icons/fonts
- [x] `generateStaticParams` + `dynamicParams = false` preserved; `npm run build` passes clean (both articles stay static SSG)

### Homepage Visual Refinement (✅ COMPLETED — June 19, 2026)
Rebuilt `src/app/page.tsx` to resemble the reference's editorial rhythm while
staying within the locked rules. No new packages, MDX internals untouched.
- [x] Asymmetric two-column hero: headline + CTAs (right) / portrait placeholder card (left) / overlapping off-white info card
- [x] Oversized low-contrast watermark words ("NeverMinde", "הרצאות", "עובדה", "חברים") clipped by `overflow-hidden`
- [x] Mechanisms: designed staggered card row with 01/02/03 index numbers and hairline borders
- [x] Articles preview: staggered editorial cards with geometric thumbnail placeholders (real data via `getAllArticles`)
- [x] Video: large media block with play glyph + overlapping caption card (no player, no packages)
- [x] Fact vs Story: two large contrasted panels (Fact = solid dark, Story = faded muted/strikethrough)
- [x] Members: premium-style dark CTA area with a locked-content hairline-bar placeholder (no gating logic)
- [x] Final CTA: intentional block with red accent rule + oversized headline + edge-aligned CTA
- [x] Layout depth from borders + overlap only — no shadows, no gradients, tokens only; Hebrew RTL, right-aligned, mobile-first
- [x] DESIGN_DIRECTION.md §7 updated with the refinement techniques; `npm run build` passes clean (/ stays static)

### Goals
- Integrate MDX for article rendering
- Set up content file structure
- Implement markdown → React rendering
- Build article metadata system (Frontmatter)

### Deliverables
1. **MDX Setup**
   - Install `next-mdx-remote` or `@next/mdx`
   - Configure MDX to work with App Router
   - Set up MDX plugin for syntax highlighting
2. **Content Directory Structure**
   ```
   /content
   ├── /relationships
   │   ├── blaming-the-other.mdx
   │   ├── why-we-fight.mdx
   │   └── ...
   ├── /existence
   │   ├── quit-smoking.mdx
   │   └── ...
   └── /identity
       ├── reality.mdx
       └── ...
   ```
3. **Frontmatter Schema**
   - TypeScript interface for metadata
   - Validation on build time
   - Categories: "relationships" | "existence" | "identity"
   - Fields: `title`, `category`, `slug`, `isPremium`, `lastUpdated`
4. **Article Rendering**
   - Read MDX file based on route params
   - Parse Frontmatter
   - Render with syntax highlighting
   - Display title, date, category badge
5. **Dynamic Sitemap**
   - `app/sitemap.ts` scans `/content` directory
   - Generates sitemap entries with `lastmod` from Frontmatter
   - Submits to Google Search Console
6. **First Content Article**
   - Migrate 1–2 articles from old site
   - Test Frontmatter parsing
   - Verify rendering with `<FactVsStory />` component

### Definition of Done
- [ ] MDX files render correctly
- [ ] Frontmatter validates
- [ ] Article pages display with proper formatting
- [ ] `<FactVsStory />` component works in MDX context
- [ ] Sitemap generated correctly
- [ ] Lighthouse score 90+ (with minimal content)
- [ ] No console errors

### Tasks
- [ ] Install MDX dependencies
- [ ] Create Frontmatter TypeScript interface
- [ ] Write MDX file loader utility
- [ ] Create `/content` directory with sample articles
- [ ] Build article rendering page component
- [ ] Implement syntax highlighting
- [ ] Connect dynamic routes to MDX loader
- [ ] Test sitemap generation
- [ ] Migrate first 5 articles

---

## PHASE 6: Video Integration & Lite-YouTube

### Goals
- Integrate YouTube videos with optimized loading
- Use `@next/third-parties` for lite-youtube-embed
- Implement video embedding in MDX
- Test performance impact

### Deliverables
1. **Lite-YouTube Setup**
   - Install `@next/third-parties/google`
   - Create `<VideoEmbed />` wrapper component
   - Configure lazy loading on click
2. **Video Component**
   - Accept YouTube video ID
   - Render thumbnail only (no iframe until click)
   - Auto-play on click
   - Optional title/caption
3. **MDX Video Integration**
   - Embed videos inline in `.mdx` files
   - Example: `<VideoEmbed youtubeId="dQw4w9WgXcQ" />`
4. **Premium Video Storage**
   - Unlisted YouTube videos for premium content
   - Reference in MDX (video ID stored securely)
   - Conditional rendering in `<PremiumGate />` (Phase 9)
5. **Performance Testing**
   - Measure page load time with video
   - Verify image-only loading (no iframe bloat)
   - Confirm Lighthouse score stays 90+
6. **Video Article Example**
   - Migrate 1–2 video-heavy articles
   - Test mixed text + video layout

### Definition of Done
- [ ] Video embeds load thumbnails only
- [ ] Click triggers iframe injection
- [ ] No layout shift on video load
- [ ] Video articles render correctly
- [ ] Lighthouse stays 90+
- [ ] Mobile video playback works

### Tasks
- [ ] Wrap `@next/third-parties` YouTubeEmbed
- [ ] Create `<VideoEmbed />` component
- [ ] Test video loading performance
- [ ] Create sample article with embedded video
- [ ] Verify mobile video playback
- [ ] Implement fallback for old browsers

---

## PHASE 7: SEO & Search Engine Optimization

### Goals
- Implement Schema.org structured data
- Build dynamic robots.txt
- Optimize metadata for search engines
- Prepare for Generative Engine Optimization (GEO)

### Deliverables
1. **Dynamic Sitemap**
   - `app/sitemap.ts` with dynamic routes
   - Updated on every build
   - Submit to Google Search Console
2. **Robots.txt**
   - `app/robots.ts` with crawl directives
   - Allow public content, disallow private
   - Point to sitemap
3. **Schema.org Structured Data**
   - Article schema (author, datePublished, headline)
   - Person schema (Yakir Cohen, author)
   - FAQ schema (collected from articles)
   - JSON-LD injection in `<head>`
4. **Meta Tags**
   - Dynamic `<title>` per page
   - Dynamic `<meta name="description">`
   - `og:image`, `og:title`, `og:description`
   - Twitter Card tags
5. **Open Graph Image Generation**
   - `@vercel/og` for dynamic OG images
   - API route: `app/api/og?title=...&category=...`
   - Generate image with fact vs story text
   - Cache and serve from CDN
6. **301 Redirects**
   - Map old URLs → new URLs in `next.config.ts`
   - All old article links redirect to new structure
   - Preserve domain authority
7. **Google Search Console Setup**
   - Verify domain ownership
   - Submit sitemap
   - Monitor crawl errors
   - Request re-indexing

### Definition of Done
- [ ] Sitemap includes all articles
- [ ] Schema.org validation passes (schema.org validator)
- [ ] OG images generate and render correctly
- [ ] 301 redirects work for sample URLs
- [ ] Google Search Console sees sitemap
- [ ] No crawl errors
- [ ] Lighthouse stays 90+

### Tasks
- [ ] Implement dynamic sitemap generation
- [ ] Write robots.ts
- [ ] Create schema.org JSON-LD templates
- [ ] Build OG image API route
- [ ] Map all old → new URLs
- [ ] Add to next.config.ts redirects
- [ ] Test all 301 redirects
- [ ] Submit to Google Search Console

---

## PHASE 8: Progressive Web App (PWA) & Serwist

### Goals
- Convert site to installable PWA
- Implement Service Worker with offline support
- Enable offline article reading
- Create installable app icon

### Deliverables
1. **Serwist Configuration**
   - `next.config.ts` wrapped with `withSerwist`
   - `app/sw.ts` with caching strategies
2. **Service Worker Strategies**
   - `StaleWhileRevalidate`: Static content (articles, fonts, images)
   - `NetworkFirst`: Main navigation pages
   - `NetworkOnly`: Auth, payment flows
   - `Fallback`: Offline page at `/~offline`
3. **Manifest File**
   - `app/manifest.ts` (TypeScript manifest)
   - Icons: 192x192, 512x512 (SVG or PNG)
   - App name, short name, colors
   - Start URL, display mode (standalone)
4. **Offline Page**
   - `/~offline.tsx` - Simple page explaining no connection
   - Cached and served when network unavailable
5. **Installation Flow**
   - Add to home screen (iOS)
   - Install app prompt (Android)
   - Full-screen app experience
   - Status bar hiding
6. **Testing**
   - Install on iOS simulator/device
   - Install on Android simulator/device
   - Test offline reading
   - Test offline → online transition

### Definition of Done
- [ ] Service Worker installs without errors
- [ ] Site installable on iOS (add to home screen)
- [ ] Site installable on Android (install prompt)
- [ ] Offline mode works (cached articles readable)
- [ ] Cache size < 50MB
- [ ] Lighthouse PWA score 90+
- [ ] DevTools shows service worker registered

### Tasks
- [ ] Install and configure Serwist
- [ ] Create `app/sw.ts` with caching strategies
- [ ] Create `app/manifest.ts`
- [ ] Design and add app icons
- [ ] Build offline page
- [ ] Test PWA installation (iOS)
- [ ] Test PWA installation (Android)
- [ ] Verify offline functionality

---

## PHASE 9: Premium Content & Authentication

### Goals
- Implement email-based authentication (magic links)
- Build premium content gating
- Set up user database (minimal)
- Integrate with Resend for email

### Deliverables
1. **Authentication System (Better_Auth)**
   - Set up Better_Auth with email provider
   - Magic link flow (no password)
   - Session management with HTTP-only cookies
   - User model in database (minimal: id, email, isPremium)
2. **Premium Gate Component**
   - Check `isPremium` in Frontmatter
   - If user not authenticated: show preview + login button
   - If authenticated but not premium: show preview + upsell
   - If authenticated + premium: show full content
3. **Login Flow**
   - User enters email
   - Resend sends magic link
   - Link expires in 24 hours
   - Click link → authenticated session
   - Redirect to article
4. **Resend Integration**
   - `RESEND_API_KEY` in environment variables
   - Email template for magic link (react-email)
   - Send from no-reply@yourdomain.com
5. **User Database**
   - Minimal SQLite or Postgres setup
   - Fields: id, email, isPremium, createdAt
   - No password hashing needed (magic links only)
6. **Premium Content Identifier**
   - Frontmatter `isPremium: true` marks content
   - Build-time detection and gating
   - Server-side checking of auth status

### Definition of Done
- [ ] User can send magic link to email
- [ ] Email arrives in < 2 minutes
- [ ] Clicking link logs user in
- [ ] Session persists across page refreshes
- [ ] Premium articles hidden for non-premium users
- [ ] Premium articles visible for authenticated premium users
- [ ] Logout works
- [ ] No console errors

### Tasks
- [ ] Set up Better_Auth with Resend
- [ ] Create user database schema
- [ ] Build login/magic link page
- [ ] Create magic link email template
- [ ] Build `<PremiumGate />` component logic
- [ ] Test magic link flow end-to-end
- [ ] Test premium content gating
- [ ] Verify email delivery

---

## PHASE 10: Email & Newsletter Integration

### Goals
- Set up newsletter signup
- Integrate Resend for email delivery
- Build email templates (react-email)
- Create contact/inquiry form

### Deliverables
1. **Newsletter Signup**
   - Email input field on home page (or sidebar)
   - `<form>` → Server Action
   - Validation and sanitization
   - Confirmation email via Resend
2. **Server Action Email**
   - Create `app/actions/newsletter.ts`
   - `'use server'` directive
   - Validate email format
   - Store in subscribers table
   - Send confirmation email
3. **Email Templates (react-email)**
   - Newsletter welcome email
   - Contact form confirmation
   - All templates use design tokens (off-white, black, red)
4. **Contact Form**
   - Name, email, message fields
   - Server Action validation
   - Send to Yakir's email via Resend
   - User gets confirmation email
   - Admin gets notification email
5. **Unsubscribe Link**
   - All marketing emails include unsubscribe
   - One-click unsubscribe
   - Remove from subscribers table
6. **Email Analytics (Optional)**
   - Resend dashboard for open rates
   - Click tracking on links
   - Basic reporting

### Definition of Done
- [ ] Newsletter signup form works
- [ ] Confirmation email sent within 2 seconds
- [ ] Contact form submits without errors
- [ ] Emails have correct design tokens (no external images)
- [ ] Unsubscribe works
- [ ] No spam folder issues (test with real email)
- [ ] Rate limiting prevents abuse

### Tasks
- [ ] Create Server Actions for email flows
- [ ] Build newsletter signup component
- [ ] Build contact form component
- [ ] Design email templates in react-email
- [ ] Test email delivery
- [ ] Implement unsubscribe handler
- [ ] Add rate limiting to forms

---

## PHASE 11: Testing, Hardening & Production Deployment

### Goals
- Comprehensive testing (unit, E2E, performance)
- Security hardening
- Performance optimization
- Production deployment checklist

### Deliverables
1. **Unit Tests**
   - Test `<FactVsStory />` component rendering
   - Test `<PremiumGate />` logic
   - Test Server Actions (email validation, auth)
   - Test utility functions
   - Use Jest + React Testing Library
2. **E2E Tests**
   - User flow: Visit → Read Article → Hit Premium Gate → Login → Access Premium
   - Newsletter signup flow
   - Contact form submission
   - Offline reading (PWA)
   - Use Playwright or Cypress
3. **Performance Audits**
   - Lighthouse audit (all pages, must be 95+)
   - Performance budget enforcement (< 100KB per page gzipped)
   - Core Web Vitals monitoring
   - Image optimization check
4. **Security Hardening**
   - CORS headers configured
   - CSP (Content Security Policy) enabled
   - CSRF tokens in forms
   - Input sanitization verified
   - Environment variables checked (no secrets in code)
   - Dependency vulnerability scan
5. **Mobile Testing**
   - iOS PWA installation + offline
   - Android PWA installation + offline
   - Touch interactions (buttons, forms)
   - Viewport responsiveness
6. **RTL Testing**
   - Hebrew text direction correct
   - Buttons and inputs aligned properly
   - Icons mirrored if directional
   - Form labels aligned correctly
7. **Browser Compatibility**
   - Chrome/Chromium latest
   - Firefox latest
   - Safari latest (iOS + macOS)
   - Edge latest
8. **Content Verification**
   - All articles migrated and checked
   - All old URLs redirected
   - Images optimized and loaded
   - Videos play correctly
   - Premium gates working
9. **Monitoring Setup**
   - Vercel Analytics enabled
   - Error tracking (Sentry or similar) optional
   - Email delivery monitoring
   - Database backups scheduled
10. **Production Checklist**
    - Domain connected
    - DNS configured
    - SSL certificate installed
    - Environment variables set on Vercel
    - Database backups enabled
    - Error logging configured
    - Email service tested
    - Cache headers optimized

### Definition of Done
- [ ] Unit test coverage 80%+
- [ ] E2E tests all major flows
- [ ] Lighthouse 95+ on all pages
- [ ] No critical security vulnerabilities
- [ ] Mobile responsiveness verified
- [ ] RTL content perfect
- [ ] PWA works offline
- [ ] All tests passing in CI/CD
- [ ] Production deployment successful
- [ ] Monitoring and alerts active

### Tasks
- [ ] Set up Jest and React Testing Library
- [ ] Write component tests
- [ ] Write Server Action tests
- [ ] Set up Playwright for E2E tests
- [ ] Write major user flow tests
- [ ] Run Lighthouse audit on all pages
- [ ] Conduct security review
- [ ] Test mobile PWA installation
- [ ] Test RTL rendering thoroughly
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Run final production checklist
- [ ] Deploy to production
- [ ] Monitor for 1 week post-launch

---

## Cross-Phase Considerations

### Continuous Tasks (All Phases)
- Keep Lighthouse score 90+
- Run TypeScript checks (`tsc --noEmit`)
- ESLint compliance
- Document as you go
- Commit frequently with clear messages

### Phase Gate Reviews
After each phase, review:
1. All deliverables completed?
2. Definition of Done checklist passed?
3. No regressions in Lighthouse?
4. No console errors?
5. Ready to merge and deploy?

### Content Migration Timeline
- Phase 1: Content audit and mapping
- Phase 5: Migrate first 5–10 articles
- Phase 7: Migrate remaining articles (40–50)
- Phase 11: Final content review

---

## Summary

| Phase | Name | Duration | Key Output |
|-------|------|----------|-----------|
| 1 | Planning | 2 days | Docs + setup |
| 2 | Next.js Base | 3 days | Deployed skeleton |
| 3 | Design System | 4 days | Reusable components |
| 4 | Page Structure | 5 days | Routing + navigation |
| 5 | MDX System | 6 days | Articles rendering |
| 6 | Video Support | 3 days | YouTube embeds |
| 7 | SEO | 4 days | Sitemap + schema |
| 8 | PWA | 5 days | Installable app |
| 9 | Premium/Auth | 4 days | Email login + gating |
| 10 | Email/Newsletter | 3 days | Resend integration |
| 11 | Testing + Deploy | 5 days | Production launch |

**Total: ~44 days of focused development**

---

## Next Step

Once Phase 1 planning is approved, begin Phase 2 by running:
```bash
npx create-next-app@latest neverminde --typescript --tailwind --eslint
cd neverminde
npm run dev
```

See Phase 2 tasks above for the full setup checklist.
