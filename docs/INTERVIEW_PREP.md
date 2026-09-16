# Interview Prep — POE Profit

Living study guide. Add questions as we make decisions and build features.  
Use this for self-study; ask Cursor to quiz you from this file.

Related: [`AI_DEVELOPMENT.md`](./AI_DEVELOPMENT.md), [`DECISIONS.md`](./DECISIONS.md).

---

## How to use

- **Study:** Cover the answer, say it out loud, then check.
- **Quiz mode:** In a new chat: *“Quiz me from `docs/INTERVIEW_PREP.md`. Ask one question at a time. Don’t reveal the answer until I try.”*
- **After each architecture/feature chunk:** Add 3–5 new Q&As.

---

## Process & mindset

### Q: What’s the difference between vibe coding and AI-assisted development on this project?

**Answer sketch:** Vibe coding accepts generated output without owning requirements, tradeoffs, or tests. AI-assisted development means I define/accept requirements, choose among options with reasons, keep decisions in docs, and can explain the system and tests in an interview.

### Q: Where do durable decisions live, and why not only in chat?

**Answer sketch:** In `docs/` (MVP spec, ADRs, architecture, test strategy). Cursor chats don’t fully carry memory across sessions; git-tracked docs are the source of truth for me and for future chats.

### Q: What is the highest product risk in the MVP?

**Answer sketch:** Incorrect money/time/efficiency calculations (profit, ROI, profit/hour). That’s why the calculation engine is isolated and unit-test heavy.

---

## Product decisions (current)

### Q: Why Chaos as the canonical currency with Divine secondary?

**Answer sketch:** One calculation currency avoids ambiguous math. Divine display uses a **per-run** conversion snapshot so historical results don’t drift when the market moves. (ADR-003)

### Q: Why manual price snapshots instead of poe.ninja in MVP?

**Answer sketch:** Keeps scope small, avoids flaky external deps, and forces honest “price at time” recording. Model still allows other sources later. (ADR-004)

### Q: Why Strategy and MapSession as separate concepts?

**Answer sketch:** Strategy is reusable intent (including a per-map cost template); MapSession is one completed mapping session / observation. Enables history and future comparison without conflating plan vs result. Formerly called Run; renamed for clarity. UI can still use branded labels. (ADR-005)

### Q: Why support Observed, Extrapolated, and Manual duration — with Extrapolated default?

**Answer sketch:** Wall-clock often includes breaks and inflates time. Community workflows often time a sample of maps and extrapolate. We label the method so profit/hour isn’t silently comparing different measurement styles. Default Extrapolated matches common practice. (ADR-006)

### Q: Why no auth on a deployable web app?

**Answer sketch:** Portfolio/learning MVP prioritizes calc/API/UI/tests/deploy over identity. Tradeoff: public URL can expose data — use demo data publicly. (ADR-007)

---

## Architecture (fill as we decide)

<!-- Add Q&As after each architecture choice: Next.js shape, Postgres host, ORM, test runners, etc. -->

### Q: Why a single full-stack Next.js app instead of separate frontend and backend repos/services?

**Answer sketch:** Fewer moving parts for a learning MVP; one deploy target (Vercel); still demonstrates API routes, UI, DB, and E2E. Classic split frontend/backend is valuable later if the system grows.

### Q: Why Postgres?

**Answer sketch:** Relational model fits Strategy → Runs → Line items; strong ecosystem; familiar from prior work; free-tier hosted options pair well with Vercel.

### Q: What is Neon, and why use it instead of Supabase or Railway?

**Answer sketch:** Neon is hosted Postgres. The app connects with a connection string and runs SQL (via Prisma). Supabase also offers Postgres plus extras like Auth; Railway is another host often paid. We chose Neon to stay focused on Postgres + Vercel without adopting a whole BaaS. Auth later is still app-level (e.g. Auth.js) storing users in the same DB. (ADR-011)

### Q: What is Prisma?

**Answer sketch:** An ORM — a TypeScript library that maps our schema to Postgres tables and gives typed CRUD helpers (`create`, `findMany`, etc.) so we don’t hand-write every SQL statement. It does migrations too. The calculation engine stays separate pure logic; Prisma is for persistence. (ADR-012)

### Q: Why Route Handlers instead of Server Actions or tRPC?

**Answer sketch:** We want an explicit REST-style HTTP API (`app/api/...`) that matches the MVP spec, is easy to test with real requests, and supports contract-first development (define request/response shapes before coding). Server Actions are convenient but weaker as an “API” story. tRPC is typed and powerful but extra concepts for MVP. (ADR-013)

### Q: What does contract-first mean for this API?

**Answer sketch:** Before implementing a handler, we agree what the endpoint accepts and returns (status codes, body fields, error shape). UI, Route Handler, and API tests all target that contract so we don’t invent the response shape while coding.

---

## Testing (seed)

### Q: What does the test pyramid mean for this app?

**Answer sketch:** Most coverage on the calculation engine (unit); solid API/integration tests for CRUD/validation/calculated fields; few Playwright journeys for critical paths — not every math edge case in the browser.

### Q: Why Jest instead of Vitest?

**Answer sketch:** Both are fine for a Next.js MVP; APIs are similar. I chose Jest for broader interview recognition and existing familiarity in the industry. Unit and API tests run in Jest; Playwright stays reserved for full UI journeys. Vitest is common on new greenfield TS apps — skills transfer either way. (ADR-014)

### Q: Why decimal.js for money?

**Answer sketch:** JavaScript numbers are binary floats and can mis-handle currency arithmetic. The calculation engine uses decimal.js so profit/ROI math is explicit and testable; display rounding happens at the edge. (ADR-015)

### Q: How is the calculation engine kept separate from the API?

**Answer sketch:** Pure functions live under `src/domain/calc` with no Prisma or Next imports. Route Handlers call server services that load data, run the engine, and return DTOs including calculated fields. (ADR-008, ADR-016)

### Q: Why should the API return calculated fields instead of letting the UI recompute profit?

**Answer sketch:** Single source of truth (calculation engine). Prevents UI/API drift. UI displays; engine computes. (ADR-008)

### Q: Why does the calc engine return decimal.js Decimal instead of API decimal strings?

**Answer sketch:** Three representations exist on purpose. JSON has no decimal type, so the API uses strings (`DecimalStringSchema`). Prisma hydrates `Decimal` objects from `NUMERIC(20, 8)` columns. The engine speaks `decimal.js` so it can `.plus()` / `.times()` without wrapping on every call, and so C3 can round Decimals for display later. Conversion lives in server services at the boundary — never `Number()` a money value, and never import Prisma into `src/domain/calc`. (ADR-015, ADR-016, ADR-021)

### Q: Why is session map spend not an investment line?

**Answer sketch:** Map/waystone cost is a required 1:1 slot (`mapsCompleted × mapUnitCostChaos`). If it were also a line, total investment would double-count it. Enhancement/tablet costs are lines; the map is not. Strategy per-map cost is the same idea: `mapUnitCost + sum(quantity × unitCost)` for enhancements, not a sum of unit costs that ignores quantity. (ADR-020)

### Q: Why doesn’t C1 call Decimal.set() or round results?

**Answer sketch:** `Decimal.set()` is process-global and could surprise Prisma or other code. C1 keeps full precision and does not round; display rounding is C3 and should be per-call (`toDecimalPlaces`), not a global config. Historical financial math stays deterministic that way. (ADR-015)

---

## Quiz log

| Date | Focus | Result / notes |
| --- | --- | --- |
| | | |
