# POE Profit

Farming strategy profitability tracker for Path of Exile (PoE2-first MVP).

Live demo: [poe-profit.vercel.app](https://poe-profit.vercel.app/). It shows the demo strategy only. There is no login.

## Requirements

- Node.js 22 (CI and Vercel use **22**)
- npm

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                                 | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `npm run dev`                          | Next.js dev server                              |
| `npm run build`                        | Generate the Prisma client and build Next.js    |
| `npm run build:vercel`                 | Vercel build; migrates when `VERCEL_ENV=production` |
| `npm run start`                        | Serve production build                          |
| `npm run lint`                         | ESLint                                          |
| `npm run typecheck`                    | TypeScript (`tsc --noEmit`)                     |
| `npm run format`                       | Prettier write                                  |
| `npm run format:check`                 | Prettier check                                  |
| `npm run test`                         | Jest unit tests (`src/**/*.test.ts`)            |
| `npm run test:api`                     | Jest API tests (`tests/api/`)                   |
| `npm run test:api:db`                  | Jest persistence round-trips on the Neon `local` branch |
| `npm run test:e2e`                     | Playwright E2E (`e2e/`)                         |
| `npm run db:generate`                  | Generate Prisma Client                          |
| `npm run db:migrate`                   | Create + apply a migration (dev)                |
| `npm run db:migrate:deploy`            | Apply existing migrations (local)               |
| `npm run db:migrate:deploy:production` | Apply migrations to the public Neon branch      |
| `npm run db:migrate:status`            | Check migration status against Neon             |
| `npm run db:seed`                      | Replace the demo strategy + session on local    |
| `npm run db:reset:production`          | Wipe the public branch and insert the demo seed |
| `npm run db:studio`                    | Open Prisma Studio                              |

## Database (Neon + Prisma)

Three Neon branches. Each has its own pooled `DATABASE_URL` (hostname contains `-pooler`) and direct `DATABASE_URL_UNPOOLED` (same string with `-pooler` removed from the host).

| Branch       | Who uses it                                                         | Where the URLs live                                                              |
| ------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `local`      | `npm run dev` and the `db:*` scripts without a `:production` suffix | `.env.local`                                                                     |
| `production` | The public Vercel app                                               | Vercel Production, and `.env.neon-production` for the one-time migrate and reset |
| `ci`         | GitHub Actions                                                      | Secrets `CI_DATABASE_URL` and `CI_DATABASE_URL_UNPOOLED`                         |

1. Copy the two URL lines from [`.env.example`](./.env.example) into `.env.local` and fill in the `local` branch. Leave `DATABASE_RESET` out of that file.
2. `npm run db:generate`
3. `npm run db:migrate:status` — should report all migrations applied.
4. `npm run db:seed` — demo strategy and session. Re-running replaces only those rows.

`.env.neon-production` holds the public branch URLs and `DATABASE_RESET=production`. `npm run db:migrate:deploy:production` applies migrations there from this machine. A production Vercel build does the same apply before it compiles. `npm run db:reset:production` deletes every strategy and session on that branch, then inserts the demo seed. Those scripts do not read `.env.local`.

Schema lives in [`prisma/schema.prisma`](./prisma/schema.prisma); committed SQL in
`prisma/migrations/`. Money and quantities are `Decimal(20, 8)` (ADR-015) and
calculated fields are persisted compute-on-write results (ADR-018). The seed's
calculated columns come from the calc engine ([`prisma/seed.ts`](./prisma/seed.ts)).

Never commit `.env.local`, `.env.neon-production`, or `.env.neon-ci`. Anyone with the public URL can create, edit, and delete rows on the production branch. That does not reach `local` or `ci`. Keep real league sessions on `local`. `npm run db:reset:production` restores the demo seed.

## Deploy (Vercel)

Production environment only: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from the Neon `production` branch. Node.js 22. Do not set `DATABASE_RESET` on Vercel, and do not give Preview those URLs. [`vercel.json`](./vercel.json) sets the build command to `npm run build:vercel`. That script runs `prisma migrate deploy` when `VERCEL_ENV` is `production`, then `prisma generate` and `next build`. Preview builds and `npm run build` generate the client and build, and they do not migrate. `npm run db:migrate:deploy:production` remains the way to apply a migration from this machine when a deploy is not running.

The live app is [poe-profit.vercel.app](https://poe-profit.vercel.app/). CI does not test that URL. Playwright on Actions starts `next start` on the runner and talks to the Neon `ci` branch.

## Testing layers (ADR-014 / ADR-019)

| Layer | Tool       | Location                     | Command            |
| ----- | ---------- | ---------------------------- | ------------------ |
| Unit  | Jest       | colocated `src/**/*.test.ts` | `npm test`         |
| API   | Jest       | `tests/api/`                 | `npm run test:api` |
| API persistence | Jest | `tests/api/db/`            | `npm run test:api:db` |
| E2E   | Playwright | `e2e/`                       | `npm run test:e2e` |

Jest does **not** run Playwright specs, and Playwright does **not** run unit/API math cases.

**E2E server:** locally Playwright starts `next dev` (or reuses one already running) against the Neon database in `.env.local`. The demo seed has to be applied (`npm run db:seed`). Restarting the dev server does not reset that database. When the journey groups start, and again when they finish (including after a failure), each group deletes the strategies it owns. The create/update/delete strategy is removed. The seed strategy stays, and any session on it other than the seeded demo session is removed. Strategies created by hand, under other names, stay. In CI the workflow builds on a GitHub-hosted runner, then Playwright starts `next start` on that same machine against the Neon `ci` branch. It uses real Chromium. It does not open the Vercel site. Once per job, before Playwright, that branch is migrated and reset to the seed. It is not reset after each test. A failed test is retried once.

## CI

[![CI](https://github.com/TaylorOlson77/POE-Profit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/TaylorOlson77/POE-Profit/actions/workflows/ci.yml)

GitHub Actions (`.github/workflows/ci.yml`) on pull requests and on `main`:

1. Lint
2. Typecheck
3. Unit tests
4. API tests
5. Production build
6. Playwright E2E (Chromium), after migrating and resetting the Neon `ci` branch

`main` is the production branch. Vercel deploys it. Feature work merges through a pull request. CI on that pull request has to be green, and the docs in the pull request have to match the code.

E2E waits if another run is already using that branch. On E2E failure, the workflow uploads `playwright-report/` and `test-results/` artifacts.

## Project docs

Start with [`docs/AGENTS.md`](docs/AGENTS.md), then:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md)
- [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md)
- [`docs/QA_WORKFLOW.md`](docs/QA_WORKFLOW.md)
- [`docs/PRODUCT.md`](docs/PRODUCT.md)

Phase 1 is archived at [`docs/archive/BACKLOG.md`](docs/archive/BACKLOG.md).

## Layout (MVP)

```text
app/                 # UI + Route Handlers
src/contracts/       # API contracts (Zod)
src/domain/calc/     # Pure calculation engine
src/server/db/       # Prisma client singleton
docs/                # Specs, ADRs, handoff
prisma/              # schema + migrations
e2e/                 # Playwright
tests/api/           # Jest API tests
```
