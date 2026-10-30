# Phases — POE Profit

| Field | Value |
| --- | --- |
| Status | Agreed (2026-09-28) |
| Applies | What to build after MVP v1, and in what order. |
| Related | [`PRODUCT.md`](./PRODUCT.md), [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md), [`MVP_SPEC.md`](./MVP_SPEC.md) §4, [ADR-008](./DECISIONS.md), [ADR-011](./DECISIONS.md) |
| Next epic | The README shows CI status and the latest Playwright report |

v1 is live. Phase 1 shipped on 2026-10-23. These are the next phases. [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) holds everything that did not make a phase.

`plan-epic` reads one phase, confirms the epics, then writes tickets for one epic. The rules are [`PRODUCT.md`](./PRODUCT.md). It does not start a later phase while an earlier one is open, except where this file says a phase can overlap. Tickets and acceptance criteria are written in that command, not here.

A documented MVP non-goal stays closed unless this file says Taylor reopened it.

## Reopened for a later phase

Taylor reopened these on 2026-09-28. They are phase 5. They are not the next epic.

- **Authentication.** Accounts are app-layer auth in the same Postgres, not Neon Auth (ADR-011). The epic that closes is "Sign in with an email account."
- **A public strategy list, and logging a session on someone else's strategy.** This is the community-submissions non-goal, reopened only that far.
- **Liking a strategy.** This is a favorite. Comments, follows, profiles, leaderboards, and Truth-sayer votes stay closed.

Still closed: poe.ninja and other automatic pricing, the GGG API, stash reconciliation, an atlas simulator, image recognition, automatic strategy import, and advanced stats.

## 1. A tablet costs what it lasts

**Shipped** on 2026-10-23. The use-count split is #21 (2026-09-29). The confirm before a game change clears the rows is #22 (2026-09-29). A tablet price entered in divines is #23 (2026-10-23).

**Player outcome:** A PoE2 map's setup cost spreads a tablet's price across the maps it lasts. A PoE1 scarab still costs its full price on the one map that consumes it.

**Epic: A tablet's price is split across its uses.** Before this epic, a tablet's quantity times its price was added to every map. A tablet bought for 100c with 10 uses is charged as 100c per map. The per-map enhancement cost is `(quantity × unit cost) / uses`. Uses of 1 keeps today's formula, so a scarab does not change. A new PoE2 tablet row defaults to 10 uses. A scarab defaults to 1. Five-use and twenty-use tablets are a use count the player sets on the row, not separate rules. A row already saved stays at 1 use until the player sets a count. Stored costs do not get divided by 10 on their own.

Must already be true: `calculateStrategyCosts` is the only strategy-cost formula (ADR-008).

Left for later: copying those costs onto a session. That is phase 2.

## 2. Log a session the way the spreadsheet works

**Player outcome:** A farm is logged as known costs, one total per revenue category, and an extrapolated duration that is visible before save.

On 2026-10-27 Taylor is logging PoE1 on the public site. On 2026-10-29 that epic waits. Plan phase 6. This phase's first epic stays next for the game. A scarab copies at one use, so the filled cost is its full price. Loot for this league is the item, the quantity, and a chaos unit value. The category-total epic and the extrapolated-time epic stay in this phase. They are not the next epic. Compiled totals stay phase 3. Chisels, alchemy orbs, and chaos orbs spent as cost are [FF-023](./FUTURE_FEATURES.md), after this epic's copy exists. The history column saying Maps for a PoE1 run is [FF-027](./FUTURE_FEATURES.md).

**Epic: A session starts with the strategy's costs filled in, and those costs stay editable.** The first session still asks the player to retype tablets the strategy already has. Waystone cost already copies. Tablet cost does not, and it has to be the per-use cost from phase 1.

Must already be true: phase 1 has shipped. Left for later: copying a previous session's revenue. That would invent a drop the player did not get.

**Epic: Enter one total per revenue category, in chaos or in divines.** The spreadsheet is a chaos guess per category, and a big session is often sold in divines. The player enters the categories already on the form, or adds one. A divine total converts with the divine rate stored on that session and is saved as chaos. A later change to the rate does not rewrite the saved total. Chaos stays the calculation currency.

Must already be true: a session already stores a divine rate. Left for later: item-by-item loot as the way a dry run is entered. The line model can stay. This epic does not delete it.

**Epic: A new session uses extrapolated time only, and the estimate updates while you type.** Observed, extrapolated, and manual are three questions, and the dry run only needs one. The player fills the same sample fields either as "this many maps took this long" or as "the whole session took this many minutes." The estimate updates before save by calling the shared duration function. A second formula in the form is not allowed (ADR-008). Observed and manual stay valid on a session that already has them. They are not on the new-session form.

Must already be true: the extrapolated duration method exists. Left for later: putting observed and manual back on the new-session form.

## 3. See whether your strategy paid

**Player outcome:** You can open one place and see whether a strategy paid across the sessions you still count.

The compilation built here is the one the public board reuses. Phase 5 changes the filter to valid public sessions. It does not add a second formula.

**Epic: See your compiled results for one strategy.** History is a flat list. Profit, ROI, rates, and how many runs you counted are not on one screen. Area: reporting. A player can recheck that page without the strategy form or the session form.

Must already be true: sessions belong to a strategy, and phase 2 has shipped so a dry-run session is worth compiling. Left for later: a chart, comparing two strategies, and everyone else's results.

**Epic: Leave one of your sessions out of that compilation.** One bricked run moves the number, and deleting the run is the wrong fix. The session stays stored and shows as excluded. It is absent from the compiled figures.

Must already be true: the compilation epic above. Left for later: a strategy owner excluding someone else's public session.

## 4. Small gaps in the dry run

**Player outcome:** A dry run does not lose an unsaved session, hide the best run, or keep a finished strategy in the working list.

These four can be taken in any order. The cost preview waits until phase 1, so the number on the form is the per-use cost.

**Epic: See strategy setup cost while the form is dirty.** Tablet and scarab cost is invisible until save. Call `calculateStrategyCosts`. Display with the same rounding as the saved strategy. The saved strategy still comes from the API response.

Must already be true: phase 1. Left for later: live session profit while typing.

**Epic: Ask before leaving a session form with unsaved lines.** A long entry is discarded on navigation.

Must already be true: the session form exists. Left for later: the same warning on the strategy form.

**Epic: Sort session history by profit per hour.** The list cannot answer which run was best without a dashboard.

Must already be true: the session list shows profit per hour. Left for later: the reporting page. That is phase 3, and this epic does not replace it.

**Epic: Hide a strategy that still has sessions.** Delete is refused while runs exist, so a finished setup stays on the list. Hide takes it off the working list and keeps the sessions.

Must already be true: deleting a strategy with sessions returns 409. Left for later: versions and archive of a public strategy. That is a different idea, in the backlog.

## 5. A public board

**Player outcome:** Someone else can open a public strategy, and the compiled results use the phase 3 model on valid public sessions only.

Do not start this phase while phases 1–3 are open. Phase 4 can overlap. Inside this phase, `plan-epic` follows the epic order below.

**Epic: Apply a release's schema changes to the live database.** Accounts cannot reach the public site while a schema change and the app that reads it can ship on different schedules.

Must already be true: the Neon production branch is the live database, and a production Vercel build runs `prisma migrate deploy` before `next build`. Left for later: a release step that is not every production build.

**Epic: Sign in with an email account.** A visitor cannot come back to their own strategies.

Must already be true: the schema epic above, and ADR-011. Left for later: forgot password, display name, settings, and GGG login.

**Epic: A signed-in player sees only their strategies and sessions.** After sign-in, the lists are still one shared database.

Must already be true: sign-in works. Left for later: publishing a strategy.

**Epic: A visitor who is not signed in can view the demo and cannot change it.** Anyone with the public URL can create, edit, and delete production rows.

Must already be true: sign-in works, and a demo seed exists.

**Epic: The demo board has several strategies and sessions a visitor can open.** One demo strategy does not show the board this phase is building. The seed is obvious demo data. Clear it when real runs should be the board.

Must already be true: a logged-out visitor cannot change data. Left for later: leaderboard boxes on the logged-out home.

**Epic: Make a strategy public.** Other players cannot find a strategy that exists only on your account. A strategy stays private until you publish it.

Must already be true: private accounts exist. Left for later: creator pages and video links.

**Epic: Log a session under a public strategy you did not create.** Without this, global stats are only the author's runs. The session belongs to the signed-in player.

Must already be true: you can open a public strategy. Left for later: prefilling loot lines beyond the common categories. That is the Run epic below, and anything past those categories stays in the backlog.

**Epic: Like a strategy.** There is no way to keep a public strategy you did not create. Logged out, liking asks you to sign in or register. Signed in, the strategy is on your list.

Must already be true: a public strategy exists. Left for later: Truth-sayer / Deceiver.

**Epic: The strategies page lists My strategies and Global strategies.** My strategies are ones you created or liked. Global strategies are ones you or someone else made public. A strategy you created and published shows on both lists.

Must already be true: publish and like work. Left for later: a feed of every public session.

**Epic: Run this strategy.** Logged out, the button asks you to sign in. Signed in, it opens a new session on that strategy with the strategy's costs filled in and the revenue categories that show up most often on its public sessions.

Must already be true: you can log a session on a public strategy, and phase 2's cost prefill and category totals exist. Left for later: prefilling item lines from the author.

**Epic: A strategy shows the creator's sessions, then other people's recent sessions, then those sessions by profit.** The creator's own runs are the first list. Other people's public runs are the second, once by the last few days and again by profit.

Must already be true: other players can log a public session. Left for later: a stranger's profile.

**Epic: See your compiled results and everyone else's on a strategy.** This is the phase 3 compilation with the filter set to valid public sessions, shown beside your own. Excluded sessions stay out of both numbers.

Must already be true: phase 3 has shipped, and public sessions exist. Left for later: medians, sample-size warnings, and charts. Advanced stats stay closed.

**Epic: The strategy owner can leave someone else's public session out of the compiled stats.** The owner needs a way to keep one posted run from moving the number. The session stays visible as excluded. The owner does not delete another player's run. A silent delete lets the owner erase the runs that make the strategy look bad.

Must already be true: excluding your own session works, and other players can post a session. Left for later: a review queue for flagged sessions.

**Epic: Confirm before a far-off session becomes public.** If a session sits far from the strategy's other public sessions, the player confirms it is real before it counts. A real brick stays. The session is not dropped on its own.

Must already be true: the strategy already has other public sessions. Left for later: ranking lists. Those need this confirm and a minimum number of runs, and they are in the backlog.

## 6. A recruiter can open the latest test run

This phase can overlap phase 2. Plan it while the session-cost epic waits.

A hiring manager is the visitor. The outcome is the repo, not a new page in the app.

Before the link is worth putting on a resume, the GitHub repo is public and a secrets check has been done. That check is Taylor's, in GitHub. It is not a ticket. `.env.local`, `.env.neon-production`, and `.env.neon-ci` stay uncommitted.

**Player outcome:** Someone with the repo link can see that CI ran and can open the Playwright report for the latest run on `main`, including a run that passed.

**Epic: The README shows CI status and the latest Playwright report.** Area: repository. CI already runs on every pull request and on `main`, and the README already says how to run the unit, API, and browser layers. A passing Playwright run uploads nothing. The HTML report is uploaded only when E2E fails, and that artifact expires after 7 days.

Must already be true: `.github/workflows/ci.yml` runs Playwright with the HTML reporter. Left for later: a report for every pull request, a `/quality` page, and pass rate, runtime, and flaky count over time. Those need a history of runs. They stay [FF-006](./FUTURE_FEATURES.md). axe, k6, screenshot locks, and an LLM eval stay in the idea backlog. They are not this epic.
