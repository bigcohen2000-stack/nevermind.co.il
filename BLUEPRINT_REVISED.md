# BLUEPRINT_REVISED.md
## NeverMinde by Yakir Cohen - Technical & Philosophical Architecture

**Last Updated:** June 18, 2026  
**Status:** Planning Phase

---

## 1. Executive Summary

NeverMinde is a minimalist knowledge platform dedicated to logical analysis and objective reality inquiry, rejecting psychological manipulation and sensory drama. The platform rebuilds the existing NeverMind website on Next.js with PWA capabilities, implementing a "zero drama" design philosophy, RTL support for Hebrew content, and a staged development approach.

**Core Principle:** Facts vs. Story—separating objective reality from subjective interpretation.

---

## 2. Design Philosophy & UX Foundation

### 2.1 Minimalism as Engineering Principle

Minimalism is not an aesthetic preference but a **core engineering decision** to:
- Eliminate cognitive noise
- Prevent user manipulation through emotional triggers
- Honor user time and bandwidth
- Create space for pure logical analysis

**Hard Rules:**
- No shadows, gradients, or unnecessary borders
- No dramatic language or manipulative CTAs
- No heavy animations or visual drama
- No external fonts or bloat
- Fast loading = respect for user

### 2.2 Color Token System (Design Tokens)

| Purpose | Hex | Role | Usage |
|---------|-----|------|-------|
| **Background** | `#FAFAF8` | Off-white, calm, reduces eye fatigue | Page backgrounds, cards |
| **Primary Text** | `#1A1A1A` | Deep black, maximum contrast, authority | Body text, facts |
| **Action/Alert** | `#D42B2B` | Red accent, used sparingly | Buttons, critical links, premium gates |
| **Muted/Interpretation** | `#9CA3AF` | Gray, represents "story" layer | Strikethrough text, secondary info |

**Semantic Subtlety:**
- **Relationships mechanism** (identity/family/communication) → `bg-red-50` (light red background)
- **Existence mechanism** (survival/money/pressure) → `#D42B2B` (action red for energy)
- **Identity mechanism** (ego/self/reality as illusion) → `bg-stone-100` (deep stone gray)

### 2.3 Typography & Micro-Copy Rules

**Strict Punctuation Standards:**
- Only periods, commas, straight quotes allowed
- No exclamation marks, no emojis, no hype language
- Button text must be precise and dry

**Examples:**
- ✅ "Full mechanism breakdown available in members area. Requires payment."
- ❌ "Unlock the secret NOW! Click to change your life!"

---

## 3. Technical Architecture

### 3.1 Framework & Stack

- **Frontend:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + design tokens
- **Content:** MDX (Markdown + React components)
- **Database:** Git-based (version control as source of truth)
- **Deployment:** Vercel (Edge Functions, CDN)
- **PWA:** Serwist (Service Worker)
- **Email:** Resend + react-email
- **Auth:** Better_Auth + Resend (magic links)

### 3.2 Content Architecture: Three Mechanisms

All content organizes around **three psychological mechanisms** (not emotions):

1. **Relationships** - Topics: family, communication, blame, conflict resolution
2. **Existence** - Topics: survival, money, pressure, work, health habits
3. **Identity** - Topics: ego, free will, reality as illusion, consciousness

**Frontmatter Structure (Required for all MDX):**
```yaml
---
title: "Fact title here"
category: "relationships" | "existence" | "identity"
slug: "/topics/relationships/specific-topic"
isPremium: false | true
lastUpdated: "2026-06-18"
---
```

### 3.3 Core Component: `<FactVsStory />`

This component translates the core analytical method into code:

```tsx
<FactVsStory 
  fact="Objective event: Your partner raised their voice."
  story="Your interpretation: They don't respect me."
/>
```

**Visual Implementation:**
- **Fact:** Regular font, pure black (`#1A1A1A`), bold anchors in reality
- **Story:** Gray text (`text-gray-400`), strikethrough, visual negation

**Purpose:** Train readers to separate reality from narrative through repetition.

### 3.4 Performance Targets

- **Lighthouse Score:** 95+ (all categories)
- **First Contentful Paint (FCP):** < 1.2s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.2s

**Method:** Static Site Generation (SSG) + Edge caching + zero external dependencies.

---

## 4. Content Delivery Strategy

### 4.1 MDX System

- **All articles stored in `/content` as `.mdx` files** (version controlled)
- No database required—Git is the CMS
- Zero external CMS vulnerabilities
- Inline React components for interactivity (`<FactVsStory />`, `<Premium Gate />`)

### 4.2 Static Site Generation (SSG)

- **Build time:** All MDX files compiled to HTML at deploy
- **Deployment:** Static HTML served from Vercel CDN
- **User request:** Returns complete HTML in < 50ms globally
- **Zero database calls** for content delivery

### 4.3 Premium Content Gating

**Premium Gate Component (`<PremiumGate />`):**
- Show summary + first paragraphs to all users
- Hard cutoff: "This content requires membership. Access in members area."
- Single red button linking to login
- No modal dialogs, no popup interruptions

**Video Premium Content:**
- Store unlisted YouTube videos
- Server-side render video URL only for authenticated users
- No video source leaks to unauthorized users

---

## 5. Video Strategy

### 5.1 Lightweight Video Embedding

- **Framework:** `@next/third-parties/google` (Vercel's official lite-youtube-embed)
- **Method:** Load only thumbnail + play button initially
- **On Click:** Inject full iframe and auto-play video
- **Benefit:** Saves ~400KB per video on initial page load

### 5.2 Video Management

- Store on YouTube (unlisted for premium content)
- Reference via YouTube IDs in MDX
- Premium videos embedded within `<PremiumGate />`
- Content served via Server Actions (auth required)

---

## 6. Progressive Web App (PWA)

### 6.1 Serwist Service Worker

**Three Configuration Layers:**

1. **Server Config** (`next.config.ts`):
   - Wrap config with `withSerwist` 
   - Enable Service Worker generation

2. **Service Worker Logic** (`app/sw.ts`):
   - `StaleWhileRevalidate`: Static content (MDX, fonts, images)
   - `NetworkFirst`: Main navigation + categories
   - `NetworkOnly`: Auth operations, payments
   - `Fallback`: Offline page (`/~offline`)

3. **Manifest** (`app/manifest.ts`):
   - Define app icons (192x192, 512x512)
   - Standalone mode (full-screen app experience)
   - Theme colors: `#FAFAF8` background, `#1A1A1A` text

### 6.2 Offline Support

- Users can read cached articles without internet
- Offline fallback page explains connection status
- No confusing browser error pages
- Real-time sync when connection returns

---

## 7. SEO & Search Engine Optimization

### 7.1 Dynamic Sitemap Generation

**File:** `app/sitemap.ts`

- Scans all MDX files at build time
- Generates current `lastmod` dates
- Creates sitemap XML dynamically
- Submits to Google Search Console, Bing

### 7.2 Robots & Crawl Directives

**File:** `app/robots.ts`

- Allow crawling of public content
- Disallow premium content (via `<PremiumGate />` detection)
- Point to sitemap location

### 7.3 Schema.org Structured Data

**Injected as JSON-LD:**

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article title",
  "author": {"@type": "Person", "name": "Yakir Cohen"},
  "datePublished": "2026-06-18",
  "articleBody": "..."
}
```

**Use Cases:**
- Teaches search engines article structure
- Enables rich snippets in search results
- Prepares for Generative Engine Optimization (GEO)
- Paywall schema for premium content detection

### 7.4 301 Redirect Strategy

**Old → New URL Mapping** via `next.config.ts`:

| Old URL | New URL | Mechanism |
|---------|---------|-----------|
| `/articles/when-you-blame-the-other-side/` | `/topics/relationships/blaming-the-other` | Relationships |
| `/articles/quit-smoking-logical-analysis/` | `/topics/existence/quit-smoking` | Existence |
| `/articles/reality-is-a-dream/` | `/topics/identity/reality` | Identity |

**Benefit:** Preserves domain authority, maintains backlinks, prevents 404 errors.

---

## 8. Social Media & OG Tags

### 8.1 Open Graph Protocol

When user shares article link on social media:

- **Dynamic OG Image Generation** using `@vercel/og`
- **Image Elements:**
  - Background: Semantic category color
  - Center: AI-generated minimalist image matching article
  - Text: Fact vs Story excerpt (fact bold black, story gray strikethrough)

### 8.2 Organic Viral Strategy

**Philosophy:** Logic attracts curiosity, not manipulation.

- **Hook:** Clear "Fact vs Story" visual
- **Result:** Intellectual curiosity drives clicks (not FOMO or drama)
- **Experience:** Ultra-fast load (< 1s) + pure content
- **Follow-up:** User lands directly in analytical system

---

## 9. AI Image Generation (Brief)

### 9.1 Minimalist AI Art

- **Tools:** Midjourney, DALL-E (with specific hex codes in prompts)
- **Requirements:**
  - No human faces or emotional expressions
  - Metaphorical, geometric, vector representations
  - Use exact hex colors: `#FAFAF8`, `#1A1A1A`, `#D42B2B`
  - Low saturation, high contrast
  - Store as WebP or AVIF

### 9.2 Image Delivery

- Use Next.js `<Image />` component
- Automatic format conversion (WebP/AVIF)
- Lazy loading with proper height/width
- Zero Cumulative Layout Shift

---

## 10. Server Actions & Email Integration

### 10.1 Next.js Server Actions

**Pattern:**
```tsx
// app/actions.ts
'use server'

export async function subscribeNewsletter(email: string) {
  // Validate, sanitize, send via Resend
  // No API routes exposed
  // API key stays on server only
}
```

**Benefits:**
- No exposed API endpoints
- Credentials never reach browser
- CSRF protection built-in
- Direct server-side email handling

### 10.2 Email with Resend + react-email

- **Template Language:** React components
- **Styling:** Tailwind CSS (same design tokens as website)
- **Colors:** Off-white bg, black text, red actions
- **Content:** Pure, no marketing language

**Example Email Template:**
```
To: user@example.com
Subject: Verify Your Account

Your verification link is below. Link expires in 24 hours.

[BUTTON: Verify Email]

If you did not request this, ignore this email.
```

### 10.3 Auth Flow

- **Magic Links:** Email-only auth via Better_Auth + Resend
- **Premium Access:** Verify email → unlock `isPremium: true` content
- **Session Storage:** Secure HTTP-only cookies (no localStorage for sensitive data)

---

## 11. RTL Support (Hebrew Content)

### 11.1 HTML Direction

```html
<html lang="he" dir="rtl">
```

### 11.2 CSS Considerations

- Tailwind RTL variant support (built-in)
- `text-right` / `text-left` → automatic swap
- Margin/padding directions: use logical properties
- Icons and images: mirror if directional

### 11.3 Typography

- Load local Hebrew fonts (no Google Fonts)
- Right-aligned text by default
- Proper bidi punctuation handling
- RTL form inputs and buttons

---

## 12. Staged Development Philosophy

**Why Phasing Matters:**
- Prevents feature creep
- Allows testing and refinement
- Maintains velocity
- Enables early feedback

**Core Rule:** Each phase must deliver a working, deployable system. No partial implementations.

**Phase Gates:**
- Phase 1–4: Essential site foundation
- Phase 5–7: Content + SEO power
- Phase 8–10: Premium features (if revenue required)
- Phase 11: Testing + production hardening

See **TASKS.md** for detailed phase breakdown.

---

## 13. Hosting & Deployment

- **Platform:** Vercel
- **Regions:** Global CDN (auto-optimize)
- **Environment:** Edge Functions for server actions
- **Monitoring:** Vercel Analytics + error tracking
- **Domain:** Custom (determined separately)
- **SSL:** Automatic (included)

---

## 14. Testing Strategy (Phase 11)

- **Unit Tests:** React components (`<FactVsStory />`, `<PremiumGate />`)
- **E2E Tests:** User flows (read article → premium gate → login → verify)
- **Lighthouse Audits:** Every commit
- **Mobile Testing:** iOS/Android PWA installation
- **RTL Testing:** Hebrew content layout + bidi
- **Performance Budget:** Pages must stay < 100KB gzipped

---

## 15. Security & Privacy

- **No analytics trackers** (no Google Analytics, no Hotjar)
- **No user profiling** 
- **HTTPS only**
- **Content Security Policy (CSP)** for XSS prevention
- **Password hash:** bcrypt (if traditional auth added later)
- **GDPR/Privacy:** Transparent data handling

---

## 16. Key Decisions (See DECISIONS.md)

1. Why Serwist over next-pwa?
2. Why git-based content over headless CMS?
3. Why magical links instead of password auth for Phase 1?
4. Why 301 redirects instead of URL parameters?
5. Why Server Actions instead of API routes?
6. How to balance minimal design with content discoverability?

---

## 17. Success Metrics

- ✅ Lighthouse 95+ score maintained
- ✅ Pages load < 1.2s globally
- ✅ PWA installable on mobile
- ✅ Hebrew RTL content perfect
- ✅ Premium gate prevents content leakage
- ✅ All old URLs redirect correctly
- ✅ Email verification works end-to-end
- ✅ Offline mode functional

---

## 18. Change Log

| Date | Change |
|------|--------|
| 2026-06-18 | Initial BLUEPRINT_REVISED.md created from BLUEPRINT.md |
| | Consolidated 11 sections into 18 architectural layers |
| | Added explicit security + testing strategy |
| | Clarified staged development gates |

---

**Next Step:** Review this document, then proceed to TASKS.md for implementation timeline.
