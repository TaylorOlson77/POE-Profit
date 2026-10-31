# Testing roadmap — POE Profit

| Field | Value |
| --- | --- |
| Status | Phase 7 accepted (2026-10-30) and copied into [`PHASES.md`](./PHASES.md). Phase 8 is still a proposal. |
| Applies | `plan-epic` for phase 7 or phase 8. |
| Related | [`PHASES.md`](./PHASES.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §8 and §10, [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) FF-006 and FF-030, [`DEVELOPMENT.md`](./DEVELOPMENT.md) |

`plan-epic` reads [`PHASES.md`](./PHASES.md) for phase 7. This file keeps the phase 8 proposal. Confirm those epics before copying phase 8. This file has no acceptance criteria.

Phases 1–7 are in [`PHASES.md`](./PHASES.md). Phase 6 shipped on 2026-10-30. Phase 7 can overlap phase 2. Phase 8 starts after the accessibility epic has named the pages. It does not wait on load, screenshots, or mutation testing.

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
| Former FF-028. axe inside the existing journeys. A serious violation fails the run. | Its own spec over the six pages. The first ticket logs and stays green. WCAG A fails the pull request after the A fixes. AA is the next epic. |
| Former FF-029. k6 against `next start` on the runner. Parked. It must not hit the public site or the Neon `ci` branch. | One script against a Vercel Preview, after that Preview has a database. Last epic in phase 7. Production and the Neon `ci` branch stay off limits. |
| Former FF-031. A screenshot of a page a journey already opens. Parked. | Pixel baselines per viewport, after the phone epic writes the viewport list. Midnight workflow, not the pull request. |
| FF-030. A model explains one saved session. | Phase 8 is an agent on the pages, scored by a golden rule set. FF-030 stays its own idea. |
| FF-006. An in-app `/quality` page. | Phase 7 stores the k6 summary JSON that page will read. Building the page stays FF-006. |

## Pages and viewports

One page list. The accessibility scan, the phone checks, the screenshots, and the phase 8 agent use it. Phase 7 in [`PHASES.md`](./PHASES.md) holds the same list.

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

## 7. The test suite checks more, and the report shows it

Accepted on 2026-10-30. The epics are in [`PHASES.md`](./PHASES.md). This section keeps the cuts that changed, and the k6 numbers the ticket note still needs.

`plan-epic` order: WCAG A, WCAG AA, phone sizes, visual baselines, mutation testing, then k6.

- The midnight workflow is not its own epic. The phone epic adds it. The visual, k6, and mutation epics add their jobs behind the phone job. The schedule stays `0 5 * * *`.
- The accessibility scan is its own spec. The first ticket logs every violation and the run stays green. WCAG A fails the pull request after the A fixes. AA is the next epic, and it stays in the log until then. AAA stays in the log.
- k6 is last. Preview has no database today, so the first ticket is that database. Production and the Neon `ci` branch stay closed.
- The mutation run reports a score and does not fail. A threshold ticket waits until a score has been read.

Decisions that stay for the k6 ticket note:

- One script file. 5–10 virtual users.
- Starting pair, for the HTTP scenarios: `http_req_duration` p(95) under 200ms, and `http_req_failed` under 1%. Replace the pair in the ticket note if Taylor picks different numbers. Do not copy them off the first run.
- One k6 browser-module scenario is in the same file, as a light UI pass. It does not own the 200ms line.
- The run writes a k6 summary JSON as an Actions artifact. The `/quality` page stays FF-006. Do not commit a history of summaries.

---

## 8. AI testing

**Outcome:** Two agent runs against the same pages produce the same pass and fail on a checked-in rule set.

This phase can overlap the tail of phase 7. The pages come from the accessibility epic. The midnight workflow is a convenient place to run it, on its own night, after the phase 7 jobs. A live model stays off the pull request.

The demo page in the next section extends this phase. It shows a visitor one run. It uses the same rule set. It is not a second way to score.

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

---

## Demo page (extends phase 8)

**Outcome:** A visitor with the gate can read a finished example run, see how the rules score it, and start one live run that cannot spend the API credit without a cap.

This is the same phase as the golden-rule epic. `plan-epic` takes it after that epic, because the transcripts and the live run cite those rules. The page is not a product feature and it does not join the pull-request gates.

### Epic: A gated page shows example runs and one capped try

The scoring epic produces a run record. Nothing on the site shows that record, and a live Anthropic call with no cap can spend the credit.

Area: one new page. A visitor can open it without the strategy form or the session form.

Must already be true: the golden-rule file exists, and a model-free scorer can mark each rule pass or fail. The Anthropic API key stays on the server.

Decisions for the ticket note:

- The agent calls Anthropic's API. The system prompt is the whole knowledge base for the demo: what POE Profit does, what a strategy is, and the golden rules in plain language. There is no retrieval layer, no vector store, and no second document fetch. Anthropic's API does not search the web, and this demo does not add a search tool.
- The page shows three things before anyone spends credit: example transcripts of the agent evaluating against the rule set, checked in so they render with the button unused; a short explanation that a run is scored by rule id and pass or fail, so a second run is comparable; and a try-it-out button.
- The button is rate-limited per demo session. The app has no accounts yet, so the session is a cookie this page sets, not a signed-in user. The ticket names a small cap before the button ships. A request past the cap is refused and says why. The cap is what protects the API credit.
- The agent loop has a max iteration cap, a small integer named in the ticket before the button ships. The loop stops at that cap even when the model asks for another step.
- One gate, chosen in the ticket. Preferred: Next.js middleware requires a secret query param, and a missing or wrong secret returns 404 so the route does not advertise itself. A secret header is the same check for a scripted caller. Alternative: the page is not on the production deployment, and the only host is an unguessable Vercel Preview URL. Do not ship the page on production without the middleware gate.

Left for later: retrieval, web search, an account-based limit, an ungated public page, and a try button with no iteration cap.

Suggested cut: the gate, then the page with the transcripts and the explanation, then the button wired to Anthropic with the session limit and the iteration cap.
