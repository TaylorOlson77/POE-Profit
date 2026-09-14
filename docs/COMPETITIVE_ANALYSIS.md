# Competitive & Product Analysis — POE Profit

| Field | Value |
| --- | --- |
| Status | Research draft |
| Date | 2026-09-11 |
| Scope | PoE2-weighted market/product analysis + shared visual language |
| Related | [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md) |

This document treats the MVP as a **product bet under competitive pressure**, not only as a portfolio deliverable. It maps the ecosystem, compares competing ideas, and stress-tests where our current design may lose users even if the math is correct.

---

## 1. Executive summary

**What we are building:** a personal farming-run accounting tool — Strategy → Run → Investment/Revenue lines → profit & efficiency metrics — with explicit duration methods and price snapshots. Spreadsheet replacement first; evidence platform later.

**Market reality:** most PoE players do **not** diligently log farms. They consume **ranked claims** (Maxroll tier lists, Exiled Tools div/hr boards, Emperyan “Based or Cringe” videos) and only a thin power-user cohort maintains spreadsheets or session trackers.

**Closest direct peers (PoE2):** Juice Tools, JuiceJournal (stash-first), small web farm calculators, Google Sheets templates (including the atlas strat sheet that informed our MVP), and desktop “snapshot inventory” tools (e.g. DillaPoE2Stat-style automation).

**Strongest adjacent products:** Maxroll, Mobalytics, poe.ninja, FilterBlade, Path of Building / web planners, Exiled Tools. These own attention, SEO, and trust — they rarely own **personal observation logs**.

**Core product tension for us:**

| Bet | Risk |
| --- | --- |
| Manual, honest, auditable accounting | Higher friction than “live div/hr” dashboards; users may never finish a run entry |
| No live prices in MVP | Feels “worse than Juice Tools / Exiled Tools” on day one even if our philosophy is sound |
| No auth, public CRUD | Fine for portfolio; weak for real personal economy data |
| Evidence platform later | The market already wants **answers** (“what’s best now?”), not blank journals |

**Recommended framing for MVP success:** win on **trustworthy personal observations** and **clear methodology** (duration method + price snapshot + Strategy/Run split) — not on displacing Maxroll or poe.ninja. Treat Juice Tools as the product to study hardest; treat Emperyan/LootCalc as the **methodology** to productize.

---

## 2. Problem framing (jobs to be done)

Players (and creators) are trying to answer different questions:

| Job | Typical ask | Who serves it today |
| --- | --- | --- |
| **J1 — Decide what to farm** | “What’s best div/hr right now?” | Maxroll farming tier lists, Exiled Tools farming ranks, YouTube/Emperyan, Reddit |
| **J2 — Learn how to run a strat** | “What tablets / atlas / layout?” | Maxroll guides, Mobalytics mechanic guides, creators |
| **J3 — Price my loot** | “What’s this worth?” | poe.ninja, Currency Exchange, trade overlays |
| **J4 — Validate *my* results** | “Am *I* making money on *this* setup?” | Spreadsheets, Juice Tools, stash snapshot tools, Windows calculator on stream |
| **J5 — Challenge a public claim** | “Is that 40 div/hr real?” | Mostly discourse; weak tooling |

Our MVP targets **J4** primarily, with a long-term path toward **J5**. Adjacent hubs win **J1–J3** and will keep winning them. Competing as a “best farms” site without a data moat is a losing bet.

Inspiration sources called out by Taylor:

- **Emperyan — Based or Cringe:** timed samples, input costs, liquidation of loot, based/cringe verdict; methodology > polish.
- **Google Sheet** ([atlas strat tracker](https://docs.google.com/spreadsheets/d/1Vs_5opWTQqk0--RdMTPSA4IgzxfjwqjgG_BY-ZL55w8/edit?gid=1810859209#gid=1810859209)): cost/price tables + run accounting; flexible but high cognitive load.

---

## 3. Competitive landscape map

```text
                    CONTENT / AUTHORITY
                    (what should I play?)
                           ▲
                           │
              Maxroll ●    │    ● Mobalytics
                           │
                           │
   ECONOMY / PRICES ◄──────┼──────► BUILD PLANNING
   poe.ninja ●             │         PoB / planners ●
   Exiled Tools ●          │         FilterBlade (filters) ●
                           │
                           │
              Juice Tools ●│● JuiceJournal
              Farm calculators / Sheets
                           │
                           ▼
                    PERSONAL EVIDENCE
                    (what did *I* earn?)
```

### 3.1 Tiering

| Tier | Products | Relationship to us |
| --- | --- | --- |
| **Direct** | Juice Tools, JuiceJournal, PoE2 farm calculators, farming spreadsheets, inventory snapshot tools | Same job: measure farm profitability |
| **Near-adjacent** | Exiled Tools Farming, Maxroll Endgame Farming Tier List, LootCalc-style calculators | Compete for “farming decisions” mindshare; different data model |
| **Workflow neighbors** | poe.ninja, trade overlays, FilterBlade, PoB, Mobalytics | Users bounce between these; we are one hop in a chain |
| **Substitutes** | Emperyan videos + calculator, Discord bots, mental math, “vibes” | Often beat software on adoption |

---

## 4. Competitor briefs (BA view)

### 4.1 Juice Tools — juicetools.app (PoE2) — **closest product peer**

**What it is:** Session/loadout-first farming tracker: Waystones, Tablets, modifiers, drops, divine/hour, analytics, Discord auth, economy views, live vs historical valuation toggle.

**Why it resonates:**

- Speaks **PoE2 native language** (Waystone/Tablet loadout UI that feels like inventory).
- Reduces setup friction via **clipboard parse** (`Ctrl+Alt+C`) — huge advantage vs typing mods.
- Evolving toward **live pricing** and public browsing — answers “what are others running?”
- Built by a solo builder dogfooding hundreds of sessions — product feels “for mappers.”

**Where it is weaker (and where we can differentiate):**

- Loadout UX is powerful but **heavy**; empty-state first visit is intimidating (many optional fields before Start Map).
- Loot logging still friction-heavy; OCR/automation is hard (developer publicly notes this).
- “Divine equivalent” convenience can obscure **valuation honesty** (live vs historical) unless the user is careful — they added a toggle, which validates our snapshot concern.
- Less emphasis (from public surface) on **explicit duration methodology** (observed vs extrapolated vs manual) as a first-class labeled concept.

**Implication for us:** If our MVP is “spreadsheet but web” without loadout paste or pricing helpers, Juice Tools will feel more modern to the same user. Our wedge must be **methodology + correctness + Strategy/Run evidence**, not feature parity.

### 4.2 JuiceJournal — stash-first journal (PoE1 + PoE2 ambition)

**What it is:** Electron-style stash snapshot → session profit → map costs; poe.ninja pricing; Client.txt parsing; inspired by Torchlight Infinite trackers.

**Competing idea:** Don’t enter loot lines — **diff the stash**.

**Why this idea is strong:** Matches how many players *wish* profit worked (“I started with X, ended with Y”).

**Why it often fails in PoE2 right now:** GGG does not expose a full PoE2 stash API the way people want; automation drifts toward local sniffing/CV/overlays (ToS/maintenance risk). Our MVP **explicitly avoids** this — correct for scope, but users will still *want* it.

**Implication:** Stash-diff is the long-term “true profit” story (our roadmap V3). Until then, every manual tracker competes with the fantasy of zero-entry logging.

### 4.3 Exiled Tools — farming ranked by live div/hr

**What it is:** Economy command center + farming strategies **re-ranked hourly** from poe.ninja prices scaled against hand-authored cph anchors. Shows tablet setups, atlas master suggestions, demand/sold-per-day, profitability trend badges.

**Competing idea:** Don’t ask players to measure — **publish a live leaderboard of strategies**.

**Why this is popular:**

- Answers **J1** in one screen: “Best now” badge + big orange div/hr.
- Combines **setup recipes** (tablet mods) with **market motion** — actionable, not just numbers.
- Explicitly caveats that rates are baselines — good trust language (similar to our product philosophy).

**Why it can mislead (and why our product exists):**

- Anchors are **modelled**, not your sample.
- Ranges like `79–263 div/hr` train users to expect creator-tier ceilings.
- No personal execution variance (build, clear speed, deaths, trading time).

**Implication:** Exiled Tools (and Maxroll tier lists) set **expectation inflation**. Our UI must make “my observed run ≠ their modelled rank” obvious, or users will distrust *us* when numbers are lower.

### 4.4 Maxroll — editorial authority hub

**What it is:** Guides, planners, tier lists, farming strategy articles, campaign walkthroughs. Endgame Farming Tier List ranks popular methods and links out to how-to content.

**Competing idea:** Trust **signed experts** and maintained guides.

**Why Maxroll wins attention:**

- SEO + brand + creator roster.
- Complete journeys (leveling → endgame → farm).
- Farming content is **editorial**, not personal ledgers.

**Why Maxroll is not our competitor for J4:** They optimize for reading and following, not logging 40 Waystones of loot.

**Implication:** Partner/complement positioning beats “Maxroll killer.” Long-term V4/V5 “evidence for published claims” is the only honest collision course with Maxroll farming articles — and that requires community data we don’t have in MVP.

### 4.5 Mobalytics — creator + tracker platform

**What it is:** Verified/community builds, web planner, **live build tracker**, gamification (reward pass), multi-game shell.

**Competing idea:** Keep the player inside one platform with progress tracking and creator affiliation.

**Why it works:** Low friction discovery + social proof + integrated planner (vs jumping to PoB).

**Relevance:** Shows that **tracking** sells when tied to a high-frequency habit (following a build). Farming session logging is lower frequency and higher effort — harder habit to form.

### 4.6 poe.ninja — economy source of truth

**What it is:** League-scoped economy from Currency Exchange (PoE2) with clear delay caveats; builds/tree tools adjacent.

**Competing idea:** Be the **price feed**, not the farm log.

**Why it dominates:** Single place everyone cites; API gravity well for every tracker.

**Implication for ADR-004 (manual prices):** Philosophically strong; **commercially cold**. Users compare us to tools that auto-fill from ninja. MVP should still ship manual snapshots, but UX must make entry fast (catalog, recent prices, paste helpers) or abandonment is likely. V2 price integration is almost table-stakes for retention.

### 4.7 FilterBlade / PoB / trade overlays

**Not farm trackers** — but they define the **visual and workflow language** of the ecosystem (dark UI, gold/teal accents, dense tables, second-monitor apps). Players already Alt-Tab between these; another dense tool is acceptable if value is clear.

### 4.8 Spreadsheets & Emperyan methodology

**Spreadsheet strengths:** Infinite flexibility, free, familiar, shareable templates, league-specific tabs.

**Spreadsheet weaknesses:** Error-prone formulas, no enforced duration method, broken copies, no validation, ugly UX, hard to compare runs cleanly.

**Emperyan pattern (productized):**

1. Declare strategy + inputs (scarabs/tablets, map cost, rolling).
2. Run a **sample** (often tens of maps).
3. Time the block (or extrapolate).
4. Value loot (often liquid + haircut illiquid).
5. Subtract costs → **div/hr** → based/cringe.

Our ADR-006 (extrapolated default) is culturally aligned with this. That is a **real differentiator** vs dashboards that hide time assumptions.

### 4.9 LootCalc / “evidence-first calculators”

**Competing idea:** Pure accounting transform — no fake drop multipliers; observed vs what-if labeled; negative profit allowed.

**Why this matters:** Philosophically almost identical to our MVP calculation engine. Validates that **honesty UX** is a niche some players care about — but it is niche.

---

## 5. Competing product ideas (and which tend to win)

These are **alternative product shapes** we could have chosen (or may evolve into). Popularity correlates with **lower friction** and **faster answers**, not better truth.

| Idea | Description | Why it can win | Why it can lose | Fit for our MVP |
| --- | --- | --- | --- | --- |
| **A. Personal run ledger** (us) | Manual costs/loot, snapshots, metrics | Auditable; teaches methodology; portfolio-friendly | High entry cost; habit rare | ✅ Chosen |
| **B. Loadout + session tracker** (Juice Tools) | Parse waystone/tablet, log maps, auto-ish pricing | Feels native to PoE2; sticky for juicers | Complexity; loot still hard | Steal patterns later |
| **C. Stash snapshot PPH** (JuiceJournal / Dilla-style) | F2/F3 inventory diff | Near-zero typing | API/ToS/CV fragility; “true profit” debates | Roadmap V3 |
| **D. Live strategy leaderboard** (Exiled Tools / Maxroll tiers) | Modelled or editorial ranks | Massive traffic; SEO; dopamine | Not personal evidence | Don’t compete head-on |
| **E. Creator evidence pages** | Emperyan-like runs published as structured data | Trust + entertainment | Needs creators + samples | Vision V4–V5 |
| **F. Spreadsheet template** | Google Sheet with prices | Zero install; already adopted | Quality ceiling; no product moat | Our displacement target |
| **G. What-if juicer calculator** | Enter mods/quant, estimate div/hr | Fun planning; shareable | False precision (LootCalc warned against this) | Explicitly avoid in MVP |

**Why popular sites beat “better math”:**

1. **Answer latency** — rank/list in &lt;5 seconds beats a blank form.
2. **Habit attachment** — builds/filters/prices are used every session; farm logs are not.
3. **Social proof** — signed authors, “BEST NOW,” creator faces.
4. **Automation** — clipboard, APIs, overlays reduce Alt-Tab pain.
5. **SEO/content** — Maxroll/Mobalytics own Google; tools without content stay invisible.

---

## 6. Stress test: why *our* MVP / product design might underperform

This section is intentionally critical. Portfolio goals can still succeed even if market adoption is thin — but we should not confuse the two.

### 6.1 Friction: manual line items after every farm

**Risk:** Logging investment + categorized revenue + unit prices + timestamps is slower than a Sheet with copy/paste rows — or than “I watched Emperyan and I’ll try that.”

**Counter-signals in market:** Juice Tools still struggles with loot entry; automation projects pitch “stop using Excel” specifically because manual entry fails.

**Mitigations (without breaking non-goals):**

- Aggressive defaults: recent items, last-run clone, category templates per strategy.
- “Sample timing” UX that matches Emperyan (10 maps / 20 min) as a guided flow.
- Import CSV from the sheet Taylor already uses (future micro-feature).

### 6.2 Manual pricing feels outdated next to live feeds

**Risk:** Players compare screenshots: Exiled Tools shows live div/hr; we ask for Divine rate and every line’s chaos value.

**Why we still chose it (ADR-004):** Historical honesty. Correct — and still a **retention risk**.

**Mitigation path:** Keep snapshot model; add optional “fill from poe.ninja as of now” later that **writes a snapshot**, never live-rewrites history.

### 6.3 No auth + public deploy

**Risk:** Real users will not put league economy data on a public CRUD app. Demo data only → weak real dogfooding story unless Taylor runs a private instance.

**Mitigation:** Document private deploy; treat public URL as portfolio demo with seed data.

### 6.4 Strategy/Run separation may feel like ceremony

**Risk:** Spreadsheet users think in “tabs per strat” or one mega sheet. Forcing Strategy create before Run can feel like busywork for “I just want to log tonight’s maps.”

**Why we still want it (ADR-005):** Analytics later. For MVP UX, offer **“Quick run”** that auto-creates/uses a default strategy to reduce ceremony.

### 6.5 Duration methods are correct but cognitively heavy

**Risk:** Three methods + sample fields is more than competitors show. Users may ignore labels and compare incompatible div/hr figures — undermining our philosophy.

**Mitigation:** Default Extrapolated with a short explainer; always show method chip on history; never sort mixed methods without disclosure.

### 6.6 We optimize for truth; market optimizes for aspiration

**Risk:** Honest negative profit and modest div/hr feel “broken” next to `200+ div/hr` headlines.

**Mitigation:** Copy and empty states that normalize variance; show sample size; separate “lucky spike” items (Emperyan/expcarry-style reporting hygiene).

### 6.7 Category model may lag PoE2 item reality

**Risk:** MVP categories (oils, fossils, etc.) lean PoE1-shaped. PoE2 loot is omens, tablets, distilled emotions, runes, soul cores, etc.

**Mitigation:** Data-driven categories (already in spec) — seed **PoE2-first** catalog for MVP UI.

### 6.8 Direct competitor already occupies the niche

**Risk:** Juice Tools is live, PoE2-native, adding auth/pricing/social. A second farm tracker needs a crisp wedge or it looks like a duplicate portfolio clone.

**Our wedge (defendable):**

1. Explicit **duration methodology** as a product feature, not an afterthought.
2. **Price snapshot / valuation type** honesty (market vs paid vs sold).
3. Calculation engine **testability** and transparent formulas (QA story + user trust).
4. Strategy vs Run domain ready for comparison/evidence — even if UI is simple.
5. Portfolio-grade quality bar (tests, CI, ADRs) — not a growth claim.

### 6.9 Long-term vision depends on network effects we don’t have

**Risk:** “Community evidence platform” needs supply of runs. Without creators or incentives, V4 is empty.

**Mitigation:** MVP success = **Taylor (and maybe a few friends) actually log runs for a league**. Dogfood metrics matter more than roadmap slides.

### 6.10 Cold start / SEO

**Risk:** Nobody finds a ledger app via Google when Maxroll owns “PoE2 farming.”

**Mitigation:** Distribution via Reddit/Discord with a **methodology angle** (“extrapolated timing + snapshots”), not “another tracker.”

---

## 7. Positioning options

| Position | One-liner | Pros | Cons |
| --- | --- | --- | --- |
| **P1. Honest farm lab** | “Record observations, not promises.” | Aligns with MVP_SPEC philosophy; distinct from Exiled Tools | Narrow appeal |
| **P2. Spreadsheet replacement** | “Your farm sheet, but it can’t break the math.” | Clear migration story | Competes with “good enough” Sheets |
| **P3. Creator methodology tool** | “Based or Cringe, structured.” | Emotional hook; Emperyan-adjacent | Creator co-marketing hard |
| **P4. Juice Tools alternative** | Feature race on loadouts/pricing | Familiar category | Likely lose |

**Recommendation:** Lead with **P1 + P2** for MVP messaging; keep **P3** as narrative for landing page inspiration; avoid **P4**.

---

## 8. Design & visual language (shared palette)

PoE community sites converge on **dark fantasy utility UI**: near-black surfaces, warm or cool dark panels, one metal accent (gold/amber/bronze), high-contrast numbers, dense tables, game art in heroes — not pastel SaaS.

### 8.1 What popular sites do

| Site | Feel | Accent | Notes |
| --- | --- | --- | --- |
| **Maxroll** | Charcoal editorial | Orange + category colors | Hero art, tool tiles, filter pills |
| **Exiled Tools** | Data terminal | Amber/orange KPIs | Big div/hr, green/red deltas, ticker |
| **Juice Tools** | Modern product dark | Teal/seafoam CTAs | Inventory-like loadout slots |
| **poe.ninja** | Atmospheric dark | Neon green active states | League cards, BG art, minimal chrome |
| **Mobalytics** | Multi-game dark | Gold CTAs + purple accents | Gamification side rail |
| **poe2-helper CSS** | Warm PoE browns | Gold `#c9a961` | Explicit “PoE aesthetic” tokens |

### 8.2 Recommended shared palette (landing + app)

Prefer **warm PoE metal** over generic purple SaaS or pure teal clone of Juice Tools.

```css
:root {
  /* Surfaces */
  --bg-deep: #0a0a0a;
  --bg-panel: #14110e;
  --bg-elevated: #1c1712;
  --bg-hover: #2a2218;
  --border-subtle: #3d2f1f;
  --border-strong: #6b4e2a;

  /* Brand metal */
  --accent: #c9a961;       /* primary actions, brand wordmark */
  --accent-soft: #e0c17d;
  --accent-dim: #a88942;

  /* Text */
  --text: #e8dcc4;
  --text-muted: #b8a888;
  --text-faint: #7a6f5d;

  /* Semantic (profit UI) */
  --profit: #5a9e6f;
  --loss: #c45c5c;
  --warn: #c4a35a;
  --info: #6a8cae;         /* duration method chips, links */

  /* Optional category accents (sparingly) */
  --cat-currency: #d4af37;
  --cat-tablet: #7cb8a0;
  --cat-waystone: #8aa0c8;
}
```

**Usage rules:**

- Gold for brand + primary CTA only — not every heading (avoid red/gold overload).
- Profit/loss green/red for **numbers**, not decoration.
- Duration method = neutral info chip (blue-gray), always visible.
- Backgrounds: subtle warm gradient or restrained texture; landing may use full-bleed PoE2-style art; **app** stays flatter for spreadsheet readability.
- Typography: distinctive display for brand (landing); clean readable sans for tables (app). Avoid Inter-as-default if a better pair is easy (e.g. display + `Source Sans` / `IBM Plex Sans`).

### 8.3 Alternative accent directions (if gold feels too “official PoE”)

| Direction | Accent | When to use |
| --- | --- | --- |
| **A. Warm gold (recommended)** | `#c9a961` | Strongest genre fit |
| **B. Amber terminal** | `#ffb300` | Exiled-Tools-like KPI energy |
| **C. Teal juice** | `#14b8a6` | More “modern SaaS tracker”; closer to Juice Tools |

Pick **one** accent family for both landing and app.

---

## 9. Landing page & user flow ideas

### 9.1 Landing page (first viewport)

Goal: communicate **honest farm accounting**, not a content hub.

Suggested hero content (one composition):

1. Brand name (hero-level).
2. One line: “Log farming runs with costs, loot, and timing you can trust.”
3. Supporting: “Snapshots and duration methods — observations, not promises.”
4. CTA: **Start a run** / **View demo strategies**.
5. Dominant visual: PoE2 endgame atmosphere (waystone/atlas mood), full-bleed — not a collage of feature cards.

Below fold (not first viewport): sample run summary (profit, profit/hr, method chip), short “vs spreadsheet” comparison, methodology explainer.

**Avoid:** Maxroll-style mega nav of guides; Mobalytics reward-pass clutter; fake “200 div/hr” marketing.

### 9.2 Core app user flows

**Flow A — First-time happy path**

```text
Land → Demo data OR create Strategy → New Run
  → Duration: Extrapolated (sample maps + sample minutes)
  → Waystones completed
  → Add investment lines (template from strategy defaults)
  → Add revenue by category
  → Save → History row with method chip + profit/hr
```

**Flow B — Returning juicer (habit)**

```text
History → Clone last run → Adjust qty/prices/timing → Save
```

Clone/last-run is critical; without it we lose to Sheets.

**Flow C — Compare (post-MVP but design for it)**

```text
Strategy page → list runs → filter same duration method → median profit/hr
```

### 9.3 UX patterns to steal (not copy blindly)

| Pattern | From | Apply how |
| --- | --- | --- |
| Big KPI number | Exiled Tools | Profit / profit/hr hero on run detail |
| Method / data freshness labels | Exiled + poe.ninja | Duration method + price-as-of |
| Inventory slots | Juice Tools | Optional later for tablets; MVP can stay tabular |
| Category color rails | Maxroll | Subtle left border on revenue categories |
| League selector | Everyone | Even if single-league MVP, leave space in chrome |
| Empty-state tour | Juice Tools | One short tour; don’t block entry |

### 9.4 UX patterns to avoid

- Requiring account before value (Juice Tools allows anonymous local — good; our no-auth is fine for demo).
- Fake precision calculators (LootCalc’s warning).
- Leaderboard cosplay without data.
- Over-carded dashboards that bury the spreadsheet-like run entry (our primary screen should feel like a **smart sheet**).

---

## 10. Strategic recommendations

### Do now (aligns with MVP)

1. **Defend the wedge in UI copy:** observations, duration method, price snapshots.
2. **PoE2-first catalogs/categories** (tablets, omens, etc.).
3. **Speed features that aren’t “integrations”:** clone run, strategy defaults, recent items.
4. **Visual system:** warm dark + gold accent shared by landing and app.
5. **Dogfood:** Taylor logs real PoE2 farms for a stretch; fix friction that blocks that.

### Do next (still product-sensible)

1. Optional poe.ninja **snapshot fill** (writes immutable values).
2. Waystone/Tablet paste import (learn from Juice Tools).
3. Private auth when personal data matters.

### Don’t

1. Chase Maxroll/Mobalytics content surface area.
2. Ship modelled “best farms” ranks without personal data.
3. Promise stash-true profit in MVP.
4. Position as “Juice Tools but unfinished.”

---

## 11. Opportunity scorecard (subjective)

| Opportunity | Score (1–5) | Note |
| --- | --- | --- |
| Replace personal spreadsheet | 4 | Clear; limited TAM |
| Beat Juice Tools on loadout UX | 2 | They are ahead |
| Own “methodology honesty” niche | 4 | Differentiated, small |
| Become default farm decision site | 1 | Exiled/Maxroll/YouTube win |
| Evidence platform for creator claims | 3 | High upside, needs network |
| Portfolio demonstration of QA/product | 5 | Strong regardless of TAM |

---

## 12. Open questions for the team

1. Is MVP success **dogfooded league usage**, **portfolio hiring signal**, or **public adoption**? (Priority order changes UX investment.)
2. Do we want landing tone closer to **Emperyan lab** or **Exiled terminal**?
3. Should V1.x include **clone run + item autocomplete** before any price API?
4. How PoE2-specific should default categories be before PoE1 support?

---

## 13. Sources (research pass)

- Juice Tools — https://juicetools.app/
- JuiceJournal — https://github.com/JuiceJournal/JuiceJournal
- Exiled Tools Farming — https://www.exiledtools.com/farming
- Maxroll PoE2 — https://maxroll.gg/poe2 (incl. Endgame Farming Tier List)
- Mobalytics PoE2 — https://mobalytics.gg/poe-2
- poe.ninja PoE2 economy — https://poe.ninja/poe2/economy
- LootCalc PoE currency profit calculator — https://lootcalc.com/games/poe/currency-profit-calculator
- Emperyan “Based or Cringe” playlist / methodology discussion in community
- Atlas strat Google Sheet (Taylor) — https://docs.google.com/spreadsheets/d/1Vs_5opWTQqk0--RdMTPSA4IgzxfjwqjgG_BY-ZL55w8/edit
- Maxroll vs Mobalytics comparison — https://thegamercodex.com/en/path-of-exile-2/compare/maxroll-vs-mobalytics
- poe2-helper dark gold CSS reference — https://github.com/nicolasbagatello/poe2-helper

---

## 14. Bottom line

The market rewards **fast answers and low friction**. Our MVP rewards **correct, labeled personal observations**. That is a coherent niche — especially as a portfolio + dogfood product — but it will **not** out-compete Maxroll, poe.ninja, or even Juice Tools on popularity metrics unless we either (a) reduce entry friction aggressively within non-goals, or (b) lean hard into methodology storytelling that Emperyan fans already understand.

Treat **Juice Tools** as the product benchmark, **Exiled Tools/Maxroll** as the expectation-setters we must emotionally counter in UX, and **Emperyan + your spreadsheet** as the workflow we are formalizing.
