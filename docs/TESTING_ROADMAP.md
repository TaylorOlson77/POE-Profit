# Testing roadmap — POE Profit

| Field | Value |
| --- | --- |
| Status | Proposal (2026-10-30). Not in [`PHASES.md`](./PHASES.md) until Taylor accepts it. |
| Applies | `plan-epic` for phase 7 or phase 8. |
| Related | [`PHASES.md`](./PHASES.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §8 and §10, [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) FF-006 and FF-028–FF-031, [`DEVELOPMENT.md`](./DEVELOPMENT.md) |

`plan-epic` reads this file when Taylor names phase 7 or phase 8. Confirm the epics, then write tickets for one epic. This file has no acceptance criteria. Accepting a phase copies its epics into [`PHASES.md`](./PHASES.md).

Phases 1–6 stay in [`PHASES.md`](./PHASES.md). Phase 7 can overlap phase 2 and phase 6. Phase 8 starts after the accessibility epic has named the pages. It does not wait on load, screenshots, or mutation testing.

## Already in place

Do not file tickets for these.

| Layer | Where it lives |
| --- | --- |
| Unit tests | `npm test`. Jest. |
| API contract tests | `npm run test:api` in the quality job. In-process Route Handlers, Prisma fake, no database URL. |
| API persistence | `npm run test:api:db` in the e2e job, against the Neon `ci` branch. |
| Playwright | `e2e/`. Desktop Chromium. Every pull request and every push to `main`. A push to `main` publishes the HTML report. |

The pull-request gates stay the list in [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §10. Phase 7 adds scheduled jobs. It does not add jobs to that list, except the accessibility gate once its tickets say the pull request fails.

## Lines this roadmap reopens

[`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §8 closed a full visual-regression suite and load testing beyond a smoke for MVP. Both come back here, after MVP, on the midnight workflow. They stay off the pull request.

Earlier notes disagree with this plan. This file wins when Taylor accepts the phase.

| Earlier note | This plan |
| --- | --- |
| FF-028. axe inside the existing journeys. A serious violation fails the run. | A scan of each page below. WCAG A fails the job first, then AA. Other rules are logged. |
| FF-029. k6 against `next start` on the runner. Parked. It must not hit the public site or the Neon `ci` branch. | One script against a Vercel Preview. Production and the Neon `ci` branch stay off limits. |
| FF-031. A screenshot of a page a journey already opens. Parked. | Pixel baselines per device, including phone sizes, for those pages. |
| FF-030. A model explains one saved session. | Phase 8 is an agent on the pages, scored by a golden rule set. FF-030 stays its own idea. |
| FF-006. An in-app `/quality` page. | Phase 7 stores the k6 summary JSON that page will read. Building the page stays FF-006. |

## Pages and viewports

One page list. The accessibility scan, the phone checks, the screenshots, and the phase 8 agent use it.

| Route | What opens it |
| --- | --- |
| `/` | Home. Strategy list. |
| `/strategies/new` | New strategy form. |
| `/strategies/[id]` | Edit strategy. The seeded demo strategy. |
| `/sessions` | Session history. |
| `/sessions/new` | New session form. |
| `/sessions/[id]` | Edit session. The seeded demo session. |

One viewport list. The phone epic and the visual epic share it. Whoever is planned first writes the list down. The other epic uses that list.

| Viewport | Source |
| --- | --- |
| Desktop Chrome | The Playwright project already in `playwright.config.ts`. |
| iPhone 13 | Playwright device emulation. |
| Pixel 7 | Playwright device emulation. |

Emulation only. No device lab, and no second browser engine. Session history is the wide list to check for overflow. The app has no chart today ([FF-013](./FUTURE_FEATURES.md)). A chart joins this check when one exists. Do not add a chart so the check has a target.

---

## 7. Testing improvements

**Outcome:** The heavy checks run on a schedule, each page is held to WCAG A and then AA, and a pull request still finishes on the gates already in place.

`plan-epic` order: accessibility, phone sizes, visual baselines, k6, mutation testing, then the midnight workflow. Phone sizes come before screenshots so the baselines use the viewports the phone epic already locked. The midnight workflow is last because it names the jobs above it.

### Epic: Each page reports zero WCAG A violations, then zero AA

Nothing scans the six pages. A hiring manager cannot see an accessibility result in the Playwright report.

Area: the pages in the list above.

Must already be true: Playwright runs on the pull request and publishes its HTML report from `main`. The seeded demo strategy and session exist, so the `[id]` routes open.

The scan is axe-core, one pass per page. "Zero violations" means zero WCAG A and zero WCAG AA. The tickets land in this order, so the first merge does not turn `main` red:

1. The scan runs and writes the violation log. The job stays green.
2. A WCAG A violation fails the pull-request Playwright job.
3. A WCAG AA violation fails that same job. AAA and best-practice rules stay in the log. They do not fail the job.

Left for later: every dirty state of every form. AAA as a failing gate.

Suggested cut: one ticket per row above.

### Epic: The same pages work on a phone-sized viewport

CI opens the app as desktop Chromium only. A control can sit past the edge of a phone and the desktop journeys still pass.

Area: the same pages.

Must already be true: the page list above. The viewport list is written in this epic.

Playwright device emulation opens each page at iPhone 13 and Pixel 7. The action that page is for can be reached: the list scrolls into view, the form can be filled, a primary control is on screen. This epic does not re-run the seven desktop journeys at each size. Horizontal overflow that hides the action fails the run. A pixel match is the next epic.

Left for later: Safari, Firefox, a tablet matrix, a device lab.

Suggested cut: one ticket. The viewport list and the reachability checks ship together.

### Epic: A pixel change at a known viewport fails the visual run

A layout change can ship while the journeys stay green. There is no screenshot suite.

Area: the same pages, at the shared viewport list.

Must already be true: the phone epic has written the viewport list. Playwright already opens these pages.

Playwright screenshot comparison. One committed baseline per page per viewport, including the two phone sizes. A pixel diff fails the run, and the diff is the artifact. The same run fails when session history overflows the viewport. A chart gets that overflow check only after FF-013 exists.

Left for later: a pixel diff of every component state. A full-app suite stays out.

Suggested cut: one ticket. Baselines and the overflow assertion are one suite.

### Epic: A short k6 run against Preview stays inside limits set first

There is no load check. The public app is on Vercel's free tier, so the script cannot discover its limits by hitting production.

Area: repository. The result is an artifact, not a new page.

Must already be true: a Vercel Preview URL answers the routes the script calls. Preview does not receive the production database URLs ([`DEVELOPMENT.md`](./DEVELOPMENT.md)). The script also stays off the Neon `ci` branch, which the Playwright job resets. If no such Preview exists, the first ticket is that URL. The script waits.

Decisions for the ticket note:

- One script file. Scenarios and thresholds live in that file.
- The base URL is a Vercel Preview, or a named staging deployment. Production (`https://poe-profit.vercel.app/`) stays closed.
- 5–10 virtual users.
- Thresholds are written into the file before the first measured run. Starting pair, for the HTTP scenarios: `http_req_duration` p(95) under 200ms, and `http_req_failed` under 1%. Replace the pair in the ticket note if Taylor picks different numbers. Do not copy them off the first run.
- One k6 browser-module scenario is in the same file, as a light UI pass. It does not own the 200ms line.
- The run writes a k6 summary JSON and stores it as an Actions artifact named for the `/quality` page. The page stays FF-006. Do not commit a history of summaries.

Left for later: more users, production, the `/quality` page, a browser scenario that is itself the load.

Suggested cut: the Preview URL, then the one script (HTTP scenarios, thresholds, the browser scenario, and the summary artifact).

### Epic: Mutation testing covers the calc engine on a weekly run

A green unit suite can miss a profit formula that changed. Running that check on every pull request spends the minutes.

Area: `src/domain/calc`. That module is the only strategy-cost and profit formula (ADR-008). Chaos stays canonical.

Must already be true: the unit tests for that module pass on `main`.

Stryker mutates `src/domain/calc` only. The first weekly runs report the score and do not fail. The threshold is chosen from that baseline, then a later ticket makes the weekly run fail when the score drops. The cadence is weekly, on `main`. A nightly run is the alternative if a week is too stale. Pull requests do not run it.

Left for later: UI, Route Handlers, or the whole repo. Every pull request.

Suggested cut: the weekly report with no failing threshold, then the threshold gate.

### Epic: Midnight CI runs the heavy suites one after another

Phone Playwright, visual regression, and Stryker in parallel would compete for Actions minutes. The pull request already spends minutes on desktop Playwright.

Area: `.github/workflows/`. `main` only.

Must already be true: the phone, visual, and mutation epics exist, even if a later one is still a stub job. k6 joins this workflow when its epic exists. It does not join the pull request, so Preview is not loaded from every push.

One workflow. GitHub cron is UTC and does not follow daylight saving. The schedule is `0 5 * * *` (05:00 UTC): midnight Eastern Standard Time, and 1:00 a.m. Eastern Daylight Time.

Order, each job after the previous one finishes:

1. Playwright at the phone viewports.
2. Visual regression, including those phone baselines.
3. k6 against Preview, when that epic exists.
4. Stryker, on Sunday only, after the others. The other nights stop before it.

Desktop Chromium stays on the pull request. Job 1 does not repeat it. Repeating it is a one-line widening of job 1 if Taylor wants the soak.

Left for later: these jobs on pull requests. A per-pull-request Playwright report (still FF-006's neighborhood).

Suggested cut: one ticket for the workflow and the order. Stryker's Sunday limit is part of that ticket.

---

## 8. AI testing

**Outcome:** Two agent runs against the same pages produce the same pass and fail on a checked-in rule set.

This phase can overlap the tail of phase 7. The pages come from the accessibility epic. The midnight workflow is a convenient place to run it, on its own night, after the phase 7 jobs. A live model stays off the pull request.

### Epic: An agent on the pages is scored by a golden rule set

A model run cannot be compared with the next run when the score is the model's wording.

Area: the same six pages. The score is a fixture in the repo.

Must already be true: the page list is stable, and the seeded demo strategy and session open. The calc engine's stored profit, ROI, and rates are the facts a rule may cite. The agent does not invent a second profit.

Decisions for the ticket note:

- The rule set is checked in. Each rule has an id. The runner's output is that id plus pass or fail.
- A rule reads the end state: what is on the screen, or what the API stored, after the agent finishes. The path the agent took is not the score. The agent's prose is not the score.
- Two runs are comparable when those id-and-result lists match. The run record pins the seed, the route list, and the model id. A different model is a different run.
- The rules do not ask which strategy to farm. A logged result stays an observation. FF-030, which explains one saved session and may use a judge model, is not this epic.
- The first ticket scores the rule file with no model in the loop, so a broken rule fails before an agent exists.

Left for later: an LLM-as-judge, scoring the wording, strategy recommendations, production, every pull request.

Suggested cut: the rule file and a model-free scorer, then the agent that walks the pages and records the facts those rules read, then a comparison of two run summaries on rule id and pass or fail.
