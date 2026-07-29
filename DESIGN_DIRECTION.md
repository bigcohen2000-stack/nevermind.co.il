# DESIGN_DIRECTION.md
## NeverMinde — Whole-Site Visual Direction

**Last Updated:** June 19, 2026
**Status:** Visual direction defined · Homepage draft implemented (Phase 5 visual layer)
**Reference:** `references/site-reference.jpg`

---

## 1. Purpose

This document defines the visual system for the **entire** NeverMinde site, derived
from `references/site-reference.jpg`. The reference is a long-form editorial
speaker/coaching landing page. We borrow its **structure and rhythm**, not its
look. NeverMinde stays minimal, quiet, and logical.

> The reference shows us *how to organize a long page*. It does not tell us *how
> NeverMinde should feel*. The feeling stays locked by the blueprint.

---

## 2. What We Take From The Reference (and What We Reject)

| Reference pattern | Take it? | NeverMinde adaptation |
|---|---|---|
| Long-form editorial scroll | ✅ Yes | One vertical narrative, section by section |
| Alternating light / dark bands | ✅ Yes | Dark = `#1A1A1A` bg + `#FAFAF8` text. **Never** the reference blue |
| Strong hero with big type | ✅ Yes | Large Hebrew headline, dry tone, one red CTA |
| Oversized section labels | ✅ Adapted | Quiet eyebrow labels, not giant decorative words |
| Card-based content blocks | ✅ Yes | Bordered cards (hairline), no shadow, no gradient |
| Authority / testimonial blocks | ✅ Adapted | "Method in practice" + dry quotes, no faces required |
| Article previews | ✅ Yes | Category + title + one-line description |
| Video / lecture previews | ✅ Yes | Static placeholder frame (no player, no packages yet) |
| CTA areas | ✅ Yes | One precise action per band, red used sparingly |
| Premium / member teaser | ✅ Yes | Dry teaser, **no** gating logic yet |
| Blue gradients, glows, glass | ❌ No | Banned by locked rules |
| Heavy shadows, big imagery, hype | ❌ No | Banned by locked rules |
| Decorative icons / emojis | ❌ No | Shapes drawn in CSS/SVG only when essential |

---

## 3. Locked Constraints (Do Not Break)

- **Language:** Hebrew, RTL, right-aligned (`text-start` in an RTL doc).
- **Color tokens — only these four:**
  - `#FAFAF8` background (light)
  - `#1A1A1A` foreground / dark-section background
  - `#D42B2B` action red (sparingly: primary CTAs, critical links)
  - `#9CA3AF` muted gray (secondary labels, the "story" layer)
- **Dark sections** are built by inverting existing tokens: `#1A1A1A` background
  with `#FAFAF8` text. Secondary text on dark uses `text-background/70`; borders
  on dark use `border-background/15–20`. No new colors are introduced.
- No gradients. No heavy shadows. No external fonts. No external icon libraries.
- No heavy animation — only `transition-colors` (150–300ms) on hover/focus.
- Mobile-first. Fast loading. System font stack only.

---

## 4. Section Rhythm (Site-Wide Grammar)

Long pages alternate tone to create rhythm without drama:

```
[ dark band ]  →  hero / teaser / member moments
[ light band ] →  reading, lists, explanation
[ dark band ]  →  visual pause (video, member teaser)
[ light band ] →  closing action
```

**Rules for every page:**
- Each band is full-bleed; content sits in an inner container (`max-w-5xl` on the
  homepage, `max-w-3xl` for reading pages).
- Generous vertical spacing: `py-20` mobile → `py-28` desktop.
- Hairline separators only (`border-foreground/10`), never shadows.
- One idea and at most one primary action per band.

---

## 5. Typography Scale

System font stack (already in `globals.css`). Hierarchy by size/weight, not by
font family.

| Role | Mobile | Desktop | Weight |
|---|---|---|---|
| Hero headline | `text-4xl` | `text-6xl` | 600 |
| Section heading | `text-2xl` | `text-3xl` | 600 |
| Card title | `text-xl` | `text-2xl` | 600 |
| Body | 16px | 18px | 400, line-height 1.7 |
| Eyebrow / label | `text-sm` | `text-sm` | 500, `text-muted` |

Reading measure capped at `max-w-prose` (~65–75ch) for body copy.

---

## 6. Components Vocabulary

- **Band / Section:** full-bleed tone wrapper + inner container.
- **Eyebrow:** small muted label above a heading (replaces the reference's giant
  decorative words).
- **Card:** hairline-bordered block, `hover:border-foreground/30` color shift
  only. Whole card is clickable where it links somewhere.
- **CTA link:** styled like the existing `Button` (solid red primary / bordered
  secondary), but rendered as a `next/link` for navigation. Min target ~44px.
- **Fact vs Story block:** the brand's signature — fact in solid foreground,
  story in muted gray with strikethrough. Pure CSS, no MDX dependency.
- **Video placeholder frame:** `aspect-video`, hairline border, CSS play glyph,
  caption. No player, no third-party packages.

---

## 7. How This Direction Affects Each Page

### Homepage (`/`) — implemented and refined in this step
The full editorial narrative. Bands in order:
1. **Hero** (dark) — asymmetric two-column: Hebrew headline + CTAs on the right,
   a portrait/media **placeholder card** on the left, with one small **off-white
   info card overlapping** its corner. Oversized low-contrast "NeverMinde"
   watermark behind.
2. **Core mechanisms preview** (light) — designed, **staggered** three-card row
   (01/02/03 index numbers, hairline borders) → `/mechanisms`.
3. **Articles preview** (light) — **staggered editorial cards** (geometric
   thumbnail placeholder + category/title/description) from the MDX helper → `/articles`.
4. **Video / lecture preview** (dark) — **large media block** with a play glyph
   and an overlapping off-white caption card → `/videos`. No player, no packages.
5. **Fact vs Story** (light) — two **large contrasted panels**: Fact = solid dark
   panel, Story = faded muted/strikethrough panel.
6. **Members teaser** (dark) — premium-style CTA area with a **gated-content
   placeholder** (hairline bars), no gating logic → `/members`.
7. **Final CTA** (light) — intentional designed block: red accent rule + oversized
   headline + edge-aligned CTA → `/articles`.

**Refinement techniques (homepage):** asymmetric `lg:grid-cols-12` two-column
layouts (stacked on mobile); oversized low-contrast `Watermark` words
(`text-foreground/5` / `text-background/5`, clipped by `overflow-hidden`);
overlapping off-white cards via negative margins / `lg:absolute`; geometric
bordered placeholders for portrait, thumbnails, and locked content; layout depth
from borders + overlap only (no shadows, no gradients). All text stays RTL and
right-aligned.

### Articles index (`/articles`)
Light reading page. A dark hero strip can introduce the section, then a clean
list of article cards (category, title, description). Keeps `max-w-3xl` measure.
*(Direction only — not changed in this step.)*

### Article detail (`/articles/[slug]`)
Pure reading. Optional dark title strip (category + title), then light body at
`max-w-prose`. Fact vs Story rendered inline within content. A quiet members
teaser may close premium-flagged articles later.
*(Direction only — not changed in this step.)*

### Mechanisms (`/mechanisms`)
Light overview with three strong category blocks (יחסים, קיום, זהות), each able
to host its own dark accent header. Card grid mirrors the homepage mechanisms
band so the two stay visually consistent.
*(Direction only — not changed in this step.)*

### Videos (`/videos`)
Mostly dark page (video reads better on dark). Grid of placeholder frames with
captions until real video integration (Phase 6). No player yet.
*(Direction only — not changed in this step.)*

### Members (`/members`)
Calm dark landing explaining the members area in dry language. One red action.
No auth, no gate, no payment — copy and layout only until Phase 9.
*(Direction only — not changed in this step.)*

---

## 8. Accessibility & Quality Bar

- Contrast: foreground/background pairings exceed 4.5:1 in both tones. Muted gray
  is used only for secondary labels, never for body text on light.
- Every band heading is reachable via `aria-labelledby`.
- Focus-visible rings on all CTAs; tap targets ≥ 44px.
- `cursor-pointer` on all clickable cards; hover = color shift only (no layout
  shift).
- Respect `prefers-reduced-motion` (we only animate color, so impact is minimal).

---

## 9. Out Of Scope For This Step

Per current instructions, this step delivers **direction + homepage draft only**.
No Phase 6, no PWA, auth, premium logic, payments, Resend, database, analytics,
video packages, or new dependencies. Other pages are described here as direction
and will be implemented in later, separately-approved steps.

---

## 10. Polish v2 — Premium Editorial Layer (June 19, 2026)

The conservative v1 rollout was clean but flat. v2 elevates it toward the
reference's premium editorial feel **without breaking the locked brand**.

### 10.1 Extended palette (supporting tones only)
The four brand colors are unchanged. Two supporting tones were added for depth:

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#141519` | Deep ink for premium dark bands (richer than pure black) |
| `--ink-raised` | `#1F2127` | Lifted ink for cards/panels on dark bands |
| `--paper` | `#F2EEE6` | Warm off-white for light/light rhythm variation |

Dark bands now use **ink** (not `#1A1A1A`). `#1A1A1A` remains the text/foreground
token. Light bands alternate `background` ↔ `paper` for tonal rhythm.

### 10.2 Depth, not drama
- **Soft editorial shadows** (`--shadow-soft`, `--shadow-float`) — never heavy.
  Used on cards and floating/overlapping elements only.
- **Modest radii** (`--radius-btn` 10px, `--radius-card` 14px, `--radius-frame`
  20px) — rounded, not pill, not sharp.
- **Restrained band glow:** `.band-dark::before` adds a whisper-quiet radial
  highlight + faint red accent for depth. No loud gradients.
- **Layered composition:** hero portrait sits over an offset accent frame;
  cards float over dark bands with `shadow-float`.

### 10.3 Reusable classes (in `globals.css`)
`.band-dark`, `.band-paper`, `.card`, `.card-dark`, `.card-hover`,
`.media-frame` / `.media-frame-light`, `.btn` + `.btn-primary` /
`.btn-secondary` / `.btn-on-dark`, `.link-arrow`, `.watermark`, `.accent-rule`.
Pages compose these instead of repeating long utility strings, keeping the
system coherent across every route.

### 10.4 Motion & chrome
- Subtle hover **lift** on interactive cards and primary buttons (transform +
  shadow), fully gated behind `prefers-reduced-motion`.
- **Sticky translucent header** (blurred off-white backdrop, hairline border).
- **Dark ink footer** bookends the site with a large wordmark.

### 10.5 Still forbidden
No external fonts/icons, no heavy shadows, no loud gradients, no new packages,
no new routes/articles, no MDX-internals changes, no fake functionality. Hebrew
RTL and right alignment preserved throughout; all pages stay static + fast.

### 10.6 Polish v3 — craft refinements (June 19, 2026)
Premium through craft, not effects. All CSS-only, mostly in `globals.css` so the
lift cascades to every route:
- **Typography craft:** `text-wrap: balance` on h1–h3, `text-wrap: pretty` on
  paragraphs, tighter display tracking (`-0.022em`), kerning/ligatures on.
  Homepage hero scales to `xl:text-7xl`.
- **Tactile depth:** a whisper-quiet film-grain (`.band-dark::after`, inline SVG
  turbulence, opacity 0.04, `soft-light`) under the layered glow on dark bands.
- **Micro-interactions:** `.link-arrow` underline now grows from the start on
  hover; primary buttons gained a soft red-tinted lift shadow and slightly
  larger hit area.
- **Scroll-reveal:** each `main > section` fades up subtly on entry — gated by
  `@supports (animation-timeline: view())` and `prefers-reduced-motion`, so it
  degrades to a static page everywhere it isn't welcome.
- **Chrome:** stronger header blur with an opaque `supports` fallback; homepage
  hero gained a dry "three mechanisms" meta strip under the CTAs.

### 10.7 Polish v4 — editorial article craft (June 19, 2026)
- **Editorial article craft** (`article-body.tsx`): drop cap on the lead
  paragraph (floats to the RTL start) and a pull-quote treatment (red inline-
  start rule). One distilled pull-quote added to each sample article.
- **Media slots stay real-image placeholders.** A generative SVG graphics set
  (`brand-art.tsx`: FactStoryArt / ArticleThumbArt / VideoArt) was trialed here
  but **reverted at the client's request** — the hero and media frames are meant
  to hold an actual photo of Yakir, not graphics. When the photo exists it drops
  straight into the hero `media-frame` (use `next/image`, `aspect-[4/5]`).
