# Architecture Decision Records

This document records product and technical decisions for **POE Profit**.

Format for each ADR:

- **Status** — Accepted | Proposed | Superseded
- **Context** — Why the decision was needed
- **Decision** — What we chose
- **Consequences** — What follows from the choice

Related documents: [`MVP_SPEC.md`](./MVP_SPEC.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md).

---

## ADR-001: Product name — POE Profit

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |
| Revised | 2026-09-14 |

### Context

Planning used multiple working names (including “Exile Metrics,” “PoE Farming Tracker,” and **PoE Strategy Tracker**). The GitHub repo was renamed to **POE-Profit**; the product name is now **POE Profit**.

### Decision

Use **POE Profit** as the product name in UI, README, docs, and Cursor rules. GitHub repo: `TaylorOlson77/POE-Profit`. Former working names (Exile Metrics, PoE Farming Tracker, PoE Strategy Tracker) are historical only.

### Consequences

- Product copy should say POE Profit.
- Local disk folder may still be named `POE Strategy Tracker` until the workspace directory is renamed.
- “Poe Prophet” and other name jokes can stay in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) as lore only.

---

## ADR-002: PoE2-first UI terminology with a game-agnostic domain model

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

The developer is currently playing Path of Exile 2. Spreadsheet inspiration used PoE1 terms (maps, scarabs). Core farming concepts are shared; labels differ (Waystone / Tablet vs Map / Scarab).

### Decision

- MVP **UI copy** uses PoE2 terminology (Waystone, Tablet, etc.).
- The **domain model** uses game-agnostic concepts where the idea is shared, so PoE1 can be added later without rewriting the calculation engine.
- Each Strategy records which **game** it belongs to.

### Consequences

- UI strings and domain identifiers may differ; mapping must be intentional.
- Calculation rules stay game-agnostic.
- PoE1 support becomes primarily presentation + catalog/config work, not a rewrite of profit math.

---

## ADR-003: Chaos as canonical calculation currency; Divine secondary

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

Players think in both Chaos and Divine. Market rates change. Historical runs must remain stable when rates move.

### Decision

- **Chaos** is the canonical currency for all calculations.
- **Divine** is a secondary display representation.
- Each run stores the **Divine ↔ Chaos conversion rate used for that run** (snapshot), not a live global rate.

### Consequences

- Totals, profit, ROI, and efficiency metrics are computed in Chaos.
- UI may show Divine approximations using the run’s stored rate.
- Changing today’s Divine price must not rewrite past run results.
- Conversion and display rounding need explicit tests (see `TEST_STRATEGY.md`).

---

## ADR-004: Manual price snapshots with recorded timestamp and source

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

Automatic market integrations (e.g. poe.ninja) add scope and flakiness. Spreadsheet workflows already rely on prices recorded at a point in time. Price-at-time is an important distinction for honest profit reporting.

### Decision

- MVP pricing is **manual only**.
- Every valued line item records **unit value**, **price recorded at**, and **price source** (initially Manual).
- The data model distinguishes valuation types (at minimum: Market Value, Actual Paid Price, Actual Sale Price), even if the MVP UI primarily uses Market Value.

### Consequences

- No dependency on external price APIs in MVP.
- Historical profitability is explainable and auditable.
- Users must enter more data; UX should make price entry efficient.
- Future automatic pricing can attach new sources without changing the snapshot model.

---

## ADR-005: Strategy and Run are separate domain concepts

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

A farming approach is reusable; each session is a distinct observation. Mixing them (one blob per spreadsheet tab) makes comparison and analytics harder later.

### Decision

- A **Strategy** is a reusable definition of intent (name, game, description, optional defaults).
- A **Run** is one completed execution of a strategy with timing, line items, and calculated results.
- One Strategy has many Runs.

### Consequences

- Run history and strategy comparison become natural later features.
- Creating a run requires selecting (or creating) a strategy.
- Strategy deletion / archival rules must be defined carefully once data exists (deferred detail for architecture).

---

## ADR-006: Explicit duration method (observed, extrapolated, or manual)

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |
| Revised | 2026-09-11 |

### Context

Pure wall-clock start/end is honest about “how long the session lasted,” but it often **overstates active farming time** when the player takes a break, trades, helps someone, or AFKs. Many players instead time a sample (for example 10 Waystones in 20 minutes) and **extrapolate** to the full run: `(sampleDuration / sampleMaps) × mapsCompleted`.

That extrapolated figure is still an estimate, not a perfect truth—but for profit/hour comparisons it is often closer to how the community reasons about strategy efficiency.

Separately, stash before/after snapshots improve **loot/investment truth**; they do not replace a duration model. Duration method and valuation method are two different “how was this observation produced?” dimensions.

### Decision

MVP supports an explicit **duration method** on each Run. Rate metrics (profit/hour, maps/hour) always use the run’s **effective duration** derived from that method. Methods must never be silently mixed or relabeled as each other.

**Default method:** **Extrapolated** (new runs start on this method in the UI/API unless the user changes it).

**Duration methods (MVP):**

1. **Extrapolated** (default) — user records a timed sample (`sampleMapsCompleted`, `sampleDuration`);  
   `averageMinutesPerMap = sampleDuration / sampleMapsCompleted`;  
   `effectiveDuration = averageMinutesPerMap × mapsCompleted`.
2. **Observed** — `effectiveDuration = endTime - startTime` (wall clock).
3. **Manual** — user enters active farming duration directly (minutes), when they already know the figure they want to use.

UI and API must show **which method** produced the duration used for efficiency metrics.

Optional: runs may still store start/end for notes/history even when method is Extrapolated or Manual; those timestamps do **not** drive rate metrics unless method is Observed.

### Consequences

- New-run UX defaults to Extrapolated, matching common community timing practice.
- Profit/hour remains meaningful for “active mapping” style logging without pretending breaks did not happen.
- Community-style sample timing is first-class in MVP, not deferred.
- Validation differs by method (Observed: end ≥ start; Extrapolated: sampleMaps > 0, sampleDuration > 0, mapsCompleted ≥ 0; Manual: duration ≥ 0).
- Zero effective duration still yields N/A for rate metrics, never Infinity/NaN.
- Strategy comparison across runs with different duration methods requires care; future analytics should filter or label by method.
- Stash snapshot / reconciliation remains a later feature (roadmap); it complements this decision rather than replacing it.

---

## ADR-007: Deployable web app without authentication for MVP

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

The project is a resume / portfolio piece and a vehicle to practice deploying a real web application. Auth adds substantial scope (accounts, sessions, authorization, threat model) that is not required to prove calculation, API, UI, and QA skills.

### Decision

- MVP is a **deployable web application**.
- **No authentication** in MVP (explicit non-goal in `MVP_SPEC.md`).
- Public deployments may expose create/read/update/delete of strategy and run data to anyone with the URL.

### Consequences

- Faster path to a public demo and deployment learning.
- Privacy risk if real personal economy data is entered on a public instance — use sample/demo data on public deploys, or keep sensitive data on private environments.
- Adding auth later will require multi-tenancy / ownership on Strategy and Run.
- Security review for MVP focuses on input validation, abuse basics, and deployment hygiene—not identity.

---

## ADR-008: Shared calculation engine owns derived money and efficiency fields

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

Incorrect profit math is the highest product risk. Duplicating formulas in the UI and API invites drift and untestable bugs.

### Decision

- Implement a single **calculation engine** isolated from UI and transport layers.
- The API returns calculated fields; the UI displays them and does **not** re-implement business math as a second source of truth.
- Users never manually edit calculated totals.

### Consequences

- Unit tests concentrate on the engine (see `TEST_STRATEGY.md`).
- UI can still do ephemeral local preview only if it calls the same shared logic (or an equivalent package)—not a parallel formula set.
- Recalculation on edit is mandatory and must be covered by API and E2E tests.

---

## ADR-009: GitHub Issues + Projects (Kanban) for portfolio-visible process

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |
| Revised | 2026-09-14 |

### Context

The developer wants to demonstrate Scrum Master / Kanban / delivery skills alongside engineering. Linear has strong Cursor integration, but GitHub-native tooling keeps the process visible next to the public repository. Cutting Issues for every scaffold chore on a solo MVP adds overhead without much coordination value.

### Decision

- Use **GitHub Issues + GitHub Projects** (Kanban-style columns) as the process tracker for **post-baseline** work (features and fixes after a working MVP app exists).
- Track **Phase 1 / MVP baseline** progress in [`BACKLOG.md`](./BACKLOG.md) checklists — do not seed the board with foundation tickets.
- The POE Profit project board is already created; leave it mostly empty until baseline ships.
- Linear remains a possible later addition, not the default.

### Consequences

- Faster path through scaffold → calc → API → UI without ticket theater.
- After baseline, hiring managers can still see Issue → branch → PR → CI → Done on real feature work.
- Optional: one retrospective “Foundation” epic issue summarizing Phase 1 for board history.

---

## ADR-010: Line item quantity may be zero (quantity ≥ 0)

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

Early planning notes mixed `quantity > 0` and `quantity ≥ 0`. Zero-quantity lines can appear while drafting a run or representing intentionally empty categories without deleting the row.

### Decision

- Validation rule: **quantity ≥ 0** and **unit value ≥ 0**.
- Line totals for zero quantity are zero.
- Item name remains required on a line that is submitted as part of the run.

### Consequences

- Aligns `MVP_SPEC.md` validation with a single rule.
- API and UI validation tests should include quantity = 0 as valid.
- Negative quantity remains invalid.

---

## ADR-011: Neon as hosted Postgres; Vercel for app deploy

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

MVP needs a deployable web app and a relational store. Taylor prefers a Vercel-friendly free Postgres path familiar from prior work. Auth is out of scope for MVP but required later.

### Decision

- Deploy the Next.js app to **Vercel**.
- Use **Neon** as the hosted **Postgres** provider (connection string from Neon → app).
- Do **not** rely on Neon for application auth; future auth (e.g. Auth.js) will store users/sessions in the same Postgres.

### Consequences

- Standard portfolio stack: Next.js + Vercel + Neon Postgres.
- Free-tier limits may apply (storage/compute); paid host is optional later if limits hurt.
- Supabase Auth is not part of the plan; auth remains an app-layer concern.

---

## ADR-012: Prisma as the database access layer (ORM)

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-11 |

### Context

The app needs typed CRUD against Postgres without hand-writing all SQL on day one. Prisma and Drizzle were considered; raw SQL was deferred as a teaching default.

### Decision

Use **Prisma** for schema, migrations, and typed database access from the Next.js app.

### Consequences

- `schema.prisma` is the source of table shape; migrations update Neon.
- Calculation engine stays separate from Prisma (pure functions); Prisma loads/saves data, engine computes derived fields.
- Interview story: schema → migrate → Prisma Client → Postgres.

---

---

## ADR-013: Next.js Route Handlers (REST) for API / CRUD

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-13 |

### Context

The UI must talk to the server for Strategy/Run CRUD. Options considered: Route Handlers (REST), Server Actions, and tRPC. Taylor prefers an explicit HTTP API for learning and interview storytelling, including defining **contracts before implementation**.

### Decision

- Use **Next.js App Router Route Handlers** (`app/api/.../route.ts`) for writes and CRUD-style reads that belong to the HTTP API.
- Shape endpoints like REST resources aligned with `MVP_SPEC.md` (e.g. `/api/strategies`, `/api/runs`).
- Prefer **contract-first** workflow: agree request/response shapes (and status codes / error body) before building the handler; API tests assert against that contract.
- Server Components may still load data on the server for pages where that helps UX; they are not a substitute for the documented HTTP API.
- Server Actions and tRPC are out of scope for MVP.

### Consequences

- Strong SDET story: Playwright and API tests can hit real HTTP endpoints.
- Slightly more boilerplate than Server Actions; acceptable for learning and clarity.
- Contracts (OpenAPI sketch, shared Zod schemas, or a `docs`/types contract file — exact format TBD in architecture) become the handshake between UI, handlers, and tests.

---

## ADR-014: Jest as unit / API test runner

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-13 |

### Context

MVP needs a unit runner for the calculation engine and a lightweight runner for HTTP/API tests against Route Handlers. Options considered: Vitest vs Jest. Taylor prefers Jest for interview familiarity (“industry standard” recognition) while still following the test pyramid (Jest for unit/API; Playwright for E2E).

### Decision

- Use **Jest** for calculation-engine **unit tests** and for **API/integration tests** that hit Route Handlers over HTTP (or an equivalent in-process harness decided in architecture).
- Use **Playwright** for critical-path E2E only (already required by `TEST_STRATEGY.md`).
- Configure Jest for the Next.js / TypeScript project (e.g. `next/jest` or equivalent) in the architecture/setup phase.

### Consequences

- Strong resume/interview recognition; skills transfer to Vitest if needed later.
- Slightly more config friction than Vitest on modern ESM/TS — acceptable tradeoff.
- Clear layer story: Jest (unit + API) vs Playwright (browser journeys), not “Playwright for everything.”

---

## ADR-015: decimal.js for money and efficiency math

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-13 |

### Context

MVP calculations involve Chaos amounts, fractional quantities, ROI, and rate metrics. IEEE floats are a known source of currency bugs. Options considered: `decimal.js`, integer minor units, and plain `number` with display rounding.

### Decision

- Perform calculation-engine arithmetic with **`decimal.js`** (full package; not `decimal.js-light` — clarified 2026-09-14).
- Persist monetary amounts in Postgres in a precise form compatible with Prisma (exact column type TBD in architecture/schema; must not silently coerce to imprecise float).
- Round for **display** at the presentation layer; keep higher precision inside the engine per `MVP_SPEC.md` / `TEST_STRATEGY.md`.

### Consequences

- Clear interview story: money math never trusts raw JS floats.
- Unit tests assert Decimal-based results and edge cases (zero investment ROI, etc.).
- Slight dependency + learning curve; acceptable for a profit tracker.

---

## ADR-016: Single Next.js app with isolated domain/calc folder

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-13 |

### Context

Need a repo layout that keeps the calculation engine testable and separate from HTTP/UI, without a multi-package monorepo for MVP.

### Decision

- One **Next.js** application (not `apps/web` + `packages/*` monorepo for MVP).
- Put pure calculation logic under something like **`src/domain/calc`** (no Prisma, no Next imports).
- Put server concerns under **`src/server`** (Prisma client, services, validation wiring).
- Put shared API **contracts** under **`src/contracts`** (or equivalent) for contract-first Route Handlers.
- UI and Route Handlers live under **`app/`** per App Router conventions.

Exact folder names may be adjusted slightly in `ARCHITECTURE.md` as long as the isolation rule holds.

### Consequences

- Jest can unit-test `domain/calc` in isolation (ADR-008 / ADR-014).
- Route Handlers stay thin: validate → service → calc → respond.
- Avoids monorepo tooling overhead while still demonstrating layering.

---

## ADR-017: Zod for API contracts and request validation

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-14 |

### Context

Contract-first Route Handlers need a shared way to define request/response shapes and validate JSON at the HTTP boundary. TypeScript types alone only check at compile time.

### Decision

Use **Zod** schemas in `src/contracts` (and server validation wiring) as the source of runtime validation and inferred TypeScript types for Strategy/Run APIs.

### Consequences

- UI, handlers, and API tests share the same contract definitions.
- Invalid payloads fail with a consistent validation error shape before hitting Prisma/calc.
- Interview story: validate at the boundary, then trust typed data inside.

---

## ADR-018: Persist calculated fields on write/update (compute-on-write)

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-14 |

### Context

Run history needs profit, profit/hour, ROI, and related metrics. Those can be recomputed on every read from raw inputs, or computed once via the shared engine and stored with the run.

### Decision

- On **create and update**, run the calculation engine and **persist** derived fields on the Run (and return them in the API response).
- Historical rows keep the results produced by the equations that were in effect when the run was saved (same spirit as price snapshots).
- The calculation engine remains the only place business math lives; stored fields are denormalized engine output, not a second formula set.
- If formulas change later, old runs are not silently rewritten; a deliberate recompute/migration would be required.

### Consequences

- Fast history list reads without recalculating every row.
- Past observations stay stable when engine code evolves.
- Schema must include columns (or equivalent) for persisted calculated fields.
- Still store enough raw inputs to explain and, if needed, recompute intentionally.

---

## ADR-019: Test file layout — colocated unit; `tests/api`; `e2e/`

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-14 |

### Context

Need a clear home for Jest unit tests, Jest API tests, and Playwright E2E without confusing layers (ADR-014 / TEST_STRATEGY).

### Decision

- **Unit tests:** colocated next to the code under test (e.g. `src/domain/calc/*.test.ts`).
- **API tests:** under `tests/api/`.
- **E2E (Playwright):** under `e2e/` at the repo root.

### Consequences

- Unit tests stay discoverable beside pure modules.
- API and E2E stay in dedicated folders because they exercise HTTP/UI journeys, not a single source file.
- npm scripts and CI map cleanly to each folder/layer.

---

## ADR-015 clarification: full `decimal.js` (not light)

| Field | Value |
| --- | --- |
| Status | Accepted (clarification of ADR-015) |
| Date | 2026-09-14 |

### Decision

Use the full **`decimal.js`** package for MVP money/efficiency math, not `decimal.js-light`.

### Consequences

- Slightly larger dependency than the light variant; acceptable for correctness and interview clarity.
- ADR-015 otherwise unchanged.

---

## Future ideas (not ADRs yet)

Product bets that are **not** accepted decisions live in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) (creator fork/prefill, naming ideas, buy-filter regex, etc.). Graduate an idea into an ADR here only when we commit to it for a release.

Former proposed ADR-013 (creator strategy fork/prefill) was renumbered away; that idea lives as **FF-001** in `FUTURE_FEATURES.md`.

---

## Index

| ID | Title | Status |
| --- | --- | --- |
| ADR-001 | Product name — POE Profit | Accepted |
| ADR-002 | PoE2-first UI; game-agnostic domain | Accepted |
| ADR-003 | Chaos canonical; Divine secondary | Accepted |
| ADR-004 | Manual price snapshots | Accepted |
| ADR-005 | Strategy vs Run | Accepted |
| ADR-006 | Explicit duration method (observed / extrapolated / manual) | Accepted |
| ADR-007 | Deployable web app; no auth | Accepted |
| ADR-008 | Shared calculation engine | Accepted |
| ADR-009 | GitHub Issues + Projects | Accepted |
| ADR-010 | Quantity ≥ 0 | Accepted |
| ADR-011 | Neon Postgres + Vercel deploy | Accepted |
| ADR-012 | Prisma ORM | Accepted |
| ADR-013 | Route Handlers (REST) + contract-first API | Accepted |
| ADR-014 | Jest for unit / API tests | Accepted |
| ADR-015 | decimal.js for money math (full package) | Accepted |
| ADR-016 | Next app layout; isolated domain/calc | Accepted |
| ADR-017 | Zod for contracts / validation | Accepted |
| ADR-018 | Persist calculated fields on write | Accepted |
| ADR-019 | Test layout: colocated unit; tests/api; e2e/ | Accepted |
