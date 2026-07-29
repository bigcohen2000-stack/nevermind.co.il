# COPY_BRIEF.md
## NeverMinde — Copywriting Brief

**Last Updated:** June 19, 2026
**Status:** Planning only — no page/MDX implementation in this step
**Source of truth:** `CLIENT_SOURCE.md`
**Companion docs:** `VOICE_GUIDE.md`, `CONTENT_STRATEGY.md`, `BLUEPRINT_REVISED.md`, `DESIGN_DIRECTION.md`

> This brief is strategy and direction only. It does not touch `src/` or `.mdx`
> files. Implementation happens in a separate, separately-approved step.

---

## 1. What NeverMinde Is (One Paragraph)

NeverMinde is a minimalist Hebrew knowledge platform for **logical analysis of
reality**. Its single method is the separation of **fact** (מה שקרה — what
happened, verifiable) from **story** (מה שאנחנו מספרים על מה שקרה — the
interpretation we add). Content is organized around three **mechanisms**, not
emotions. The platform rejects the standard psychology-of-engagement playbook:
no drama, no FOMO, no hype, no emotional coaching, no spiritual framing. The copy
is the product's philosophy made literal — dry, precise, and self-evidently true.

---

## 2. Brand Truth (Resolved — Do Not Re-litigate)

| Item | Decision | Note |
|---|---|---|
| Author / face | **יקיר כהן (Yakir Cohen)** | The site and project files are correct. |
| Brand name | **NeverMinde** (Latin), **יקיר כהן** as the human line under it | Deliberate spelling. Keep the trailing "e". |
| "אליעד כהן" in CLIENT_SOURCE | **Legacy source material — ignore for attribution.** | CLIENT_SOURCE was written over older "NeverMind / Eliad Cohen" reference docs. Use it for *philosophy and copy principles*, not for *who the author is*. |
| "NeverMind" (no e) in CLIENT_SOURCE | Legacy spelling — **do not** propagate. | Always write **NeverMinde**. |

**Confirmed by client, 2026-06-19.** Everything below treats Yakir Cohen /
NeverMinde as fixed.

---

## 3. Audience

- **Primary:** Hebrew-speaking adults who are tired of motivational/therapeutic
  content and want a logical, unflinching way to look at their own reactions.
- **Mindset:** skeptical, intelligent, allergic to hype. They trust *restraint*.
- **Reading context:** mobile-first, on the go, RTL Hebrew. Often arriving from
  a shared "fact vs story" snippet (social), curious rather than desperate.
- **What earns their trust:** the absence of persuasion. The copy must read like
  a true statement that needs no selling.

---

## 4. Required Copy Principles (Extracted From CLIENT_SOURCE.md)

These are non-negotiable. Each maps to a concrete rule.

| # | Principle | What it means in copy | Source anchor |
|---|---|---|---|
| 1 | **Zero drama** (אפס דרמה) | No urgency, no stakes-raising, no exclamation. State, don't sell. | CLIENT_SOURCE §intro, §micro-copy |
| 2 | **Logical clarity** | Every sentence is a defensible claim. Prefer the plain word. | §design philosophy |
| 3 | **Fact vs Story** | The product's core idea is also the copy's discipline: separate the verifiable from the interpreted. | `<FactVsStory />`, §content |
| 4 | **No manipulation** | No false scarcity, no engineered guilt, no dark patterns in wording. | §intro (rejection of FOMO/engagement) |
| 5 | **No FOMO** | Never imply the reader is missing out or falling behind. | §intro |
| 6 | **No hype** | No superlatives, no "secret", no "change your life". Authority comes from calm. | §micro-copy ("גלה את הסוד עכשיו!" is banned) |
| 7 | **No emotional coaching** | Don't comfort, cheerlead, or counsel. Describe the mechanism; let the reader conclude. | §design philosophy (anti-manipulation) |
| 8 | **No spiritual language** | No energy/soul/universe/journey framing. Identity questions stay philosophical-logical, not mystical. | §design philosophy |
| 9 | **Dry CTAs** | Buttons state a finished fact or a plain action. A premium gate states the fact: e.g. "...זמין באזור החברים. דורש תשלום." | §micro-copy (verbatim example) |
| 10 | **Precise Hebrew micro-copy** | Only periods, commas, straight quotes. No robotic/marketing punctuation, no emojis, no exclamation marks. | §micro-copy (punctuation rules) |

---

## 5. Messaging Hierarchy (Homepage)

The homepage already follows a defensible order. This is the **canonical
hierarchy** all future copy should preserve:

1. **The promise (hero):** *"להפריד עובדה מסיפור."* — the method in four words.
   Subhead states what it is and what it is not, in one breath.
2. **The structure (mechanisms):** *התוכן מאורגן סביב מנגנונים, לא רגשות.* — how
   the whole site is organized; the reader's mental map.
3. **The proof in writing (articles):** dry editorial entry points.
4. **The proof in voice (video):** same analysis, spoken — clearly marked as
   placeholder until Phase 6.
5. **The demonstration (Fact vs Story panels):** show the method, don't describe
   it. This is the strongest section; keep it concrete.
6. **The depth (members teaser):** what the (future) members area adds — stated
   as a plan, not sold.
7. **The single action (final CTA):** *התחילו מההפרדה הבסיסית: עובדה מול סיפור.*

**Rule:** one idea and at most one primary action per band. Red is used once or
twice per page, never more.

---

## 6. CTA Language System

CTAs are **navigational facts or plain actions** — never persuasion.

**Approved patterns (in use, keep):**
- `קראו מאמרים` · `קראו את המאמר הראשון` · `לכל המאמרים`
- `צפו בהרצאות` · `לעמוד הווידאו` · `לקריאת המאמרים`
- `לאזור החברים` · `למפת המנגנונים ←`
- Inline: `קראו ←` · `כל המאמרים ←`

**Premium / paid CTA (future, per CLIENT_SOURCE):** when payment actually exists,
the gate states a finished fact, e.g.
*"הפירוק המלא של המנגנון זמין באזור החברים. דורש תשלום."*
**Until then, do not imply payment or active registration.** See §8 flag F-3.

**Banned CTA styles (never use):**
- ❌ `גלה את הסוד עכשיו!` / `שנה את חייך!` / any exclamation
- ❌ FOMO timers, "מקומות אחרונים", "אל תפספסו"
- ❌ "הצטרפו למסע", "התחילו את המסע" (spiritual/journey framing)
- ❌ Emoji, ALL-CAPS, "!!!", marketing dashes-as-drama

**Micro-rule:** a CTA is allowed to be *boring*. Boring is the point.

---

## 7. Per-Route Copy Direction (Recommendations Only)

Severity key: **Keep** (compliant) · **Tighten** (minor) · **Fix** (clear gap).
Full findings table lives in `CONTENT_STRATEGY.md §4`.

### `/` Homepage — **Keep, with two tightenings**
- Strong, compliant. Hero, Fact-vs-Story panels, and final CTA are exemplary.
- **Tighten:** the homepage video subhead (*"אותו ניתוח, בקול."*) duplicates the
  `/videos` hero almost verbatim. Differentiate one of them (see CONTENT_STRATEGY
  repeated-wording map).
- **Fix (F-3):** members teaser says *"נדרשת הרשמה."* implying an active signup,
  while `/members` says the area is **not active**. Align — the homepage should
  not promise a registration that does not exist yet.

### `/articles` Index — **Tighten**
- H1 is just *מאמרים* (functional but flat for the section's main page). Consider
  letting the eyebrow carry the label and the H1 carry the idea
  (direction only — proposed in CONTENT_STRATEGY §5).
- "ללא דרמה" appears here and in three other metadata strings — fine as an anchor,
  but avoid stacking it in body + meta + footer on the same view.

### `/articles/fact-vs-story` (MDX) — **Keep**
- Clean, concrete, correctly dry. The pull-quote restates the thesis without hype.
- Optional tighten: the closing line *"האימון הוא פשוט וקשה כאחד"* leans faintly
  toward coaching cadence. A drier close is available (CONTENT_STRATEGY §6).

### `/articles/what-is-a-mechanism` (MDX) — **Keep**
- Excellent. *"זו אינה עבודה רגשית. זו עבודה לוגית."* is the brand in two lines.

### `/mechanisms` — **Keep, watch one line**
- Mostly strong and structural.
- **Watch:** *"השכבה העמוקה ביותר, שבה נשאלת השאלה מי בכלל שואל."* is the most
  abstract line on the site. CLIENT_SOURCE explicitly *permits* philosophical
  inquiry for the Identity mechanism, so this is allowed — but it is the ceiling.
  Do not go further toward the poetic/mystical here.

### `/videos` — **Tighten**
- Honest about being a placeholder (good — that is zero-drama integrity).
- **Tighten:** *ארבעה אופנים לצפות* reads slightly like a listicle header.
  A drier framing is proposed in CONTENT_STRATEGY §6.
- De-duplicate the *"אותו ניתוח, בקול"* line shared with the homepage.

### `/members` — **Fix one micro-copy line, otherwise Keep**
- The "what it is NOT" strikethrough device is on-brand and effective.
- **Fix (F-4):** *"הוא מסיר ממנה."* is grammatically awkward Hebrew and slightly
  unclear. Intended meaning: it removes itself from / stands apart from the
  emotional industry. A precise rewrite is proposed in CONTENT_STRATEGY §6.

### Global chrome (header/footer) — **Keep**
- Footer tagline *"ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה."*
  is the canonical one-liner. Treat it as the **brand boilerplate** and keep it
  identical everywhere it appears (footer + meta), rather than paraphrasing it.

---

## 8. Open Flags (For Client / Next Step — Do Not Act Yet)

| ID | Flag | Why it matters | Recommended resolution |
|---|---|---|---|
| F-1 | Brand spelling "NeverMinde" vs CLIENT_SOURCE "NeverMind" | Consistency / SEO | **Resolved:** use NeverMinde everywhere (client-confirmed 2026-06-19). |
| F-2 | Author attribution Yakir vs Eliad | Brand integrity | **Resolved:** Yakir Cohen (client-confirmed). Ignore legacy Eliad references. |
| F-3 | Homepage "נדרשת הרשמה" vs `/members` "not active" | A promised signup that doesn't exist is a soft manipulation — violates principle #4/#9 | Reword homepage teaser to describe the *plan*, not an active gate, until Phase 9. |
| F-4 | `/members` line "הוא מסיר ממנה" | Precision (#10) | Rewrite to a clear Hebrew sentence (see CONTENT_STRATEGY §6). |
| F-5 | "דורש תשלום" premium CTA from CLIENT_SOURCE | Source asks for it; product has no payment yet | Defer the payment-fact CTA to Phase 9. Honesty now > literal source compliance. |
| F-6 | Repeated taglines across meta/body | Mild redundancy | Designate canonical boilerplate (footer line) and vary body copy. |

---

## 9. Out Of Scope For This Step

No edits to `src/` or `.mdx`. No new routes, articles, components, packages, SEO,
auth, PWA, payments, forms, analytics, or design/layout/Tailwind changes. This
brief, `VOICE_GUIDE.md`, and `CONTENT_STRATEGY.md` are the only deliverables.
Implementation of any recommendation requires a separate approved step.
