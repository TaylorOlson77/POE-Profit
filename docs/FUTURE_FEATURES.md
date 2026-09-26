# Future Features & Ideas

| Field | Value |
| --- | --- |
| Status | Living idea backlog (not committed scope) |
| Started | 2026-09-11 |
| Related | [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md) |

Ideas we might want in later phases. **None of this is MVP** unless explicitly Accepted in `DECISIONS.md` and pulled into a numbered release.

Former ADR-013 content lives here so proposed product bets stay out of the accepted ADR index until we commit.

---

## How to use this file

For each idea, keep:

- **Status** — Idea | Proposed | Parked | Accepted-into-roadmap | Rejected
- **Horizon** — rough phase (V1.x / V2 / V3 / …) or “unknown”
- **Summary**, **Why**, **Risks**, **Open questions**

When an idea is ready to become a real decision, graduate it to an ADR in `DECISIONS.md`.

---

## FF-001: Creator strategy pages, fork-to-run prefill, and video deep links

| Field | Value |
| --- | --- |
| Status | Proposed (idea) |
| Horizon | Post-MVP / V2–V5; may never ship |
| Date | 2026-09-11 |
| Formerly | ADR-013 in `DECISIONS.md` (moved here 2026-09-12) |

### Summary

Long-term path beyond personal spreadsheet replacement:

1. Someone records a **Strategy** and **Runs** with honest costs, loot, duration method, and price snapshots.
2. Results become roughly realistic evidence for that strat (not modelled div/hr boards).
3. Another player **copies** the strategy to try it.
4. The new **MapSession** is prefilled with:
   - Map / Waystone and Tablet / Scarab **cost line items** from the source strategy
   - **Common profit / revenue line items** from the original poster and/or other runners
5. Later: optional **poe.ninja** fill that **writes price snapshots** (ADR-004-compatible); later still: **stash API** / reconciliation if GGG exposes it.
6. **Creator distribution:** with permission, host a named creator’s strat (e.g. Emperyan, Fubgun) and give them a stable URL for YouTube — *“If you want to track results from this strategy yourself, use this link.”*

### Why

- Distinct from Maxroll guides and Exiled Tools modelled ranks: viewers **run the same worksheet**, not only watch a claim.
- Builds on Strategy vs MapSession (ADR-005) without changing MVP.
- Growth loop: creator link → fork → personal runs → better evidence.

### Risks / non-goals

- Cold start: needs quality strats + runs before “common drops” help.
- Prefill can look like guaranteed loot — must label priors vs observations.
- Needs auth, sharing, fork provenance, attribution — all out of MVP.
- No scraping creator results without permission.
- Not a modelled “best farms” leaderboard.

### Open questions

1. Who publishes a canonical creator strat — creator account only, or curator with written permission?
2. Forked runs opt-in to aggregates, or private until shared?
3. How are “common” revenue lines computed (frequency, median qty, league/patch)?
4. Minimum evidence bar before encouraging a YouTube link?

### MVP compatibility

Keep ADR-004 (snapshots), ADR-005 (Strategy/MapSession), ADR-006 (duration methods), ADR-008 (calculation engine). Prefer strategy-level defaults so template lines can appear later without rewriting math.

---

## FF-002: Product name — “POE Profit” (Poe Prophet)

| Field | Value |
| --- | --- |
| Status | Accepted (product name is **POE Profit**; prophet pun remains lore/tagline, not a rename) |
| Horizon | Branding lore / marketing copy |
| Date | 2026-09-12 |
| Related | ADR-001 (accepted product name: POE Profit; former working name: PoE Strategy Tracker) |

### Summary

Working brand idea: **POE Profit** — aurally close to **“Poe Prophet.”**

Intended double meaning:

- **Profit** — the site’s literal job (track farming profitability).
- **Prophet** — strategies carry *projected* returns; users treat a strat like a prophecy and then test whether it comes true with real runs.

### Why it might work

- Memorable wordplay; easy to say in a YouTube description.
- Ties claim (“prophecy”) to evidence (“did you profit?”) — matches product philosophy.
- Shorter and punchier than “PoE Strategy Tracker.”

### Risks / caveats

- Spelling/SEO: people may search “poe prophet,” “poe profit,” or “poe.profit” inconsistently.
- “Prophet” can sound like we **promise** future returns — conflicts with “observations, not guarantees” unless copy is careful (*test the prophecy*, not *guaranteed profit*).
- Trademark / confusion: check collisions with existing PoE tools, Discord bots, or channels.
- Domain/handle availability (`poeprofit`, `poe-profit`, etc.) unknown until checked.
- Portfolio clarity: “Profit” is clear; the prophet pun may need a tagline to land (e.g. *Track the prophecy. Prove the profit.*).

### Open questions

1. Prefer stylized **POE Profit**, **PoE Profit**, or a prophet-forward mark (**Poe Prophet** with Profit as subtitle)?
2. Keep provisional name through MVP and rename only if the pun still feels right after dogfooding?
3. Any conflict with ADR-001 portfolio materials if we rename mid-project?

### Notes (team reaction placeholder)

Taylor floated the idea 2026-09-12; positive directionally, not locked. See chat / revisit before any rename ADR.

---

## FF-003: Strategy buy-filter regex — paste, decode, display, copy

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | V1.x–V2 (after strategy detail UX exists); pairs well with FF-001 fork flow |
| Date | 2026-09-12 |

### Summary

When PoE players buy Waystones / maps / Tablets (or PoE1 maps / scarabs), they often use a **stash/trade regex** from generators such as:

- PoE2: [poe2.re](https://poe2.re/waystone) (Waystones, Tablets, etc.)
- PoE1: [poe.re](https://poe.re)
- Others: Path of Codex, Exile Town Regex, etc.

**Idea:** On strategy create/edit, when defining the map-like / enhancement loadout for the strat, the author can **paste the regex they used when purchasing**. The app:

1. **Stores** the raw regex string(s) on the strategy (and optionally per slot: waystone vs tablet).
2. **Decodes / explains** the pattern into human-readable modifier requirements (e.g. min rarity %, min quantity %, wanted mods, excluded mods) in a box beside the map/waystone (and tablet) on the strategy view.
3. Offers **Copy regex** so someone replicating the strategy can paste the same filter into in-game Ctrl+F or trade search.

Complements FF-001: forked strategies carry not only cost lines but the **exact buy filter** the creator used.

### Why it might work

- Regex is already part of the juicing workflow; documenting it on the strat reduces “what did they roll/buy?” Discord back-and-forth.
- Readable decoded mods help viewers who do not speak regex.
- One-click copy is high leverage for creator links and forks.
- Differentiates from pure profit ledgers and from sites that only show tablet mod *text* without the purchasable filter string.

### Risks / caveats

- **Decode is hard:** community regexes are compressed, game search is ~50-char limited, patterns use shortened mod fragments; reverse-mapping to full mod names is incomplete and patch-fragile.
- Generators differ (include vs exclude bad mods, quant floors, etc.); one decoder will not cover every dialect.
- False confidence: a decoded box that misses a clause is worse than showing raw regex only.
- PoE1 vs PoE2 regex corpora differ — needs game-aware parsing (ADR-002).
- Scope creep: building a full poe2.re competitor is out of scope; we should **store + display + best-effort explain**, and link out to generators for authoring.

### Suggested phased approach

| Phase | Ship |
| --- | --- |
| A | Store raw regex + label; **Copy** button; show monospace string on strategy view |
| B | Best-effort decode using known fragment → mod dictionaries (league/patch versioned); show “interpreted as” with confidence / unmatched segments |
| C | Optional “Open in poe2.re / poe.re” deep link if upstream supports share URLs; still not our generator |

Phase A alone is already useful and low risk.

### Open questions

1. One regex per strategy, or separate fields (waystone buy filter vs tablet buy filter vs “avoid these mods”)?
2. Do we attempt decode in MVP-adjacent V1.x, or only store/copy until dictionaries exist?
3. Should runs snapshot the regex used at farm time (filters change mid-league)?
4. License/attribution when linking or mirroring mod text from community tools / GGG trade stat APIs?

---

## FF-004: Strategy signals — Truth-sayer vs Deceiver (prophecy-themed voting)

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After public strategies exist (pairs with FF-001 + FF-002 branding); not before auth |
| Date | 2026-09-13 |

### Summary

Community signal on a shared strategy, themed to the **Poe Prophet / POE Profit** brand instead of generic upvotes:

| Action | Label (working) | Meaning |
| --- | --- | --- |
| Positive | **Truth-sayer** | “This prophecy held up for me” / claim matched observed results |
| Negative | **Deceiver** | “This prophecy misled” / claim did not match what I got |

Displayed as counts or a net “prophecy score” on the strategy page (exact UI TBD). Intended as social proof / warning alongside run evidence — not a replacement for logged runs.

### Why it might work

- Makes the brand sticky: voting *is* the prophet metaphor (did the prophecy tell truth or deceive?).
- More emotionally legible than 👍/👎 for a farming-claim site.
- Complements FF-001: creators care about reputation; runners get a quick community pulse.
- Fits product philosophy if framed as **subjective signal**, with hard evidence (runs, sample size, duration method) still primary.

### Risks / caveats

- **Brigading / vibes voting:** people downvote because the strat is hard, RNG-unlucky, or they dislike the creator — not because the methodology was false.
- **Conflicts with “observations not promises”:** a big Deceiver pile can look like the *site* judged the strat fraudulent when voters never logged a run.
- **Auth + abuse:** needs accounts, rate limits, maybe one vote per user per strategy (and ideally per league/patch).
- **Creator chill:** strong Deceiver labels may scare the Emperyan/Fubgun-style partnerships in FF-001 unless tone stays playful and evidence-linked.
- **Naming polish:** “Truth-sayer” / “Deceiver” are vivid; confirm they don’t read as moral condemnation. Alternatives if needed: *Fulfilled / Broken*, *Based / Cringe* (Emperyan-adjacent), *Holds / Misses*.

### Suggested design guardrails (if built)

1. Prefer votes **tied to having forked or submitted a run** on that strategy (“vote after you tested”) over drive-by clicks.
2. Always show **run stats beside** the signal (N runs, median profit/hr, duration methods) so social score doesn’t outrank evidence.
3. League/patch-scope votes so an old league Deceiver doesn’t haunt a reworked strat.
4. Soft copy: *community labeled this prophecy…* — not *this strategy is a scam*.

### Open questions

1. Can anyone vote, or only users with a linked run / fork on that strategy?
2. Show separate Truth-sayer / Deceiver counts, a single net score, or both?
3. Optional short reason tags on Deceiver (RNG, costs drifted, unclear guide, bad sample) to make signals actionable?
4. Rename pair for tone — keep Truth-sayer/Deceiver, or softer Based/Cringe / Holds/Misses?

---

## FF-005: Live strategy cost preview on the form

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After the thin strategy UI (post-E1) |
| Date | 2026-09-26 |

### Summary

On the strategy create/edit form, show each enhancement line total and the estimated cost per waystone/map while the inputs are dirty, before save. E1 shows those figures only from the last API response.

### Why

The setup cost should be visible while editing tablet or scarab quantities and prices, without a save round-trip.

### Rule

Call `calculateStrategyCosts` in the shared engine (ADR-008). Display with `roundForDisplay`. The saved strategy and the list still come from the API response. Do not add a second formula in the UI.

### Out of scope

MapSession totals stay API-displayed (E2).

### Open questions

1. Update on each keystroke, or when a cost field blurs?
2. Should a dirty form mark the preview as unsaved so it is not confused with the last saved total?

---

## Index

| ID | Title | Status |
| --- | --- | --- |
| FF-001 | Creator strategy fork/prefill + video deep links | Proposed |
| FF-002 | Name candidate: POE Profit / Poe Prophet | Idea |
| FF-003 | Buy-filter regex paste, decode, display, copy | Idea |
| FF-004 | Truth-sayer vs Deceiver strategy signals | Idea |
| FF-005 | Live strategy cost preview on the form | Idea |
