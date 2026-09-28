# Future Features & Ideas

| Field | Value |
| --- | --- |
| Status | Idea backlog (not a phase) |
| Started | 2026-09-11 |
| Rewritten | 2026-09-28 |
| Related | [`PHASES.md`](./PHASES.md), [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md) |

Ideas that are not in [`PHASES.md`](./PHASES.md). None of this is scheduled. The brainstorm command appends here when Taylor keeps an idea and does not accept a phase.

A phase is an agreement to build. An idea in this file is not. When an idea becomes a phase, it moves to `PHASES.md` and leaves this file.

## Already a phase

These are not repeated below. See [`PHASES.md`](./PHASES.md).

- A tablet's price split across its uses
- Session logging as category totals, divine input, extrapolated time, and costs filled in from the strategy
- Your compiled results, and leaving your own session out of them
- Live strategy cost on the dirty form (former FF-005)
- Unsaved-session warning, sort history by profit per hour, hide a strategy that still has sessions
- The public board: accounts, read-only demo, demo seed, publish, like, run, session lists, the same compilation on valid public sessions, owner exclude, and the far-off confirm

---

## How to use this file

For each idea, keep:

- **Status** — Idea | Proposed | Parked | Rejected
- **Horizon** — after which phase, or "unknown"
- **Summary**, **Why**, **Risks**, **Open questions**

The brainstorm command uses that shape. Graduate a real decision to an ADR in `DECISIONS.md` only when a phase is accepted.

---

## FF-001: Creator pages, video links, and loot prefill past common categories

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | After phase 5 |
| Date | 2026-09-11 |
| Formerly | ADR-013. Publish, like, run, and common revenue categories moved to phase 5 on 2026-09-28. |

### Summary

What phase 5 does not take: a named creator page, a stable URL for a YouTube description, and revenue lines filled from the author's actual loot rather than from the categories that show up most often.

### Why

A viewer would open the same worksheet the creator logged, not only a claim in a video.

### Risks

- Cold start. The demo seed in phase 5 is the stand-in until real runs exist.
- Prefill that looks like guaranteed loot has to be labeled as someone else's observations.
- No scraping a creator's results without permission.

### Open questions

1. Who publishes a canonical creator strat: the creator, or a curator with written permission?
2. How many logged runs are enough before a YouTube link is honest?

---

## FF-002: Product name

| Field | Value |
| --- | --- |
| Status | Accepted as the name. Not a build idea. |
| Horizon | None |
| Date | 2026-09-12 |
| Related | ADR-001 |

The product name is **POE Profit**. The prophet pun is lore, not a rename. A tagline is copy, not an epic.

---

## FF-003: Buy-filter regex

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After the dry run |
| Date | 2026-09-12 |

### Summary

On a strategy, store the stash regex used to buy waystones or tablets, show it, and copy it. A later step can explain the pattern. Generators differ (poe2.re, poe.re, and others). This is not a regex builder.

### Why

The filter used to buy the maps lives in Discord today. A copied string is enough for someone repeating the setup.

### Risks

- Decoding community regexes is incomplete and patch-fragile. A wrong decode is worse than the raw string.
- PoE1 and PoE2 patterns differ.

### Open questions

1. One regex per strategy, or one per slot (waystone, tablet)?
2. Store and copy only, until a decode is trustworthy?

Phase A (store, show, copy) was a candidate phase and lost the sort on 2026-09-28. Decode stays behind it.

---

## FF-004: Truth-sayer vs Deceiver

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | After phase 5 likes exist. Not before. |
| Date | 2026-09-13 |

### Summary

A vote on a public strategy: Truth-sayer ("this matched what I got") or Deceiver ("it did not"). Counts sit beside run evidence. They do not replace logged sessions.

### Why

Liking says "I kept this." It does not say the runs matched the claim.

### Risks

- People vote because the strat is hard, or because they dislike the creator, without logging a run.
- A Deceiver pile can look like the site called the strat a scam.
- Needs one vote per account, and a scope so an old league does not haunt a reworked strat.

### Open questions

1. Can anyone vote, or only a player who logged a session on that strategy?
2. Is the pair Truth-sayer / Deceiver, or a softer pair?

Phase 5 reopened a favorite. It did not reopen this.

---

## FF-006: Deploy test report

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | Whenever. No player impact. |
| Date | 2026-09-27 |
| Related | [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) |

### Summary

A generated report for each deploy. The summary is the feature and the action, with a pass rate and counts by layer. The drill-down is the coverage page, each line marked manual, browser, API, or unit, plus pass or fail. Manual results are a short log: case file name, pass or fail, date, deploy. Cases added or updated come from the git diff of the catalog.

### Why

Actions history shows that CI ran. It does not say which behaviors were checked, including the few manual cases.

### Risks

- Hand-written counts will be skipped or wrong. The report has to be generated.
- Counting every unit test in the repo against one action overstates coverage.
- Committing every run log into the repo will get noisy.

### Open questions

1. GitHub Actions summary, GitHub Pages, or a release asset?
2. Where does the manual pass/fail line get entered so it stays small enough to fill in?

---

## FF-007: Strategy versions

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 5, once a public strategy has runs worth protecting |
| Date | 2026-09-28 |

### Summary

The owner saves a new version of a strategy for a tweak or a new league, with a reason. The new version is its own row on a list and competes on its own runs. Low-investment and high-investment versions can both rank. Clout does not move to the new row. The row says which strategy it is a version of. The owner can archive either version and keep the other on the list, or leave both up.

### Why

Editing in place makes new runs fight old runs. A brand-new strategy throws away the trail of evidence. Copying a strategy, which was a smaller idea, folds into this.

### Risks

- Two versions of one strat on a top list is correct for different setups and confusing if the link between them is easy to miss.
- Building this before two real versions exist protects a problem that has not happened.

### Open questions

1. Does archive hide the version, or remove it from ranking and leave the runs readable?
2. A league-by-league database backfill, if a later change must not break old versions, is an engineering consequence. It is not this idea.

---

## FF-008: The default board is the current league

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | With FF-007, or just before it |
| Date | 2026-09-28 |

### Summary

The public list shows the current league. Taylor adds a league name when one launches. The app does not watch for league announcements. A strategy from another league stays off that list. A new version (FF-007) is how a setup comes forward.

### Why

Old-league prices and drops are not this league's sample.

### Risks

- The board is wrong until someone adds the new league name.
- Labeling every old session with a league, without versions, was the smaller idea. Versions replaced it on 2026-09-28.

---

## FF-009: Logged-out leaderboard lists

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 5's far-off confirm |
| Date | 2026-09-28 |

### Summary

The logged-out home shows a few lists: highest average profit, low investment and high reward, and profiles with the most liked strategies. A list does not rank a strategy until it has a minimum number of valid public sessions. The far-off confirm from phase 5 has already run.

### Why

A visitor should be able to see which public strategies are actually paying, without an account.

### Risks

- One capped session wins a list that has no minimum and no confirm.
- "Low investment and high reward" needs a definition before anyone builds it. Profit per chaos spent, or profit per hour at a low cost per map, are different lists.
- Profiles need a public identity. Phase 5's like button does not build a profile.

### Open questions

1. What is the minimum run count?
2. Which ratio is the low-investment list?

---

## FF-010: A public session page

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 5 |
| Date | 2026-09-28 |

### Summary

Opening someone else's public session shows who ran it, a little about them, and the profit breakdown.

### Why

The strategy page lists sessions. It does not introduce the player who logged one.

### Risks

A public identity is more surface area than a display name on a session. Forgot-password and settings are still out.

---

## FF-011: One guide link on the strategy

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 5, or with FF-001 |
| Date | 2026-09-28 |

### Summary

A strategy stores one URL, shown on the strategy. This is the small cut of creator video links. It is not a creator page.

### Why

The video is how most players meet a strat. The app should be able to point back at it.

---

## FF-012: Cost drift from the strategy estimate

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 2 |
| Date | 2026-09-28 |

### Summary

A session shows how far its cost per map moved from the strategy's estimated cost per map.

### Why

The strategy says what a map should cost. The session says what it did cost, after the player edits the prefilled lines. Those two numbers are never put next to each other.

---

## FF-013: Chart, and compare two strategies

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 3 |
| Date | 2026-09-28 |

### Summary

Two later outcomes, kept together so they are not built as part of the compilation. A chart of profit per hour for one strategy. A comparison of two strategies by their logged sessions.

### Why

The compilation answers "did it pay?" A chart and a side-by-side are the next questions.

### Risks

Comparing runs that used different duration methods has to keep the method label. New sessions are extrapolated only. Old rows may not be.

---

## FF-014: Item lines as a faster logger

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | Unknown. The dry run does not enter item lines. |
| Date | 2026-09-28 |

### Summary

When a player types an item they have entered before, fill the last unit price. A saved item catalog is the heavier version.

### Why

It mattered if logging stayed item by item. Phase 2 logs a total per category.

### Risks

Building it beside category totals gives two ways to enter revenue. Do not build it unless a player is actually entering lines.

---

## FF-015: Download sessions as a spreadsheet

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | Unknown |
| Date | 2026-09-28 |

### Summary

Download session history as a spreadsheet.

### Why

It was the exit, if the app could not show whether a strategy paid. Phase 3 is that screen. The download stays here in case the dry run still lives in Excel.

---

## FF-016: Waystone tier on a session

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | Unknown |
| Date | 2026-09-28 |

### Summary

Record the waystone tier on the session. The MVP spec left tier off the strategy. Drops change with tier, so runs from different tiers are a weak sample when they share one number.

---

## FF-017: The time a price was paid

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | Only if Taylor reopens the 2026-09-28 amendment |
| Date | 2026-09-28 |

### Summary

A capture-time picker, so the stamp is when the player paid, not when they saved.

### Why it is parked

MVP pricing was amended on 2026-09-28: the recorded time is save time. There is no picker. Reopen that amendment in one line before this becomes an epic.

---

## FF-018: A review queue for flagged sessions

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | After phase 5's owner-exclude and far-off confirm |
| Date | 2026-09-28 |

### Summary

A flagged public session waits in a queue instead of only being excluded by the owner or confirmed by the player who posted it.

### Why

Owner-exclude and the far-off confirm close the dry-run version of bad data. A queue needs reviewers. There are none yet.

### Risks

A queue with nobody in it is a session that never becomes public.

---

## FF-019: A feed of every public session

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After phase 5 |
| Date | 2026-09-28 |

### Summary

One list of recent public sessions across strategies. Phase 5 shows sessions on the strategy they belong to.

---

## FF-020: PoE1 gaps

| Field | Value |
| --- | --- |
| Status | Idea |
| Horizon | After a PoE1 dry run shows a real gap. Not one phase. |
| Date | 2026-09-28 |

### Summary

Creating a PoE1 strategy already works. The form says Map and Scarab. Modifier notes are PoE2-only. Scarab uses stay 1 in phase 1. Later phases start from a gap the dry run hits: PoE1 revenue categories, PoE1 league names, or a scarab setup the tablet row does not cover. "PoE1 support" is not an epic.

---

## FF-021: Account recovery and GGG login

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | After phase 5 sign-in |
| Date | 2026-09-28 |

### Summary

Forgot password, a display name, settings, and GGG login. They are not stories on the sign-in epic.

---

## FF-022: Scale and hygiene

| Field | Value |
| --- | --- |
| Status | Parked |
| Horizon | When the pain shows up |
| Date | 2026-09-28 |

### Summary

Kept because the baseline named them, not because a player is blocked.

- Pagination, once history is long.
- Last-write-wins on PUT, once two people edit one row.
- Rate limits, once the public site is worth abusing.
- Prettier as a CI gate. `format:check` is not a gate today.
- The Prisma fake's `$transaction` does not roll back.

---

## Folded on 2026-09-28

Do not bring these back as new ideas unless the reason below is wrong.

| Idea | Where it went |
| --- | --- |
| Copy the last session, including its revenue | Phase 2 copies costs from the strategy. Copying last time's revenue invents a drop. |
| A personal dashboard with its own math | Phase 3 is the compilation. Phase 5 reuses it. |
| Split compiled stats by duration method | New sessions are extrapolated only. Old rows keep their method label. |
| Copy a strategy as its own epic | FF-007, versions. |

---

## Index

| ID | Title | Status |
| --- | --- | --- |
| FF-001 | Creator pages, video links, loot prefill past common categories | Parked |
| FF-002 | Product name | Accepted as the name |
| FF-003 | Buy-filter regex | Idea |
| FF-004 | Truth-sayer vs Deceiver | Parked |
| FF-006 | Deploy test report | Idea |
| FF-007 | Strategy versions | Idea |
| FF-008 | Current league is the default board | Idea |
| FF-009 | Logged-out leaderboard lists | Idea |
| FF-010 | A public session page | Idea |
| FF-011 | One guide link on the strategy | Idea |
| FF-012 | Cost drift from the strategy estimate | Idea |
| FF-013 | Chart, and compare two strategies | Idea |
| FF-014 | Item lines as a faster logger | Parked |
| FF-015 | Download sessions as a spreadsheet | Parked |
| FF-016 | Waystone tier on a session | Idea |
| FF-017 | The time a price was paid | Parked |
| FF-018 | Review queue for flagged sessions | Parked |
| FF-019 | A feed of every public session | Idea |
| FF-020 | PoE1 gaps | Idea |
| FF-021 | Account recovery and GGG login | Parked |
| FF-022 | Scale and hygiene | Parked |
