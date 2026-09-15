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

**B1 — Strategy API contracts** per [`BACKLOG.md`](./BACKLOG.md) (Phase 1 A1–A5 done). Then calc engine → API → UI → deploy.

Check off AC in `BACKLOG.md` as you finish each item.

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

## Do not

- Re-litigate locked ADRs unless Taylor reopens them
- Duplicate profit math in the UI
- Add auth, tRPC, Server Actions-as-API, or poe.ninja in MVP
- Create a flood of GitHub Issues for Phase 1
