# Agent handoff — POE Profit

Read this first in a new chat, then the docs listed under **Required reading**.

## Product / repo

| Thing | Value |
| --- | --- |
| Product name | **POE Profit** |
| GitHub repo | https://github.com/TaylorOlson77/POE-Profit |
| Project board | https://github.com/users/TaylorOlson77/projects/1 — **do not seed foundation tickets** |
| Local workspace | `d:\POE Profit` (older copies may still be named `POE Strategy Tracker`) |

## Process (locked)

- **Until MVP baseline ships:** track work by checking off items in [`BACKLOG.md`](./BACKLOG.md). No per-chore GitHub Issues for scaffold / Prisma / Jest / CI.
- **After MVP baseline:** GitHub Issues + POE Profit board for features/fixes (ADR-009).
- **Options before code** for material decisions; durable choices go in [`DECISIONS.md`](./DECISIONS.md).
- Do **not** implement FF-* items in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) unless Taylor asks.

## Stack (locked — see ADRs)

Next.js App Router + TS · Vercel · Neon Postgres · Prisma · Route Handlers (REST, contract-first) · `decimal.js` · Jest (unit + API) · Playwright (E2E) · layout: `app/` + `src/contracts`, `src/domain/calc`, `src/server` (ADR-011–016).

## Current next step

**D2 — MapSession Route Handlers + calc integration + API tests** per [`BACKLOG.md`](./BACKLOG.md) (D1 strategy API done). Then UI → deploy.

### D1 decisions (locked unless Taylor reopens them)

- API tests call Route Handlers in-process with the Prisma fake in `tests/api/strategyDbMock.ts`. CI still has no `DATABASE_URL`. A Neon round-trip is deferred.
- `DELETE` of a strategy that still has map sessions returns **409 `CONFLICT`**. 404 is an unknown id. 204 is a delete with no sessions. E1 should show `error.message`.
- Money on the wire goes through `decimalToWire` (`src/server/money.ts`): plain decimal strings, no `Number()`, no `roundForDisplay`.

### D2 handoff (start a new chat with this)

Follow `.cursor/rules/ai-development-workflow.mdc`: **plan and wait for Taylor’s review before modifying files.**

**Read first:** this file (especially Tooling gotchas), then `ARCHITECTURE.md` §5, `DECISIONS.md` (**ADR-006, 008, 013, 018**), `TEST_STRATEGY.md` §4.2 and §4.4, `src/contracts/mapSessions.ts`, `src/domain/calc` (`calculateSession` — do not reimplement it), and the D1 strategy routes as the pattern (`app/api/strategies`, `src/server/services/strategies.ts`, `tests/api/strategies.test.ts`). Before writing Route Handlers, read the Next.js guide under `node_modules/next/dist/docs/` — `params` is a `Promise`. Do not use generated `RouteContext` types; typecheck runs before `next build`.

**Copy from D1:** thin handlers, a service that takes `PrismaClient`, `decimalToWire` on every money field (including signed and nullable session fields), API tests that `jest.mock` `@/src/server/db/prisma` with an in-memory fake, and responses parsed with the Zod schema. One example per contract outcome. Do not add a Neon CI database unless Taylor asks.

**D2 specifics:** duration method is the discriminated union in the contract (ADR-006). Calculated fields are server-owned; a client must not be able to supply them as the source of truth. `profitDivineApprox` stays null when the divine rate is not positive. Deleting a map session is `204` or `404` (sessions are the child; Restrict applies when deleting a strategy that still has sessions, which D1 already returns as `409`).

**Constraints:**

- Do **not** start UI or Playwright flows.
- Do **not** change C1–C3 formulas or call `Decimal.set()`.
- Users cannot PATCH calculated fields as source of truth.
- Colocated unit tests stay next to services if you add pure helpers; HTTP tests stay in `tests/api/`.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run test:api`. Do not commit until Taylor asks.
- `.cursor/settings.json` is local editor config. Do not commit it.
- `docs/INTERVIEW_PREP.md` is **gitignored** local study notes. Do not add it back to git.

**C3 (done, for D2):** `profitDivineApprox = profitChaos / divineRateChaos` (null when the rate is not positive), signed nullable on the MapSession contract, `roundForDisplay` is 2 dp half-up and is not applied inside the engine. Seed derives `9.6` from the engine. ADR-015 display-rounding clarification.

**Windows:** Taylor’s shell is PowerShell — no bash heredocs. Prisma is pinned at 6.19.0.

## Required reading (build chat)

1. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system map + folder layout  
2. [`DECISIONS.md`](./DECISIONS.md) — ADRs (especially 006–016)  
3. [`MVP_SPEC.md`](./MVP_SPEC.md) — product rules + non-goals  
4. [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) — what to test  
5. [`BACKLOG.md`](./BACKLOG.md) — Phase 1 checklist  
6. [`AI_DEVELOPMENT.md`](./AI_DEVELOPMENT.md) — working contract with Taylor  

## Scaffold micro-decisions (resolved)

- Full **`decimal.js`** (not light) — ADR-015 clarification
- **Zod** for contracts / validation — ADR-017
- **Compute-on-write** (persist calculated fields) — ADR-018
- Tests: colocated unit `*.test.ts`; `tests/api/`; `e2e/` — ADR-019
- Persistence: cuid IDs, `Decimal(20, 8)` money, separate line tables — ADR-021

## Tooling gotchas (learned the hard way)

**Windows / PowerShell**

- Taylor's shell is PowerShell: **no heredocs**. Multi-line commit messages go in a temp file via `git commit -F <file>`, not `-m "$(cat <<'EOF' ...)"`.

**Prisma**

- `prisma` / `@prisma/client` are **pinned to 6.19.0**. Do not run `npm install prisma@latest` — it pulls 7.x/8.x release candidates and previously corrupted `node_modules` with hanging installs.
- This repo blocks postinstall scripts by default. New packages with binaries (`esbuild`, Prisma engines) must be listed in `package.json#allowScripts` and reinstalled, or their binaries never land.
- Every `db:*` script is wrapped in `dotenv -e .env.local --`. A bare `npx prisma validate` fails with `Environment variable not found: DATABASE_URL_UNPOOLED` — that is a missing env var, **not** schema drift. Use `npm run db:migrate:status` to check drift.
- `package.json#prisma` (the seed hook) prints a Prisma 7 deprecation warning on every command. Harmless; migrate to `prisma.config.ts` when the version is bumped.
- `npx prisma format` reformats `schema.prisma` but does not change semantics — re-run `db:migrate:status` after to confirm.

**Zod 4**

- Cannot `.merge()` a `ZodDiscriminatedUnion` into an object. Chain `.and()` instead (see `MapSessionSchema`).

**decimal.js**

- `Decimal.toString()` uses scientific notation for small values (`"0.00000001"` becomes `"1e-8"`). `DecimalStringSchema` rejects that. Serialize with `decimalToWire` in `src/server/money.ts` (`toFixed`, then strip storage-scale zeros). Never `Number()` a money value.

**Jest API tests**

- `jest.mock("@/...")` needs `moduleNameMapper` in `jest.api.config.mjs` (`^@/(.*)$` → `<rootDir>/$1`). Load the fake with `jest.requireActual`. A raw `require()` fails `@typescript-eslint/no-require-imports`.

**CI**

- Order is lint → typecheck → unit → API → build → E2E. Typecheck runs **before** `build`, so app code must not depend on Next-generated types like `LayoutProps` (`app/layout.tsx` uses plain React props for this reason).
- CI has **no database access**; it only runs `prisma generate`. Migrations are applied locally against Neon. D1 API tests use an in-process Prisma fake. A Neon round-trip is still deferred.
- `format:check` is **not** a CI gate, `docs/` is in `.prettierignore`, and a few pre-existing `src/contracts` files fail Prettier. Don't reformat them as drive-by noise.
- `actions/checkout@v4` / `actions/setup-node@v4` emit a Node 20 deprecation annotation. Runs still pass; bump to `@v5` when convenient.

**Schema/contract parity**

- Prisma returns `Decimal` objects; services must serialize to decimal **strings** at the API boundary via `decimalToWire`. Never `Number()` a money value.
- D1 strategy API tests parse responses with the Zod schemas. D2 map-session tests must do the same. The fake still does not prove Postgres `Restrict` or `Decimal(20, 8)` scale.

## Do not

- Re-litigate locked ADRs unless Taylor reopens them
- Duplicate profit math in the UI
- Add auth, tRPC, Server Actions-as-API, or poe.ninja in MVP
- Create a flood of GitHub Issues for Phase 1
