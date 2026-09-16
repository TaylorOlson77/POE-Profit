# MVP backlog

| Field | Value |
| --- | --- |
| Status | Active — Phase 1 tracked here; GitHub Issues after MVP baseline |
| Based on | [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`MVP_SPEC.md`](./MVP_SPEC.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) |
| Board | [POE Profit](https://github.com/users/TaylorOlson77/projects/1) (ADR-009) — use after baseline app |

## How we track work

**Phase 1 (Foundation → working MVP baseline):** track progress in this file. Check items off as we go. Do **not** cut individual GitHub Issues for scaffold / Prisma / Jest / CI — solo overhead isn’t worth it yet.

**After MVP baseline:** use GitHub Issues + the POE Profit board for features and fixes (one ticket per change): Issue → branch → PR → Done. That’s the portfolio-visible process story.

Optional later: one closed “Foundation” epic on the board summarizing Phase 1 — not required to start building.

Suggested labels when Issues start: `epic`, `setup`, `domain`, `api`, `ui`, `test`, `ci`, `docs`

Suggested Project columns: Backlog → Ready → In Progress → In Review → Testing → Done

---

## Phase 1 — Foundation (markdown checklist)

Rough order: A1 → A2 → A3 → A4 → A5. A4 can overlap with A2/A3 after scaffold exists. Continue through contracts, calc, API, UI, and deploy in the sections below until MVP baseline ships — still check off here, not as Issues.

### A1. Scaffold Next.js + TypeScript app
**Labels:** `setup`  
**AC:**
- [x] Next.js App Router + TypeScript project exists in repo root (or agreed app folder)
- [x] ESLint + Prettier (or project formatter) configured
- [x] README with how to run locally
- [x] Matches layout intent in ARCHITECTURE.md (`app/`, `src/...`)

### A2. Add Prisma + Neon connection
**Labels:** `setup`  
**Depends on:** A1  
**AC:**
- [x] Prisma installed; `schema.prisma` present
- [x] `DATABASE_URL` documented (`.env.example`, not committed secrets)
- [x] Can connect to Neon (or local Postgres) and run a no-op migrate/status
- [x] `src/server/db` Prisma client singleton pattern

### A3. Add Jest (unit + API) and Playwright (E2E)
**Labels:** `setup`, `test`  
**Depends on:** A1  
**AC:**
- [x] Jest runs via npm script; sample/smoke test passes
- [x] Playwright installed; smoke config present (may skip real journeys until UI exists)
- [x] Scripts documented: `test`, `test:api` (or equivalent), `test:e2e`
- [x] Clear separation: Jest ≠ Playwright (ADR-014)

### A4. Add decimal.js and domain/calc stub
**Labels:** `setup`, `domain`  
**Depends on:** A1  
**AC:**
- [x] `decimal.js` (or light) dependency added
- [x] `src/domain/calc` folder with placeholder export
- [x] Stub unit test proves Jest can import calc module
- [x] Calc module has **no** Prisma/Next imports

### A5. CI pipeline (lint, typecheck, unit, api, e2e)
**Labels:** `ci`, `test`  
**Depends on:** A1–A3  
**AC:**
- [x] GitHub Actions (or equivalent) on PR
- [x] Gates match TEST_STRATEGY: lint → typecheck → unit → api → e2e
- [x] E2E artifacts (screenshot/trace) on failure when e2e exists

---

## Remaining MVP work (still markdown until baseline)

Epics B–F below are the rest of the path to MVP. Keep checking them off here. After the app meets MVP Definition of Done, new work goes on the GitHub board instead.

## Epic B — Contracts & data model

### B1. Define Strategy API contracts (contract-first)
**Labels:** `api`, `docs`  
**Depends on:** A1  
**AC:**
- [x] `src/contracts` types/Zod for Strategy list/create/get/update/delete
- [x] Documented status codes + shared error shape
- [x] No handler implementation required in this ticket (contract only is OK)
- [x] Interview-ready: contract exists before Route Handlers

### B2. Define MapSession API contracts (including calculated fields)
**Labels:** `api`, `docs`  
**Depends on:** B1  
**AC:**
- [x] Contracts for MapSession list/create/get/update/delete
- [x] Response includes calculated fields (profit, profit/hr, ROI, duration method label, etc.)
- [x] Duration method discriminated fields called out (Observed / Extrapolated / Manual)
- [x] Error/validation shape consistent with B1

### B3. Prisma schema: Strategy, MapSession, line items
**Labels:** `setup`  
**Depends on:** A2, B2 (at least draft)  
**AC:**
- [x] Models for Strategy, MapSession, investment/revenue lines (or unified line item)
- [x] Enums: game, duration method, valuation type as needed
- [x] Decimal-safe money fields (not imprecise float)
- [x] Migration applied to Neon/dev DB
- [x] Seed optional demo data for public deploy later

---

## Epic C — Calculation engine

### C1. Calc engine: line totals, investment, revenue, profit
**Labels:** `domain`, `test`  
**Depends on:** A4  
**AC:**
- [x] Pure functions for line total, totals, profit
- [x] decimal.js throughout
- [x] Jest tests: basics, fractions, decimals, negative profit, zero lines
- [x] No HTTP/DB dependencies

### C2. Calc engine: duration methods + rate metrics + ROI
**Labels:** `domain`, `test`  
**Depends on:** C1  
**AC:**
- [ ] Extrapolated / Observed / Manual effective duration
- [ ] profit/hr, profit/map, maps/hr, ROI
- [ ] N/A (not Infinity/NaN) for zero duration, zero maps, zero investment
- [ ] Jest coverage per TEST_STRATEGY risk table

### C3. Calc engine: Divine secondary display + rounding policy
**Labels:** `domain`, `test`  
**Depends on:** C1  
**AC:**
- [ ] Chaos canonical; Divine approx from run-stored rate
- [ ] Documented display rounding vs internal precision
- [ ] Tests for conversion and display helpers

---

## Epic D — API (Route Handlers)

### D1. Strategy Route Handlers + API tests
**Labels:** `api`, `test`  
**Depends on:** B1, B3, A3  
**AC:**
- [ ] `app/api/strategies` CRUD implemented against contracts
- [ ] Validation errors return shared error shape
- [ ] Jest API tests hit HTTP endpoints (or agreed harness)
- [ ] Handlers stay thin; logic in `src/server/services`

### D2. MapSession Route Handlers + calc integration + API tests
**Labels:** `api`, `test`  
**Depends on:** B2, B3, C2, D1  
**AC:**
- [ ] MapSession CRUD; create/update runs calc engine and returns calculated fields
- [ ] Duration method validation per ADR-006
- [ ] API tests: happy path, validation, calculated field correctness, delete
- [ ] Users cannot PATCH calculated fields as source of truth

---

## Epic E — UI

### E1. Strategies list + create/edit (thin UI)
**Labels:** `ui`  
**Depends on:** D1  
**AC:**
- [ ] List strategies; create/edit/delete with confirmation where needed
- [ ] Uses API contracts; PoE2 terminology in copy
- [ ] Basic empty/error states

### E2. MapSession entry UI (spreadsheet-like) + history
**Labels:** `ui`  
**Depends on:** D2, E1  
**AC:**
- [ ] Create/edit map session: investment + revenue lines, duration method fields, maps completed
- [ ] Displays calculated totals from API (not recomputed ad hoc in UI)
- [ ] Duration method label visible
- [ ] MapSession history table with key columns from MVP_SPEC

### E3. Playwright E2E: strategy + run happy paths
**Labels:** `test`, `ui`  
**Depends on:** E2, A3  
**AC:**
- [ ] E2E: create strategy → create run → see calculations → edit → delete (per TEST_STRATEGY)
- [ ] Artifacts on failure
- [ ] Stable selectors; minimal flake

---

## Epic F — Deploy & portfolio polish

### F1. Vercel deploy + Neon production URL
**Labels:** `setup`  
**Depends on:** D2 (min), preferably E2  
**AC:**
- [ ] App deployed to Vercel
- [ ] Env vars set; migrations applied
- [ ] Demo/sample data only on public URL (ADR-007)
- [ ] README deploy notes

### F2. Seed GitHub Project workflow documentation
**Labels:** `docs`  
**AC:**
- [ ] Short doc or README section: Issue → branch → PR → CI → Done
- [ ] Link to Project board

---

## Build order (markdown phase)

1. A1 Scaffold  
2. A2 Prisma/Neon  
3. A3 Jest + Playwright  
4. A4 decimal + calc stub  
5. A5 CI  
6. B1 Strategy contracts  
7. C1 Calc basics  
…then B2/B3/C2 → D1 → D2 → E1 → E2 → E3 → F1

---

## Notes for later issue creation (post-baseline)

When cutting GitHub Issues for post-MVP work, paste AC into the body. Prefix titles if helpful (e.g. `[Feature] Strategy comparison`).

Do **not** create tickets for FF-* future features unless explicitly asked.
