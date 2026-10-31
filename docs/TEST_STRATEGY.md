# Test Strategy — POE Profit (MVP v1)

| Field | Value |
| --- | --- |
| Status | Draft |
| Revised | 2026-09-28 |
| Scope | MVP v1 |
| Related | [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md), [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) |
| Primary risk | Incorrect money, time, or efficiency calculations |

## 1. Purpose

This document defines how we prove behavior, what each test layer owns, what we deliberately do not automate, and how CI gates merges.

The living inventory of those tests is [`tests/catalog/`](../tests/catalog/README.md). This document is the rules for which layer owns a behavior. [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) decides when a line belongs on a page. A ticket updates the coverage page. It does not add a row to the tables in §6 or §7.

The project is intentionally a portfolio demonstration of senior QA / SDET practice: clear requirements, acceptance criteria, risk-based coverage, and traceability—not only a working UI.

## 2. Quality objectives

For MVP v1 we will:

1. Prevent silent math errors in profit and efficiency metrics.
2. Ensure API validation rejects invalid runs/strategies with clear failures.
3. Prove the critical user journeys end-to-end (create → record → edit → delete).
4. Keep historical valuations stable (manual price snapshots do not drift).
5. Produce actionable failure artifacts (logs, reports, E2E screenshots).

## 3. Test pyramid

```text
             E2E (Playwright)
            /               \
      API tests          UI smoke (via E2E)
            \               /
          Integration tests
                 |
        Unit tests (calculation engine)
```

| Layer | Relative volume | Why |
| --- | --- | --- |
| Unit (calculation engine) | Highest | Core business risk; fast; many edge cases |
| API / integration | High | Persistence, validation, calculated response shape |
| E2E (Playwright) | Focused | High-value journeys only; not combinatorial math |

**Rule:** If a behavior can be proven in the calculation engine or API, do not duplicate every permutation in the browser.

## 4. Layer ownership

### 4.1 Unit — calculation engine

**Owns**

- Line totals (`quantity × unitValue`)
- Strategy enhancement charge (`(quantity × unit cost) / uses`)
- Investment / revenue sums
- Profit, ROI, duration-derived rates
- Duration methods: observed, extrapolated, manual → effective duration
- Edge cases: zero duration, zero maps, zero investment, negative profit, invalid extrapolated samples
- Fractional quantities and decimal prices
- Chaos ↔ Divine display conversion using the **run-stored** rate
- Rounding / precision policy for internal vs display values

**Does not own**

- HTTP status codes
- Database constraints
- Pixel-perfect UI layout
- Playwright selectors

### 4.2 API / integration

**Owns**

- Strategy and MapSession CRUD
- Validation failures (missing fields, end before start, negative maps/qty/price)
- Persistence round-trips
- Response payloads include **server-calculated** fields (ADR-008)
- Recalculation after update
- Delete behavior
- Invalid IDs / not found

**Does not own**

- Exhaustive floating-point matrix already covered by unit tests
- Full browser workflows

One example of each contract outcome is enough: a valid write, one invalid field, one bad decimal, unknown id, delete, and a blocked delete. Repeating every decimal format here does not add confidence in the route.

Two suites share this layer. `npm run test:api` calls Route Handlers in-process with a Prisma fake. It locks status codes, error bodies, and that the service returns the engine's fields. The quality job runs it and is not given a database URL. Persistence round-trips are `npm run test:api:db` (`tests/api/db/`): the same handlers and the real Prisma client. Locally that is the Neon `local` branch. In CI it runs in the e2e job against the Neon `ci` branch. That suite checks stored strings. It does not repeat the validation rules.

Postgres rolls back a transaction that throws. The fake's `$transaction` does not. A map-session update deletes lines and then writes the new ones, and there is no natural failure between those steps, so neither suite locks rollback. There is no fault-injection hook.

### 4.3 E2E — Playwright

**Owns**

- Create strategy → appears in list with its cost per waystone
- Update strategy → after save, the home list shows the new cost per waystone
- Delete strategy with no sessions → confirmation required → strategy gone from the home list
- Delete strategy that still has sessions → the home list shows the conflict message and the strategy stays
- Record run with investment + revenue + prices + duration → displayed totals match expected fixture
- Edit quantity → totals recalculate after save
- Delete run → confirmation required → run gone from history
- An axe scan of the six settled pages. Each page's violations are attached to that test in the HTML report. A violation does not fail the pull request until a later ticket says a WCAG A violation does. AA stays in the log.

**Does not own**

- Every ROI edge case
- Auth flows (none in MVP)
- External market APIs
- Visual regression of the entire app
- A manual screen-reader and keyboard pass, including unsaved form states
- Field-level validation. A missing name, a bad decimal, and the other input rules stay in unit and API tests. A browser case for a validation message exists only when that message cannot be asserted below the UI (a specific server error such as `409 CONFLICT` that the screen must show).

The API locking a status code does not skip a browser line. The API does not open the page. The conflict message above is that case: the home list shows the message and the strategy stays.

There is no 404 page. A missing strategy or session shows the API sentence in place of the form. That stays an API line. A not-found sentence for an id a person cannot reach on purpose is not a browser line.

Lint, through `eslint-config-next` and its `jsx-a11y` rules, catches static JSX mistakes. The axe scan catches rules on the rendered page, including color contrast. A screen-reader and keyboard pass is still manual: focus order, announcements, and any state the scan does not open. Unsaved form states stay out of the scan.

### 4.4 How deep each layer goes

- **Unit:** the boundaries of one function (empty, zero, negative, cap, fractions).
- **API:** one example per outcome the contract promises (status code, error body, calculated fields stored and returned). The handler, Zod schema, and service run together. The contract suite may fake Postgres. Stored scale, the integer-column ceiling, `timestamptz`, and `onDelete: Restrict` belong to `npm run test:api:db`.
- **UI:** one path per user journey. Do not re-list every validation message the unit tests already cover.

## 5. Priority risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Wrong profit / ROI / profit-per-hour | Trust destroyed | Dense unit suite + golden fixture cases |
| Floating-point display artifacts | Looks unprofessional / wrong | Precision tests; display rounding at presentation |
| UI and API disagree on math | Confusing UX | Single calculation engine; API returns calculated fields |
| Zero divisors (duration/maps/investment) | Infinity / NaN in UI | Explicit N/A behavior tests |
| Silent deletes | Data loss | E2E confirmation + API tests |
| Public deploy without auth | Accidental data exposure | Documented in ADR-007; use demo data on public instances |
| Flaky E2E | CI distrust | Few journeys; stable fixtures; artifacts on failure |

## 6. Test suites mapped to MVP behavior

These tables are the MVP plan: the behaviors automation should cover before the baseline ships. After that, the coverage pages are the inventory. Do not keep both lists in sync by hand.

### 6.1 Calculation engine (unit)

| Suite | Examples |
| --- | --- |
| Line totals | Integer qty; fractional qty; decimal unit price; qty = 0 → total 0 |
| Aggregates | Multiple investment lines; multiple revenue lines / categories |
| Profit | Positive, zero, negative |
| ROI | Normal case; investment = 0 → unavailable |
| Duration metrics | Observed from start/end; extrapolated from sample; manual minutes; zero effective duration → rates unavailable |
| Extrapolation | `(sampleDuration / sampleMaps) × mapsCompleted`; reject sampleMaps = 0 or sampleDuration = 0 |
| Map metrics | profit/map; maps/hour; maps = 0 → unavailable |
| Currency display | Chaos totals; Divine secondary using run rate; rate snapshot stability |
| Rounding | Avoid binary float display bugs; consistent rounding rules |
| Scale | Large quantities / values without overflow or precision collapse |

**Golden fixture (from MVP spec narrative):**

Given revenue `2787.09c`, investment `513.60c`, duration `99` minutes (`1.65h`), maps `40`:

- Profit = `2273.49c`
- Profit/hour ≈ `1377.87c` *(engine must define exact rounding; tests lock the chosen rule)*
- Profit/Waystone ≈ `56.83725c` → display per rounding policy
- Waystones/hour ≈ `24.2424…`
- ROI display `442.66%` (amended 2026-09-28 to match the engine test)

> Note: Spec mock UI shows `1,369.57c/h` for a `1h 39m` run; implementation tests must lock one consistent duration-hours definition and expected outputs. Discrepancies between narrative examples and engine math are resolved in favor of the engine’s documented formulas in `MVP_SPEC.md` §15–17, with expectations asserted in code.

### 6.2 API / integration

| Area | Cases |
| --- | --- |
| Strategies | Create / list / get / update / delete; name & game required |
| Runs | Create under strategy; list; get; update; delete |
| Validation | End before start; invalid extrapolated sample; negative maps; negative qty/price; missing item name |
| Calculations | Create/update returns calculated fields matching unit engine |
| Boundaries | Empty investment list; empty revenue list; qty = 0 allowed |
| Errors | Unknown IDs → not found; malformed payloads → 4xx |

### 6.3 E2E (Playwright)

| Journey | Assertions |
| --- | --- |
| Create strategy | After save, the home list shows the strategy and its cost per waystone |
| Update strategy | After save, the home list shows the new cost per waystone |
| Delete strategy | Confirmation required; cancelled delete keeps the strategy; confirmed delete removes it when it has no sessions |
| Record run | Enter investments, revenue, and an extrapolated duration; the session page shows the saved totals |
| Edit run | Change quantity; totals update after save |
| Delete run | Confirmation required; cancelled delete keeps run; confirmed delete removes run |

The seven browser lines on the coverage pages are checked. The specs are `e2e/strategies.spec.ts` and `e2e/sessions.spec.ts`, and the step files live under `automated/`. Those journeys run in CI against the Neon `ci` branch, which the workflow resets to the seed once per run (§10).

## 7. Acceptance criteria → tests (MVP snapshot)

This table records how the MVP requirements were assigned to layers. Post-MVP tickets do not extend it. They update the feature coverage page.

| Requirement (MVP) | Acceptance criteria (summary) | Primary tests |
| --- | --- | --- |
| Record investment/revenue | Line totals auto-calculated; user cannot edit totals | Unit + API + E2E |
| Manual prices | Price recorded-at and source stored and returned | API + E2E |
| Chaos / Divine | Chaos canonical; Divine via run rate snapshot | Unit + API |
| Duration metrics | Effective duration from chosen method; method labeled; zero duration → N/A rates | Unit + API |
| ROI | Unavailable when investment = 0 | Unit + API |
| Update strategy | After save, the home list shows the new cost per waystone | API + E2E |
| Delete strategy | Requires confirmation; a strategy with no sessions leaves the home list; a strategy that still has sessions shows the conflict message and stays | E2E (+ API delete) |
| Edit run | Derived values recalculate | API + E2E |
| Delete run | Requires confirmation | E2E (+ API delete) |
| PoE2 terminology | UI shows Waystone/Tablet labels | E2E smoke |
| No auth | App usable without login | E2E journey (implicit) |
| Deployable web app | App runs in deployed environment | Smoke / deploy checklist (manual or CI against staging) |

## 8. Non-goals for MVP testing

Explicitly **out of scope** for MVP automated testing:

- Full visual regression suite. Reopened on 2026-10-30 for phase 7: one baseline per page per viewport for the six pages, on the midnight workflow, not on the pull request. A pixel diff of the whole app stays closed.
- Authentication / authorization tests
- GGG API or stash reconciliation tests
- poe.ninja / market provider contract tests
- Load / performance benchmarking beyond smoke. Reopened on 2026-10-30 for phase 7: one k6 script against a Vercel Preview, off the pull request. Production and the Neon `ci` branch stay closed.
- Multi-tenant isolation tests
- Exhaustive cross-browser matrix (one primary browser in CI is enough for MVP; expand later)
- Statistical / community aggregation features
- **Prisma schema / generated migration SQL.** Declarative schema is not unit-tested (a test asserting "this column is `Decimal`" only re-reads the schema). Schema correctness is proven by the migration applying cleanly, the seed round-tripping expected values, and API tests validating responses against the Zod contracts.

## 9. Environments

| Environment | Purpose |
| --- | --- |
| Local | Dev loop; unit + contract API + `test:api:db` on the local branch + optional headed E2E |
| CI | Every pull request. The gates are §10. |
| Deployed demo | [poe-profit.vercel.app](https://poe-profit.vercel.app/). Smoke against this URL is manual. CI does not open it. |

Test data on public demos should be **synthetic**, not personal league economy data (ADR-007).

## 10. CI quality gates

A pull request should not merge unless CI is green. The gates, in order:

1. Lint
2. Typecheck
3. Unit tests
4. API / integration tests (`npm run test:api`)
5. Build
6. Playwright E2E. That job also runs `npm run test:api:db` first.

`format:check` exists as a script. It is not a gate.

CI runs that list on every push to `main` and every pull request. The contract API step does not run again as part of the Vercel deploy. `npm run test:api` is not given a database URL. CI runs `prisma generate` for it and does not apply migrations there. D1 and D2 call Route Handlers in-process with a Prisma fake (`tests/api/strategyDbMock.ts`, `tests/api/mapSessionDbMock.ts`).

The e2e job runs against the Neon `ci` branch (`CI_DATABASE_URL` / `CI_DATABASE_URL_UNPOOLED` injected as `DATABASE_URL` / `DATABASE_URL_UNPOOLED`). Once per job, Actions applies migrations and `prisma/reset-to-seed.ts`, then runs `npm run test:api:db`, then resets to the seed again, then Playwright. A failed persistence step skips Playwright. The second reset does not run when that step fails; the next job's first reset clears leftover `api-db-` rows. Resets run only when `DATABASE_RESET=ci` and `CI=true`, so CI cannot wipe the local or public database. The homepage smoke runs in the same job. E2E jobs queue so two runs do not share that wipe.

On E2E failure, CI should retain:

- Trace / screenshot / video (as configured)
- Test report output

Exact tooling (Vitest, Jest, Playwright reporters, etc.) is deferred to `ARCHITECTURE.md`; this strategy requires the **gates**, not a specific vendor.

## 11. Flake control

- Prefer deterministic fixtures over live clocks where possible; inject clocks in unit tests.
- Avoid depending on wall-clock “now” for price-recorded-at assertions unless necessary.
- Keep E2E count small and stable.
- Retry policy: at most a single controlled retry for known infra flakes—not as a substitute for fixing race conditions.
- Investigate flakes before expanding suite size.

## 12. Definition of done (testing)

A feature is not done when the UI looks right. The quality bar is:

1. Acceptance criteria are written.
2. Unit and/or API tests cover the risk, at the depth in §4.
3. A browser journey exists when the feature is user-facing and a person would otherwise have to look at the screen to believe it. Field validation does not qualify.
4. CI gates pass.
5. Failures produce enough artifacts to debug without re-running blindly.

v1 met that bar. `MVP_SPEC.md` §34 required the calculation engine, API, validation, and automated tests to meet it, not the UI alone.

A later ticket also updates the coverage page, as [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) describes. That page is how a reader sees the bar was met. It does not replace the bar.

## 13. Open items for architecture phase

Stack selection is done. Items below are closed unless still marked open:

- Exact unit test runner and decimal/money library — Jest + `decimal.js` (ADR-014 / ADR-015)
- API test harness — decided with D1 (2026-09-23) and split on 2026-09-28: contract tests are in-process Route Handlers plus a Prisma fake, and the quality job is not given a database URL. Persistence round-trips are `npm run test:api:db` in the e2e job, against the Neon `ci` branch.
- Playwright project layout and CI browser install
- Deploy smoke URL and secrets handling
- Precise rounding policy constants — decided 2026-09-23: internal full precision; display is 2 dp half-up via `roundForDisplay` (ADR-015 clarification)

Those decisions will land in `ARCHITECTURE.md` and may add follow-up ADRs.
