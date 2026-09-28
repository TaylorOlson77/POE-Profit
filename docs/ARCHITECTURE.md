# Architecture — POE Profit (MVP v1)

| Field | Value |
| --- | --- |
| Status | Draft |
| Date | 2026-09-13 |
| Revised | 2026-09-28 |
| Related | [`MVP_SPEC.md`](./MVP_SPEC.md), [`DECISIONS.md`](./DECISIONS.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md), [`AI_DEVELOPMENT.md`](./AI_DEVELOPMENT.md) |

This document records **how** we build the MVP. Product rules live in the spec and ADRs; this file is the system map.

---

## 1. Goals for the architecture

- Deployable web app (Vercel) with Postgres (Neon) — no auth in MVP.
- Correct, testable profit/efficiency math in an isolated calculation engine.
- Explicit REST API via Route Handlers, developed **contract-first**.
- Clear layers so interview explanations and the test pyramid stay honest.

---

## 2. Stack (locked)

| Layer | Choice | ADR |
| --- | --- | --- |
| App framework | Next.js (App Router), TypeScript | — |
| Hosting | Vercel | ADR-011 |
| Database | Neon Postgres | ADR-011 |
| ORM | Prisma | ADR-012 |
| HTTP API | Route Handlers (`app/api/...`) | ADR-013 |
| Money math | Full `decimal.js` | ADR-015 clarification |
| Unit / API tests | Jest | ADR-014 |
| E2E | Playwright | TEST_STRATEGY |
| Process board | GitHub Issues + Projects | ADR-009 |

---

## 3. Runtime shape

```text
Browser (React UI)
    │  HTTP JSON
    ▼
Route Handlers  (app/api/...)
    │
    ▼
Server services  (validate, load/save, orchestrate)
    │                    │
    ▼                    ▼
Prisma ────────────► Neon Postgres
    │
    ▼
Calculation engine  (src/domain/calc)  ← pure; Decimal only
    │
    ▼
Response DTO (includes calculated fields)
```

**Rules:**

- UI does **not** reimplement business math (ADR-008).
- API **returns** calculated fields (profit, profit/hr, ROI, etc.).
- `domain/calc` imports neither Prisma nor Next.js.

---

## 4. Repository layout

```text
app/
  (pages, layouts, UI)
  api/
    strategies/
    map-sessions/
      .../route.ts          # Route Handlers

src/
  contracts/                # Zod request/response schemas and the shared error shape
  domain/
    calc/                   # Pure calculation engine (Jest unit tests)
  server/
    db/                     # Prisma client singleton
    services/               # Orchestration: DB + calc
  ui/                       # Display formatters and form → write-body transforms

prisma/
  schema.prisma
  migrations/

tests/
  api/                      # Jest API / integration tests (ADR-019)
e2e/                        # Playwright
# Unit tests: colocated *.test.ts next to source (e.g. src/domain/calc)

docs/
```

Isolation rule (ADR-016): calc stays pure; handlers stay thin.

---

## 5. Contract-first API workflow

Before implementing a handler:

1. Define the **contract** in `src/contracts` (TypeScript types and/or Zod schemas): path, method, request body, success response, error body, status codes.
2. Optionally mirror a short note in docs or OpenAPI later — TS/Zod is enough for MVP.
3. Write or sketch **API tests** against that contract (failing first is fine).
4. Implement Route Handler → service → Prisma/calc.
5. Wire UI to the same contract types.

### 5.1 Initial resources (from MVP_SPEC)

| Resource | Methods (MVP intent) |
| --- | --- |
| `/api/strategies` | `GET` list, `POST` create |
| `/api/strategies/[id]` | `GET`, `PUT`, `DELETE` |
| `/api/map-sessions` | `GET` list, `POST` create |
| `/api/map-sessions/[id]` | `GET`, `PUT`, `DELETE` |

Exact query params (filter by strategy, sort) can be added when tickets are cut.

### 5.2 Error shape (convention)

Use one consistent JSON error body for 4xx/5xx, e.g.:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": []
  }
}
```

Finalize field names when the first contract is written; keep them stable.

**B1 finalized:** see `src/contracts/errors.ts` (`ApiErrorBody`) and `src/contracts/strategies.ts` (status-code table in file header).

---

## 6. Calculation engine

- Location: `src/domain/calc`
- Input: a run-like structure (investment lines, revenue lines, duration method fields, maps completed, divine rate, …)
- Output: derived fields (line totals, totals, profit, effective duration, profit/hr, profit/map, maps/hr, ROI, N/A where required)
- Arithmetic: **decimal.js** (ADR-015)
- Duration methods: Observed | Extrapolated | Manual (ADR-006); never silent mix
- Covered heavily by Jest unit tests (`TEST_STRATEGY.md`)

---

## 7. Persistence (Prisma + Neon)

Conceptual model (MVP_SPEC):

```text
Strategy 1──* StrategyEnhancementLine
Strategy 1──* MapSession 1──* MapSessionInvestmentLine
                        1──* MapSessionRevenueLine
```

Implemented in `prisma/schema.prisma` (B3): cuid string IDs, `Decimal(20, 8)` for all money/quantities, DB enums for `Game` / `DurationMethod` / `PriceSource` / `ValuationType`, free-text revenue `category`, cascade delete on child lines, and `Restrict` on `MapSession → Strategy` — see **ADR-021**.

**Principle:** store enough raw inputs to recompute or explain a run; derived fields always come from the shared engine (ADR-008).

**Decision (ADR-018):** compute on **write and update**, persist denormalized calculated fields for history performance and historical stability. Do not silently rewrite old rows when formulas change.

---

## 8. Testing layout

| Layer | Tool | Location (ADR-019) |
| --- | --- | --- |
| Unit | Jest | Colocated `*.test.ts` (e.g. under `src/domain/calc`) |
| API | Jest, in-process Route Handlers (D1: Prisma fake, no `DATABASE_URL` in CI) | `tests/api/` |
| E2E | Playwright | `e2e/` (specs, `pages/` helpers, `fixtures.ts`, `dbCleanup.ts`) |

CI: lint → typecheck → unit → API → build → E2E (see `TEST_STRATEGY.md`). Before E2E, once per job, Actions migrates and resets the Neon `ci` branch to the seed. The homepage smoke runs in that same job.

---

## 9. Config & secrets

| Concern | Approach |
| --- | --- |
| DB URL | Pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`. Local: `.env.local` (Neon `local`). Public: Vercel and `.env.neon-production` (Neon `production`). CI: secrets `CI_DATABASE_URL` / `CI_DATABASE_URL_UNPOOLED` (Neon `ci`). |
| Never commit | `.env` / credentials |
| Public demo | [poe-profit.vercel.app](https://poe-profit.vercel.app/) — sample data only (ADR-007) |

---

## 10. Out of scope for this architecture (MVP)

- Auth / multi-tenancy
- tRPC / Server Actions as the primary API
- poe.ninja live pricing
- Monorepo packages
- Stash API / GGG integration

See `FUTURE_FEATURES.md` for later product ideas.

---

## 11. Next engineering steps (after this doc)

The MVP baseline is deployed at [poe-profit.vercel.app](https://poe-profit.vercel.app/). Steps below are done. New work uses the GitHub Project board (ADR-009).

1. Scaffold Next.js + Prisma + Jest + Playwright tooling (Phase 1 A1–A5).
2. Write first **contracts** for Strategy CRUD.
3. Implement calc engine + unit tests.
4. Implement Route Handlers + API tests.
5. Thin UI for strategies/runs.
6. Deploy (Vercel + Neon). After MVP baseline, use the GitHub Project board for new features.

Handoff for new agents: [`AGENTS.md`](./AGENTS.md).

---

## 12. Scaffold micro-decisions (resolved 2026-09-14)

| Topic | Choice | Where |
| --- | --- | --- |
| Decimal library | Full `decimal.js` | ADR-015 clarification |
| Contracts / validation | Zod | ADR-017 |
| Calculated fields | Persist on write/update | ADR-018 |
| Test file layout | Colocated unit; `tests/api/`; `e2e/` | ADR-019 |
