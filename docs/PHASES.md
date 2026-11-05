# Phases — POE Profit

| Field | Value |
| --- | --- |
| Status | Agreed (2026-09-28) |
| Applies | What to build after MVP v1, and in what order. |
| Related | [`PRODUCT.md`](./PRODUCT.md), [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md), [`TESTING_ROADMAP.md`](./TESTING_ROADMAP.md), [`MVP_SPEC.md`](./MVP_SPEC.md) §4, [ADR-008](./DECISIONS.md), [ADR-011](./DECISIONS.md) |
| Next epic | A short k6 run against Preview stays inside limits set first |

v1 is live. Phase 1 shipped on 2026-10-23. These are the next phases. [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) holds everything that did not make a phase.

`plan-epic` reads one phase, confirms the epics, then writes tickets for one epic. The rules are [`PRODUCT.md`](./PRODUCT.md). It does not start a later phase while an earlier one is open, except where this file says a phase can overlap. Tickets and acceptance criteria are written in that command, not here.

On 2026-11-01 Taylor paused phases 4 and 5. They stay in this file. After phase 7, the run is phase 8, then phase 9, then phase 10. Those phases can overlap phase 2. Phase 2's cost epic stays the next game epic when logging resumes.

A documented MVP non-goal stays closed unless this file says Taylor reopened it.

## Reopened for a later phase

Taylor reopened these on 2026-09-28. They are phase 5. They are not the next epic.

- **Authentication.** Accounts are app-layer auth in the same Postgres, not Neon Auth (ADR-011). The epic that closes is "Sign in with an email account."
- **A public strategy list, and logging a session on someone else's strategy.** This is the community-submissions non-goal, reopened only that far.
- **Liking a strategy.** This is a favorite. Comments, follows, profiles, leaderboards, and Truth-sayer votes stay closed.

Still closed: poe.ninja and other automatic pricing, the GGG API, stash reconciliation, an atlas simulator, image recognition, automatic strategy import, and advanced stats.

Taylor reopened pasted loot text on a session on 2026-11-01. That is phase 9. A player pastes a drop list and the session lines fill in. Importing a strategy from Excel, YouTube, or a website stays closed. Image recognition and OCR stay closed. Automatic pricing stays closed.

## 1. A tablet costs what it lasts

**Shipped** on 2026-10-23. The use-count split is #21 (2026-09-29). The confirm before a game change clears the rows is #22 (2026-09-29). A tablet price entered in divines is #23 (2026-10-23).

**Player outcome:** A PoE2 map's setup cost spreads a tablet's price across the maps it lasts. A PoE1 scarab still costs its full price on the one map that consumes it.

**Epic: A tablet's price is split across its uses.** Before this epic, a tablet's quantity times its price was added to every map. A tablet bought for 100c with 10 uses is charged as 100c per map. The per-map enhancement cost is `(quantity × unit cost) / uses`. Uses of 1 keeps today's formula, so a scarab does not change. A new PoE2 tablet row defaults to 10 uses. A scarab defaults to 1. Five-use and twenty-use tablets are a use count the player sets on the row, not separate rules. A row already saved stays at 1 use until the player sets a count. Stored costs do not get divided by 10 on their own.

Must already be true: `calculateStrategyCosts` is the only strategy-cost formula (ADR-008).

Left for later: copying those costs onto a session. That is phase 2.

## 2. Log a session the way the spreadsheet works

**Player outcome:** A farm is logged as known costs, one total per revenue category, and an extrapolated duration that is visible before save.

On 2026-10-27 Taylor is logging PoE1 on the public site. On 2026-10-29 that epic waits. Plan phase 6. This phase's first epic stays next for the game. A scarab copies at one use, so the filled cost is its full price. Loot for this league is the item, the quantity, and a chaos unit value. The category-total epic and the extrapolated-time epic stay in this phase. They are not the next epic. Compiled totals stay phase 3. Chisels, alchemy orbs, and chaos orbs spent as cost are [FF-023](./FUTURE_FEATURES.md), after this epic's copy exists. The history column says Maps in phase 8.

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

**Paused** on 2026-11-01. This phase waits. The history-sort epic shares the session list with phase 8. When this phase comes back, that epic is a change to the phase 8 row.

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

**Paused** on 2026-11-01. This phase waits until Taylor brings it back. Do not start it during phases 7–10.

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

**Shipped** on 2026-10-30 (#24, #25, #26).

This phase can overlap phase 2. Plan it while the session-cost epic waits.

A hiring manager is the visitor. The outcome is the repo, not a new page in the app.

Before the link is worth putting on a resume, the GitHub repo is public and a secrets check has been done. That check is Taylor's, in GitHub. It is not a ticket. `.env.local`, `.env.neon-production`, and `.env.neon-ci` stay uncommitted.

**Player outcome:** Someone with the repo link can see that CI ran and can open the Playwright report for the latest run on `main`, including a run that passed.

**Epic: The README shows CI status and the latest Playwright report.** Area: repository. CI already runs on every pull request and on `main`, and the README already says how to run the unit, API, and browser layers. A push to `main` that runs Playwright publishes the HTML report to GitHub Pages, and the README links to that page. A pull request does not publish. On E2E failure, `playwright-report/` and `test-results/` still upload for 7 days.

Must already be true: `.github/workflows/ci.yml` runs Playwright with the HTML reporter. Left for later: a report for every pull request, and pass rate, runtime, and flaky count over time. Those need a history of runs. The `/quality` page is phase 10. The accessibility scan, phone viewports, screenshot baselines, the weekly mutation report, and the k6 script are phase 7. An agent that walks the pages and is scored by a golden rule set is parked as [FF-033](./FUTURE_FEATURES.md).

## 7. The test suite checks more, and the report shows it

This phase can overlap phase 2.

**Player outcome:** Every new check publishes a result, and a pull request still finishes on the gates it has today. The accessibility gate is the one exception, once its tickets say the pull request fails.

`plan-epic` order: WCAG A, WCAG AA, phone sizes, visual baselines, mutation testing, then k6. WCAG A shipped on 2026-10-31. WCAG AA shipped on 2026-11-02 (#46). Phone sizes shipped on 2026-11-01 (#36, one ticket, no epic issue). Visual baselines shipped on 2026-11-01 (#38, one ticket, no epic issue). Mutation testing shipped on 2026-11-01 (#44, one ticket, no epic issue). k6 is last in this phase (#48, one ticket, no epic issue).

The six pages are `/`, `/strategies/new`, `/strategies/[id]`, `/sessions`, `/sessions/new`, and `/sessions/[id]`. The two id routes open the seeded demo strategy and the seeded demo session. The accessibility scan, the phone checks, and the screenshots use this list.

**Epic: Each page reports zero WCAG A violations.** Shipped on 2026-10-31 (#31, #32, #33). The scan runs, and a WCAG A violation fails the pull request and names the rule and the element. AA, AAA, and best-practice rules stay in the log.

Area: the six pages.

Must already be true: Playwright runs on the pull request and publishes its HTML report from `main`. The seeded demo strategy and session exist.

The scan is axe-core, one pass per page, in its own spec. The first ticket logs every violation and the run stays green. The next ticket fixes the WCAG A violations the log names and makes a WCAG A violation fail the pull-request job. AA, AAA, and best-practice rules stay in the log.

Left for later: failing the job on AAA, and every unsaved state of every form. Failing on AA shipped on 2026-11-02 (#46).

**Epic: Each page reports zero WCAG AA violations.** Shipped on 2026-11-02 (#46). A WCAG AA violation fails the pull request.

Area: the six pages.

Must already be true: the A epic has shipped, and the scan already logs AA. Left for later: failing the job on AAA, and every unsaved state of every form.

**Epic: The same pages work on a phone-sized viewport.** Shipped on 2026-11-01 (#36). CI opens the app as desktop Chromium only. A control can sit past the edge of a phone and the desktop journeys still pass.

Area: the six pages.

Must already be true: the page list above.

Playwright device emulation opens each page at iPhone 13 and Pixel 7. The action that page is for can be reached. This epic does not re-run the seven desktop journeys at each size. Horizontal overflow that hides the action fails the run. This epic adds the midnight workflow, because the check stays off the pull request. One workflow on `main`, scheduled at `0 5 * * *` (05:00 UTC): midnight Eastern Standard Time, and 1:00 a.m. Eastern Daylight Time. This epic's job is first. The visual job waits on it. The mutation job does not: it scores `src/domain/calc` on Sunday and does not use the `ci` branch. k6 does not join this workflow. A job that uses the Neon `ci` branch joins the existing `e2e-ci-database` queue.

The viewport list is desktop Chromium, iPhone 13, and Pixel 7. The visual epic uses that list.

Left for later: Safari, Firefox, a tablet matrix, a device lab.

**Epic: A pixel change at a known viewport fails the visual run.** Shipped on 2026-11-01 (#38). A layout change can ship while the journeys stay green. There is no screenshot suite.

Area: the six pages, at the viewport list from the phone epic.

Must already be true: the phone epic has written the viewport list.

Playwright screenshot comparison. One committed baseline per page per viewport. A pixel diff fails the run, and the diff is the artifact. Baselines are generated on the CI image. This reopens the visual-regression line in [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §8 for these pages only. The run is a job on the midnight workflow, not a pull-request gate.

Left for later: a pixel diff of every component state. A full-app suite stays out.

**Epic: Mutation testing covers the calc engine on a weekly run.** Shipped on 2026-11-01 (#44). A green unit suite can miss a profit formula that changed. Running that check on every pull request spends the minutes.

Area: `src/domain/calc`. That module is the only strategy-cost and profit formula (ADR-008).

Must already be true: the unit tests for that module pass on `main`.

Stryker mutates `src/domain/calc` only. The run is Sunday, inside the midnight workflow, and `npm run test:mutation` runs the same check. A score under 90 fails that run.

Left for later: UI, Route Handlers, or the whole repo. Every pull request.

**Epic: A short k6 run against Preview stays inside limits set first.** There is no load check. The public app is on Vercel's free tier, so the script cannot discover its limits by hitting production. Filed on 2026-11-02 (#48, one ticket, no epic issue).

Area: repository. The result is one summary file in the repo, not a new page.

Must already be true: a long-lived Preview answers the routes the script calls, from a Neon branch that is not production and not `ci`. That database is work inside the ticket. Preview does not receive the production database URLs today ([`DEVELOPMENT.md`](./DEVELOPMENT.md)). The script stays off the Neon `ci` branch. Production (`https://poe-profit.vercel.app/`) stays closed.

One script file. It holds 5 virtual users, then 10, and finishes in under 5 minutes. For each level the summary records the average response time, the highest, the p(95), and the failure rate. Thresholds are written into the file before the first measured run. The same script loads the home page 3 times during each level and records the average and highest page-load time. Those times do not use the 200ms line. The run is started by hand. A passed run replaces one summary file in the repo. It does not join the midnight workflow or the pull request. This reopens the load-test line in [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §8. The `/quality` page is phase 10 and reads that file.

Left for later: more users, production, and the `/quality` page. That page is phase 10.

## 8. Session history is five columns you can scan

This phase follows phase 7. It can overlap phase 2. Phases 4 and 5 stay paused.

**Player outcome:** You can scan a run on one row without sliding the list.

**Epic: Session history shows season, strategy, maps, investment, and profit per hour.** Nine columns slide sideways, and the phone check allows that slide. Area: sessions.

Must already be true: the session list exists.

Season is a field on the session. A new session, the demo seed, and a session that has no season stored use `standard`. The player can change it. Edit and delete sit under the strategy name so the row does not slide. The list sorts by season, then strategy, then newest session first. The column header is Maps for every row. Duration, revenue, and profit stay off the row.

Left for later: the season defaults to the current league. That is separate from [FF-008](./FUTURE_FEATURES.md), which is the public board. A profit-per-hour sort of this row stays with the paused phase 4 epic. Duration as a short label stays out.

## 9. Paste a drop list and prove the lines

This phase follows phase 8. It can overlap phase 2.

**Player outcome:** You can paste a drop list into a session and the lines fill in, and a checked run proves those lines match the paste.

**Epic: Paste a drop list and the session lines fill in.** Typing each drop is the slow part of a run that is logged as items. Area: sessions.

Must already be true: a session stores item lines as the item, the quantity, and a chaos unit value.

The player pastes text from a notepad or a spreadsheet into one field on the session form. The model fills loot lines from that paste. The player can edit the lines before save. A save stores what is on the form.

Left for later: image recognition, OCR, importing a strategy, automatic pricing, and a recommendation of which strategy to run.

**Epic: A checked run proves the filled lines match the paste.** A model can fill a line the paste did not contain. Area: sessions. The result is a run, not a new page.

Must already be true: the paste epic above.

The check compares the saved lines to the paste. It does not score the model's wording. One prompt-injection case leaves the stored numbers unchanged and does not follow the injected instruction. The live model stays off the pull request.

Left for later: an LLM-as-judge, a page-walking agent, and a public try button. Those stay [FF-033](./FUTURE_FEATURES.md) and [FF-030](./FUTURE_FEATURES.md). The public digest of results is phase 10.

## 10. Open /quality and read the latest results

This phase follows phase 9. It can overlap phase 2.

**Player outcome:** Someone can open one page and read the latest test results without opening GitHub.

**Epic: The home page and the README link to /quality, and that page shows the latest generated results.** Actions history shows that CI ran. It does not show the results in one place. Area: quality. A visitor can open the page without the strategy form or the session form.

Must already be true: a push to `main` publishes the Playwright report, and the phase 7 jobs publish their results. The phase 9 check is one of the results once that phase has shipped.

The numbers come from the generated run. A hand-counted figure stays out. The page does not commit a history of full logs.

Left for later: a manual pass/fail line, a chart of every past run, a coverage-line drill-down, and a report for every pull request.
