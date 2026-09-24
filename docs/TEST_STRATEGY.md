# Test Strategy — POE Profit (MVP v1)

| Field | Value |
| --- | --- |
| Status | Draft |
| Scope | MVP v1 |
| Related | [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md) |
| Primary risk | Incorrect money, time, or efficiency calculations |

## 1. Purpose

This document defines how we will prove MVP behavior with automation, what each test layer owns, what we deliberately do **not** automate yet, and how CI will gate merges.

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

### 4.3 E2E — Playwright

**Owns**

- Create strategy → appears in list
- Record run with investment + revenue + prices + duration → displayed totals match expected fixture
- Edit quantity → totals recalculate
- Delete run → confirmation required → run gone from history
- Basic accessibility smoke where cheap (e.g. critical controls named / reachable)—not a full a11y audit in MVP

**Does not own**

- Every ROI edge case
- Auth flows (none in MVP)
- External market APIs
- Visual regression of the entire app

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
- ROI ≈ `442.55%`

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
| Create strategy | Form validation; strategy visible after save |
| Record run | Enter investments, revenue, price timestamps, start/end, waystone count; summary matches fixture |
| Edit run | Change quantity; totals update after save |
| Delete run | Confirmation required; cancelled delete keeps run; confirmed delete removes run |
| History | MapSession appears with key columns (profit, duration, strategy) |

## 7. Acceptance criteria → tests (lightweight traceability)

| Requirement (MVP) | Acceptance criteria (summary) | Primary tests |
| --- | --- | --- |
| Record investment/revenue | Line totals auto-calculated; user cannot edit totals | Unit + API + E2E |
| Manual prices | Price recorded-at and source stored and returned | API + E2E |
| Chaos / Divine | Chaos canonical; Divine via run rate snapshot | Unit + API |
| Duration metrics | Effective duration from chosen method; method labeled; zero duration → N/A rates | Unit + API |
| ROI | Unavailable when investment = 0 | Unit + API |
| Edit run | Derived values recalculate | API + E2E |
| Delete run | Requires confirmation | E2E (+ API delete) |
| PoE2 terminology | UI shows Waystone/Tablet labels | E2E smoke |
| No auth | App usable without login | E2E journey (implicit) |
| Deployable web app | App runs in deployed environment | Smoke / deploy checklist (manual or CI against staging) |

## 8. Non-goals for MVP testing

Explicitly **out of scope** for MVP automated testing:

- Full visual regression suite
- Authentication / authorization tests
- GGG API or stash reconciliation tests
- poe.ninja / market provider contract tests
- Load / performance benchmarking beyond smoke
- Multi-tenant isolation tests
- Exhaustive cross-browser matrix (one primary browser in CI is enough for MVP; expand later)
- Statistical / community aggregation features
- **Prisma schema / generated migration SQL.** Declarative schema is not unit-tested (a test asserting "this column is `Decimal`" only re-reads the schema). Schema correctness is proven by the migration applying cleanly, the seed round-tripping expected values, and API tests validating responses against the Zod contracts.

## 9. Environments

| Environment | Purpose |
| --- | --- |
| Local | Dev loop; unit + API + optional headed E2E |
| CI | Every PR: lint, typecheck, unit, API/integration, E2E |
| Deployed staging / demo | Manual or scheduled smoke against a live URL (portfolio demo) |

Test data on public demos should be **synthetic**, not personal league economy data (ADR-007).

## 10. CI quality gates

A pull request should not merge unless:

1. **Lint** passes
2. **Format** check passes (or format-on-commit is enforced)
3. **Typecheck** passes
4. **Unit tests** pass
5. **API / integration tests** pass
6. **Playwright E2E** critical journeys pass

**As implemented (A5 / B3):** CI runs lint → typecheck → unit → API → build → E2E. Gate 2 (format) is **not** enforced yet — `format:check` exists as a script only. CI also has **no database credentials**; it runs `prisma generate` but never applies migrations, so DB-backed API tests need a decision at D1/D2 (in-process mock vs ephemeral Neon branch per PR).

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

A feature is not done when the UI “looks right.” It is done when:

1. Acceptance criteria are written.
2. Unit and/or API tests cover the risk.
3. Critical path E2E coverage exists if the feature is user-facing and journey-critical.
4. CI gates pass.
5. Failures produce enough artifacts to debug without re-running blindly.

MVP v1 product DoD in `MVP_SPEC.md` §34 additionally requires the calculation engine, API, validation, and automated tests to meet these quality requirements—not UI alone.

## 13. Open items for architecture phase

These are intentionally deferred until stack selection:

- Exact unit test runner and decimal/money library
- API test harness (in-process vs HTTP against test container)
- Playwright project layout and CI browser install
- Deploy smoke URL and secrets handling
- Precise rounding policy constants — decided 2026-09-23: internal full precision; display is 2 dp half-up via `roundForDisplay` (ADR-015 clarification)

Those decisions will land in `ARCHITECTURE.md` and may add follow-up ADRs.
