# MARKET_RESEARCH_NOTES.md
## NeverMinde — Audience & Market Research (Method + Raw Notes)

**Last Updated:** June 19, 2026 (Update 2 — engine run)
**Status:** Research only — no copy implemented
**Companions:** `AUDIENCE_LANGUAGE_REPORT.md`, `COPY_PHRASE_BANK.md`, `COPY_BRIEF.md`, `VOICE_GUIDE.md`

> This file documents **how** the research was done and **what was actually
> returned**, so every claim downstream is traceable. Nothing here is invented.
> Where something is an inference rather than an observation, it says so.

---

## 0. UPDATE 2 — The last30days Engine Actually Ran (June 19, 2026)

**Did last30days run this time? YES.** Python 3.12.13 is now installed, so the
engine (`scripts/last30days.py v3.6.0`) executed end-to-end in 23.6s and saved raw
output to `~/Documents/Last30Days/last30days-raw-v3.md`. Update 1 (below, §1)
could not run it; this update did.

**Sources/topics the engine inspected (per `--diagnose` + run log):**
- **Active sources:** Reddit (keyless RSS+listing), Hacker News, GitHub, Polymarket, web "grounding".
- **Subreddits targeted:** r/Israel, r/OCD, r/freewill, r/Anxiety.
- **Query plan (4 subqueries):** primary (אליעד כהן / רצון חופשי / אגו / מודעות עצמית); anxiety+thoughts (חרדה / מחשבות טורדניות / איך להפסיק לחשוב / חוסר שקט); relationships (זוגיות / ריבים / תלות רגשית); existence (לחץ בעבודה / כסף / משמעות החיים / קבלת החלטות).
- **NOT available (no auth/keys):** X/Twitter, YouTube, TikTok, Instagram.

**What the engine actually returned — honest result:**
- **Reddit: 6 English threads only** (735 upvotes, 760 comments), every one flagged
  `entity-miss demotion, score 0` — meaning the Hebrew query did not match, so the
  engine fell back to generic English content.
- **Hacker News: HTTP 400** (its API rejected the Hebrew query string). **GitHub: 0.
  Polymarket: 0. Web/grounding: 0.**
- Engine self-report: *"Research quality: 3/5 core sources. Missing: X/Twitter, YouTube."*

**This is exactly the Class-5 (non-Latin-script) outcome the skill warns about:**
Reddit/HN/GitHub are English-dominant and score ~0 on Hebrew entities; the two
highest-value sources for a Hebrew topic (X, YouTube) are the unavailable ones.
A real-language Hebrew run would need `--web-backend brave` (no key here) plus X
cookies and yt-dlp.

**The 6 real engine threads (last 30 days, English communities) — usable as the
*adjacent* conversation, not as Hebrew audience voice:**
- r/freewill is *actively, logically* debating the topic right now: "Defining Free
  Will", "Free will is just a figment", "There is no logical reason moral
  responsibility requires free will" (158 comments). Validates that רצון חופשי is
  argued as **logic**, not spirituality — NeverMinde's exact angle.
- r/Anxiety skews practical/coping: top thread (714 pts) "Do NOT smoke weed if you
  have anxiety", plus "Anxiety attack? What to do?", "how to handle rejection with
  anxiety" — advice-seeking register.

**WebSearch supplements (Step 2 of the skill protocol, not a substitute):** because
the engine returned no Hebrew, the skill's own mandatory WebSearch supplement step
is where the Hebrew language came from this round too. New real Hebrew signal added
in §2.5 below.

**Comparison to Update 1 (WebSearch-only):**
| | Update 1 (WebSearch) | Update 2 (engine + WebSearch) |
|---|---|---|
| Engine ran? | No (no Python) | **Yes** |
| Hebrew audience language | Rich (forum titles) | Engine: ~none. WebSearch: rich again |
| Time-filtered "last 30 days"? | No | Engine: yes, but English-only |
| New value | — | English free-will/anxiety community pulse (real, dated) |
| Verdict | WebSearch is the Hebrew channel | **Unchanged: for Hebrew, WebSearch/Israeli forums beat the engine's keyless sources** |

**Research-ops note:** the term **"אליעד כהן" is now a polluted search anchor** — it
collides with a news-prominent namesake (hostage-families context, Ynet Oct 2025).
Future author research should use "שיטת EIP" / "eip.co.il" / "השם לא משנה" instead.

---

## 1. Method & Honest Limitations (Read First)

**What was attempted:** the `last30days` skill, which is built around a Python
research engine that fans out across Reddit, X, YouTube, TikTok, HN, etc.

**What actually happened:**
- ❌ **The `last30days` engine could not run.** It hard-requires Python 3.12+,
  and **no Python interpreter is installed in this environment** (`python3`,
  `python`, `python3.12/.13` all absent). The engine was not run; no engine
  output exists. This is stated plainly rather than faked.
- ✅ **Live `WebSearch` was available and used.** It returned real Hebrew search
  results — forum/thread titles, page titles, and short snippets.

**Limitations of the WebSearch substitute (so nothing is overclaimed):**
1. **Title/snippet level only.** WebSearch returns result titles + a short
   synthesized summary. It does **not** return full thread bodies or individual
   user comments. So "exact phrases" below are real **titles/snippets**, and
   "pains/confusions" are **inferences from clusters of titles**, labeled as such.
2. **US-routed.** The tool self-describes as US-region; Hebrew coverage is real
   but partial. Israeli-only forums may be under-sampled.
3. **Not strictly last-30-days.** WebSearch is not time-filtered; some results are
   older (2018–2025). Treat this as **evergreen audience language**, not a
   trend snapshot. The "what's new in 30 days" promise of the skill was not met.
4. **No engagement signal.** No upvote/like/view counts, so we can't weight by
   popularity. Frequency here = "appeared across multiple independent results."

**Net:** the findings are a solid, evidence-grounded **vocabulary and pain map**
for an evergreen audience — strong enough to steer copy. They are **not** a
real-time social-listening snapshot. If that is needed later, see §6.

---

## 2. Searches Actually Run (Traceable)

Nine WebSearch queries, two batches. Topics covered from the brief: חרדה,
מחשבות טורדניות, "למה אני סובל", איך להפסיק לחשוב, רצון חופשי, אגו, קבלת החלטות,
משמעות החיים, לחץ, כסף, עבודה, רגשות מול מציאות, אליעד כהן, חקירה עצמית,
מודעות עצמית, תלות רגשית, פחד מכישלון, חוסר שקט, ריבים בזוגיות.

1. `חרדה מחשבות טורדניות פורום "למה אני" דיון`
2. `אליעד כהן עובדה מול סיפור מנגנון רצון חופשי הרצאה`
3. `ריבים בזוגיות "למה אנחנו רבים" פורום reddit ישראל`
4. `תלות רגשית פחד מכישלון חוסר שקט מחשבות טורדניות פורום`
5. `"איך להפסיק לחשוב יותר מדי" "למה אני סובל" מחשבות בראש פורום`
6. `eip.co.il אליעד כהן קבלת החלטות אגו משמעות החיים חקירה עצמית`
7. `לחץ כסף עבודה "אין לי שקט" "תקועים" פורום שיתוף ישראלי`
8. `משמעות החיים "מה הטעם" "למה אני פה" דיכאון קיומי פורום`
9. `אליעד כהן יוטיוב תגובות מודעות עצמית רצון חופשי שכל`

---

## 2.5 Update 2 — Additional WebSearch Supplements (Traceable)

Five more WebSearch queries run alongside the engine (Step 2 of the protocol):
1. `אגו "להרגיש חשוב" "ביקורת" "נעלב" פורום דיון ישראלי`
2. `קבלת החלטות "לא מצליח להחליט" התלבטות תקוע פורום עברית`
3. `רגשות מול מציאות "זה רק בראש שלי" "סיפור שאני מספר לעצמי" עברית`
4. `אליעד כהן השם לא משנה רצון חופשי מציאות תגובות יוטיוב 2026`
5. `חרדה מחשבות טורדניות פורום 2026 "אני לא מצליח להפסיק"`

**New real sources surfaced:** hasolidit thread "בן 40, לא מצליח לצאת מבית ההורים";
operationlp.com NLP page (with a forum comment: a person hesitating **a year**
between two career options *after trying both and consulting two occupational
psychologists*); inn.co.il (ערוץ 7) "מחשבות טורדניות וחרדות" forum (intrusive
thoughts "24 שעות ביממה", "באות ומציפות בכל הזדמנות"); drtal.co.il, cohenshelly.com
(therapy articles).

**Honest gaps in Update 2:** the **אגו** search returned mostly news/literary noise —
no clean Hebrew ego audience-language surfaced. The **"רגשות מול מציאות / סיפור
שאני מספר לעצמי"** search returned literary archives, not forum voice — so that exact
on-method phrasing is *not* attested in Hebrew search yet (do not claim it as
observed). The **אליעד כהן** search collided with the news namesake (see §0).

---

## 3. Where This Audience Actually Talks (Real Sources Found)

Public Hebrew destinations that surfaced repeatedly. (Public pages/titles only —
no login, no private content accessed.)

| Source | Type | What it covers (per returned titles) |
|---|---|---|
| **doctors.co.il** `forum-4213` | Q&A forum | "פורום הפרעה טורדנית-כפייתית, אובססיבית" — intrusive thoughts, OCD, derealization |
| **infomed.co.il** forums | Forum | "פורום חרדה" — recurring intrusive thoughts, health-anxiety |
| **betipulnet.co.il** forum | Psychology forum | "איך להפסיק לחשוב", OCD threads |
| **camoni.co.il** community | Peer support | "דיכאון וחרדה: מקום בטוח לשיתוף, תמיכה ואוזן קשבת" |
| **fxp.co.il** | Large general forum | "פורום מלב אל לב — שיתוף ברגשות, בפחדים, בבעיות" |
| **hasolidit.com** kehila | Financial-independence forum | money discomfort, "לחץ בהייטק", "תקוע", burnout, job-search difficulty |
| **eip.co.il / yeda.eip.co.il / coping.eip.co.il** | Eliad Cohen's EIP platform | the legacy "NeverMind" source material — anxiety, free will, decisions, ego, meaning |

**Note on Reddit:** the engine couldn't run, and WebSearch surfaced **no Hebrew
Reddit threads** for these queries (Hebrew self-inquiry discussion lives on the
Israeli forums above and on YouTube, not r/). Documented, not hidden.

---

## 4. The Most Important Strategic Finding (Positioning)

**The legacy source NeverMinde is built on top of — Eliad Cohen / EIP — uses
exactly the register NeverMinde forbids.** Returned EIP titles include:
- "להיות אלוהים! שיביא אותך לשלמות ולאושר מוחלט!"
- "🥇" medal emojis in nearly every title, "סודות החיים", "מודעות רוחנית",
  "חיפוש רוחני", "אושר".

This is spiritual + hype + emoji + coaching — the full drama register. **It is
the single clearest proof of NeverMinde's market gap:** the same subject matter
(free will, ego, suffering, decisions) is currently sold to this audience wrapped
in spirituality and hype. NeverMinde's entire differentiation is being the **dry,
logical version of the same material**. This also reinforces the locked brand
decision (see `COPY_BRIEF.md §2`): NeverMinde must **not** inherit EIP's voice,
even though it inherits the topic list.

The surrounding **therapy** sites (awake.co.il, tipulpsychology, betipulnet,
camoni) supply the other register to avoid: "טיפול טבעי וקל", "כלים וטכניקות",
"להרגעת חרדה", "שחרור", "מקום בטוח, תמיכה ואוזן קשבת". Mainstream advice content
(ynet menta, agogo, hidabroot) supplies the **coaching/mindfulness** register:
"תרגול תודה", "רוטינת בוקר וערב", "התכוונות", "טכניקת 5-4-3-2-1 חושים".

**Conclusion:** the audience is saturated with three registers NeverMinde rejects
— therapeutic, spiritual/hype, and coaching/mindfulness. The white space is
*logical and dry*. The copy strategy's restraint is not a stylistic preference;
it is the actual market differentiator.

---

## 5. Raw Observation Notes (per query)

- **Anxiety / intrusive thoughts:** dominant, evergreen. A standout phrasing:
  "מחשבות לא הגיוניות וOCD (**אך מודע לכך**)" — people explicitly say they *know*
  the thought is illogical but can't stop it. This is a direct hook for the
  fact/story method: they already feel the gap between a thought and reality.
- **Overthinking:** "המחשבות שלא מפסיקות לרוץ", "איך להפסיק לחשוב יותר מדי",
  "גלגל את המחשבות". The surrounding advice frames it as *calming* — NeverMinde
  reframes it as *separating thought from fact*.
- **Relationships:** "למה אנחנו רבים", and the therapy framing "ריבים בזוגיות
  בזמן מלחמה". Audience asks the why; advice supplies emotional comfort.
- **Money / work / stuck:** hasolidit threads — "לחץ בהייטק", "תקוע",
  "פריקה, מותש, מה לי וכל הדבר הזה", "לא מרגיש בנוח לדבר על כסף", "מה לעשות
  כשלא רוצים לעשות כלום". Strong "stuck/exhausted" vocabulary.
- **Meaning / existential:** "מה הטעם", "למה אני פה", "תסכול קיומי ואדישות",
  "דיכאון קיומי". Framed clinically by the sites that rank for it.
- **Free will / self-inquiry (EIP):** "האם קיים רצון חופשי", "מהו רצון אמיתי",
  "קבלת החלטות מתוך אחדות", "מודעות עצמית, חקירה רגשית, למה אתה חי, להבין את עצמך".
  EIP already uses **מנגנון**-adjacent framing — useful: the audience trained on
  EIP knows this vocabulary.

---

## 6. If A Real-Time Snapshot Is Needed Later (Plan)

To actually fulfil the `last30days` "last 30 days" promise, the environment needs:
1. **Python 3.12+ installed** so `scripts/last30days.py` can run.
2. Optional API creds for deeper coverage (X auth tokens, ScrapeCreators for
   TikTok/IG). Reddit/HN/Polymarket work keyless but are English-dominant and
   will return little for Hebrew topics.
3. For Hebrew specifically, the skill itself prescribes `--web-backend brave`
   (only backend that indexes Hebrew web) and warns Reddit/HN/GitHub will be ~0.

Until then, the evergreen vocabulary map in `AUDIENCE_LANGUAGE_REPORT.md` is the
working basis, and it is sufficient to steer copy.
