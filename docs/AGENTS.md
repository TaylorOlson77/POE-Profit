# Agent handoff — POE Profit

Read this first in a new chat, then the docs listed under **Required reading**.

## Product / repo

| Thing | Value |
| --- | --- |
| Product name | **POE Profit** |
| GitHub repo | https://github.com/TaylorOlson77/POE-Profit |
| Project board | https://github.com/users/TaylorOlson77/projects/1 — **do not seed foundation tickets** |
| Local workspace | Often `d:\POE Strategy Tracker` (folder name may still be old) |

If the workspace is not a git clone of `POE-Profit` yet, clone or connect remotes before scaffolding so work lands in the right repo.

## Process (locked)

- **Until MVP baseline ships:** track work by checking off items in [`BACKLOG.md`](./BACKLOG.md). No per-chore GitHub Issues for scaffold / Prisma / Jest / CI.
- **After MVP baseline:** GitHub Issues + POE Profit board for features/fixes (ADR-009).
- **Options before code** for material decisions; durable choices go in [`DECISIONS.md`](./DECISIONS.md).
- Do **not** implement FF-* items in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) unless Taylor asks.

## Stack (locked — see ADRs)

Next.js App Router + TS · Vercel · Neon Postgres · Prisma · Route Handlers (REST, contract-first) · `decimal.js` · Jest (unit + API) · Playwright (E2E) · layout: `app/` + `src/contracts`, `src/domain/calc`, `src/server` (ADR-011–016).

## Current next step

**D1 — Strategy Route Handlers + API tests** per [`BACKLOG.md`](./BACKLOG.md) (C1–C3 calc engine done). Then D2 MapSession API → UI → deploy.

C3 is in the engine: `profitDivineApprox = profitChaos / divineRateChaos` (null when the rate is not positive), signed nullable on the contract, `roundForDisplay` is 2 dp half-up and is not applied inside C1/C2. Seed derives `9.6` from the engine. See the ADR-015 display-rounding clarification.

Plan and wait for Taylor’s review before modifying files (`.cursor/rules/ai-development-workflow.mdc`). Check off AC in `BACKLOG.md` as you finish each item. Do not commit until Taylor asks.

`docs/INTERVIEW_PREP.md` is **gitignored** local study notes. Do not add it back to git.

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

**CI**

- Order is lint → typecheck → unit → API → build → E2E. Typecheck runs **before** `build`, so app code must not depend on Next-generated types like `LayoutProps` (`app/layout.tsx` uses plain React props for this reason).
- CI has **no database access**; it only runs `prisma generate`. Migrations are applied locally against Neon. Decide at D1/D2 whether API tests get an ephemeral Neon branch instead of mocks.
- `format:check` is **not** a CI gate, `docs/` is in `.prettierignore`, and a few pre-existing `src/contracts` files fail Prettier. Don't reformat them as drive-by noise.
- `actions/checkout@v4` / `actions/setup-node@v4` emit a Node 20 deprecation annotation. Runs still pass; bump to `@v5` when convenient.

**Schema/contract parity**

- Prisma returns `Decimal` objects; services must serialize to decimal **strings** at the API boundary (`DecimalStringSchema`). Never `Number()` a money value.
- Nothing currently guards schema-vs-contract drift. That is the job of the D1/D2 API tests validating responses against the Zod schemas.

## Do not

- Re-litigate locked ADRs unless Taylor reopens them
- Duplicate profit math in the UI
- Add auth, tRPC, Server Actions-as-API, or poe.ninja in MVP
- Create a flood of GitHub Issues for Phase 1
