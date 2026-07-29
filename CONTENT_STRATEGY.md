# CONTENT_STRATEGY.md
## NeverMinde — Content & Copy Strategy + Audit

**Last Updated:** June 19, 2026
**Status:** Planning only — no `src/` or `.mdx` edits in this step
**Source of truth:** `CLIENT_SOURCE.md` · **Companions:** `COPY_BRIEF.md`, `VOICE_GUIDE.md`

---

## 1. Content Architecture (Confirmed)

Content is organized by **three mechanisms, not emotions** — the spine of the
whole site. This is locked and already reflected in the build.

| Mechanism | Hebrew | Covers | Identity color (design) |
|---|---|---|---|
| Relationships | יחסים | family, communication, blame, conflict | `bg-red-50` |
| Existence | קיום | survival, money, pressure, work, habits | `#D42B2B` accent |
| Identity | זהות | ego, free will, reality-as-illusion, consciousness | `bg-stone-100` |

**Copy implication:** every article belongs to exactly one mechanism. The
category label is part of the article's identity in every listing. The reader's
mental model is *"which mechanism is this?"*, never *"which emotion is this?"*.

---

## 2. Content Types & Their Copy Jobs

| Type | Job | Voice emphasis |
|---|---|---|
| **Article (MDX)** | Decompose one mechanism to its logical root | Definition + contrast patterns; concrete examples |
| **Fact vs Story block** | Demonstrate the method, don't describe it | Two literal lines: a verifiable fact, a struck-through story |
| **Mechanism page band** | Map a mechanism + sample questions | Structural; questions are dry, real, non-leading |
| **Video (future)** | Same analysis, spoken | Honest placeholder until Phase 6; "another way to observe structure" |
| **Members teaser (future)** | Describe the plan, not sell access | Status-honest; "planned, not active" until Phase 9 |
| **Chrome (header/footer/meta)** | Carry the boilerplate | Identical signature line everywhere |

---

## 3. Audit Method

Every route below was read line-by-line against the ten CLIENT_SOURCE copy
principles (see `COPY_BRIEF.md §4`). The audit looks for: weak headlines, weak
CTAs, generic copy, repeated wording, unclear sections, over-abstraction, and
tone drift (poetic / motivational / therapeutic / spiritual / vague). Routes
covered: `/`, `/articles`, `/articles/fact-vs-story`,
`/articles/what-is-a-mechanism`, `/mechanisms`, `/videos`, `/members`, plus
global header/footer.

**Headline finding:** the current copy is, on the whole, **strongly compliant** —
genuinely dry, logical, and Hebrew-first. There is no hype, FOMO, spiritual, or
coaching language anywhere. The issues found are **minor precision, redundancy,
and one honesty-alignment gap** — not a tone problem. This is a good baseline.

---

## 4. Route-By-Route Findings

Severity: **Keep** · **Tighten** · **Fix**

### `/` Homepage
| Finding | Type | Severity | Note |
|---|---|---|---|
| Hero "להפריד עובדה מסיפור." + subhead | Strength | Keep | Exemplary: method in 4 words, dry subhead. |
| Fact vs Story panels (real example, struck-through story) | Strength | Keep | The strongest section on the site. Show-don't-tell. |
| Video subhead "אותו ניתוח, בקול." | Repetition | Tighten | Near-duplicate of `/videos` hero. Differentiate one. |
| Members teaser "נדרשת הרשמה." | Honesty gap | **Fix (F-3)** | Implies an active signup; `/members` says not active. Reword to describe the plan. |
| Final CTA "התחילו מההפרדה הבסיסית..." | Strength | Keep | Dry imperative, single action, red used once. |
| Placeholder "מקום שמור לתמונה" | Neutral | Keep | Honest placeholder; awaits Yakir photo (per DESIGN_DIRECTION v4). |

### `/articles`
| Finding | Type | Severity | Note |
|---|---|---|---|
| H1 = "מאמרים" only | Weak headline | Tighten | Functional but flat for the section's main page. See §5. |
| "ללא דרמה" in hero + meta + footer on near-views | Repetition | Tighten | Keep as anchor, but don't stack on one screen. |
| "ניתוח לוגי בכתב." | Strength | Keep | Good section idea line. |
| Card pattern (category · title · description · "קראו ←") | Strength | Keep | Clean, dry, scannable. |

### `/articles/fact-vs-story` (MDX)
| Finding | Type | Severity | Note |
|---|---|---|---|
| Definitions of עובדה / סיפור with concrete example | Strength | Keep | Concrete, verifiable, on-method. |
| Pull-quote restating the thesis | Strength | Keep | Restates without hype. |
| Close "האימון הוא פשוט וקשה כאחד..." | Faint coaching cadence | Tighten (optional) | Slightly "lesson"-flavored. Drier close in §6. |

### `/articles/what-is-a-mechanism` (MDX)
| Finding | Type | Severity | Note |
|---|---|---|---|
| "מנגנון הוא תבנית חוזרת." + symptom/structure framing | Strength | Keep | Textbook brand voice. |
| Close "זו אינה עבודה רגשית. זו עבודה לוגית." | Strength | Keep | The brand in two lines. Use as a model elsewhere. |

### `/mechanisms`
| Finding | Type | Severity | Note |
|---|---|---|---|
| "מנגנונים, לא רגשות." hero + concept band | Strength | Keep | Clear structural map. |
| Sample questions per mechanism | Strength | Keep | Real, non-leading, dry. |
| "השכבה העמוקה ביותר, שבה נשאלת השאלה מי בכלל שואל." | Over-abstraction (ceiling) | Watch | Allowed for Identity (CLIENT_SOURCE permits philosophy) but this is the limit. Do not go more poetic. |

### `/videos`
| Finding | Type | Severity | Note |
|---|---|---|---|
| Honest "כרגע זהו מציין מקום בלבד — אין כאן נגן אמיתי." | Strength | Keep | Zero-drama integrity. Keep this honesty. |
| Hero "אותו ניתוח, בקול." | Repetition | Tighten | Shares the line with the homepage video band. |
| "ארבעה אופנים לצפות." | Slightly listicle | Tighten | Drier framing in §6. |
| Philosophy band "וידאו אינו בידור." | Strength | Keep | Contrast pattern, on-voice. |

### `/members`
| Finding | Type | Severity | Note |
|---|---|---|---|
| Hero "מתוכנן. עדיין לא פעיל." + status card "בקרוב" | Strength | Keep | Honest status; credibility through restraint. |
| "What it is NOT" struck-through list | Strength | Keep | On-brand device; mirrors Fact vs Story visually. |
| "הוא מסיר ממנה." | Unclear micro-copy | **Fix (F-4)** | Awkward Hebrew; meaning unclear. Rewrite in §6. |
| "What it is" list | Strength | Keep | Dry, structural. |

### Global header / footer
| Finding | Type | Severity | Note |
|---|---|---|---|
| Footer signature line | Strength | Keep | Treat as canonical boilerplate (VOICE_GUIDE §5.3). |
| Nav labels (ראשי / מאמרים / מנגנונים / וידאו / חברים) | Strength | Keep | Plain, correct. |

---

## 5. Article & Headline Direction

**Index H1 direction (`/articles`):** let the eyebrow carry the section label and
the H1 carry the *idea*, so the main page headline isn't a bare noun. Direction,
not a mandated string — options to choose from in a later step:
- Eyebrow `מאמרים` → H1 something structural like *"ניתוח לוגי, מנגנון אחר מנגנון."*
- Keep H1 short; never add hype to compensate.

**Article headline system (for future articles):** titles should name the
*mechanism or the distinction*, not promise an outcome.

| ✅ On-strategy title shape | ❌ Off-strategy |
|---|---|
| עובדה מול סיפור | איך להפסיק לסבול בזוגיות |
| מהו מנגנון | 5 טיפים לשקט נפשי |
| מי אשם בקונפליקט | תפסיק להאשים ותהיה מאושר |
| האם קיים רצון חופשי | גלה את הסוד לחופש אמיתי |

**Rules for titles:**
- Name the distinction, the mechanism, or the question. Not the benefit.
- No numbers-as-listicle ("5 דרכים..."), no second-person promises, no "סוד".
- A question title must be a *real* analytical question, asked flatly.
- Keep to the three-mechanism map; the category label does the positioning.

**Description (Frontmatter) direction:** one or two flat sentences that state what
the article *separates* or *defines* — mirroring the two existing samples.

**Backlog:** the concrete, research-grounded article list lives in
`ARTICLE_BACKLOG.md` — 15 candidates organized by mechanism (יחסים ×4 · קיום ×5 ·
זהות ×6), each tagged with its audience pain, angle, Free/Members plan, and any
legacy-SEO URL from the `CLIENT_SOURCE.md` 301 table. Highlights: **I1 "מחשבה אינה
עובדה"** (the flagship, built on the "אך מודע לכך" research insight) and **E1 "מהי
התלבטות"** (the newly-attested decision-paralysis pain). Six candidates carry
legacy SEO equity and should migrate first. None are written in this step.

---

## 6. Specific Rewrite Directions (Proposals — Not Implemented)

These are **proposed directions** for the flagged items. None are applied in this
step; they exist so the later implementation step has a clear target.

- **F-3 · Homepage members teaser** — replace the "active signup" implication with
  a plan statement. Direction: keep "ניתוחים מורחבים... זמינים באזור החברים."
  but end on the honest status (e.g. "אזור החברים מתוכנן.") instead of
  "נדרשת הרשמה." Final wording to be set when Phase 9 scope is known.
- **F-4 · `/members` "הוא מסיר ממנה."** — rewrite to a clear sentence. Direction
  options: *"הוא יוצא ממנה."* / *"הוא עומד מחוץ לה."* / *"הוא אינו חלק ממנה."*
  Pick one clean line that means *stands apart from the emotional industry*.
- **Repetition (F-6) · "אותו ניתוח, בקול"** — keep it on `/videos` (where it is the
  page thesis) and vary the homepage video band subhead so the two pages don't
  echo. Or vice-versa — one canonical home for the line.
- **`/videos` "ארבעה אופנים לצפות."** — drier alternative direction, e.g. a label
  like "סוגי תוכן" carrying the count, with an H2 that states the idea rather than
  the quantity.
- **`/articles/fact-vs-story` close** — optional drier ending in the
  definition/contrast shape (cf. the mechanism article's
  *"זו אינה עבודה רגשית. זו עבודה לוגית."*).

---

## 7. Consistency Rules (Carry Forward)

1. **One canonical boilerplate.** The footer signature line is the brand
   one-liner. Reuse it verbatim; don't spawn near-variants.
2. **No tagline stacking.** "ללא דרמה" / "ניתוח לוגי" are anchors — at most once
   per visible band, not in hero + body + meta on the same screen.
3. **Honesty over literal source.** Where CLIENT_SOURCE asks for payment/active
   language that the current build doesn't support (no payments, members not
   active), the *honest placeholder* wins. State "מתוכנן / לא פעיל", never imply
   a function that doesn't exist (principle #4, no manipulation).
4. **Category label is positioning.** Every article surface shows its mechanism.
5. **Red is rare.** One, occasionally two, red actions per page — matches the
   design rule and reinforces "action is a finished decision, not a lure".

---

## 8. Suggested Sequence For The Implementation Step (When Approved)

Planning only — this is the recommended order, not an action list to run now:

1. Fix the two honesty/precision items (F-3 homepage teaser, F-4 `/members` line).
2. De-duplicate the shared "אותו ניתוח, בקול" line across `/` and `/videos`.
3. Tighten `/articles` H1 and `/videos` "ארבעה אופנים" framing.
4. Lock the footer signature line as boilerplate and audit meta strings against it.
5. Apply the article-title rules to all *future* articles (the two samples already
   comply).

Each of the above is copy-only and must not touch layout, Tailwind classes,
colors, spacing, components, routing, or packages.
