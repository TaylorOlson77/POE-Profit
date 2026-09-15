# POE Profit

Farming strategy profitability tracker for Path of Exile (PoE2-first MVP).

## Requirements

- Node.js 20+ (CI uses **Node 22** LTS)
- npm

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run test` | Jest unit tests (`src/**/*.test.ts`) |
| `npm run test:api` | Jest API tests (`tests/api/`) |
| `npm run test:e2e` | Playwright E2E (`e2e/`) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate:status` | Check migration status against Neon |
| `npm run db:studio` | Open Prisma Studio |

## Database (Neon + Prisma)

1. Link Neon (already done if you have `.env.local` with `DATABASE_URL`).
2. `npm run db:generate`
3. `npm run db:migrate:status` — should connect; no migrations yet until B3.

`.env.example` documents required vars. Never commit `.env.local`. CI smoke tests do **not** need Neon secrets yet.

## Testing layers (ADR-014 / ADR-019)

| Layer | Tool | Location | Command |
| --- | --- | --- | --- |
| Unit | Jest | colocated `src/**/*.test.ts` | `npm test` |
| API | Jest | `tests/api/` | `npm run test:api` |
| E2E | Playwright | `e2e/` | `npm run test:e2e` |

Jest does **not** run Playwright specs, and Playwright does **not** run unit/API math cases.

**E2E server:** locally Playwright starts `next dev` (or reuses one already running). In CI the workflow runs `npm run build`, then Playwright starts `next start` (prod-like).

## CI

GitHub Actions (`.github/workflows/ci.yml`) on PRs and `main`:

1. Lint  
2. Typecheck  
3. Unit tests  
4. API tests  
5. Production build  
6. Playwright E2E (Chromium)  

On E2E failure, the workflow uploads `playwright-report/` and `test-results/` artifacts.

## Project docs

Start with [`docs/AGENTS.md`](docs/AGENTS.md), then:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md)
- [`docs/BACKLOG.md`](docs/BACKLOG.md)

## Layout (MVP)

```text
app/                 # UI + Route Handlers
src/contracts/       # API contracts (Zod)
src/domain/calc/     # Pure calculation engine
src/server/db/       # Prisma client singleton
docs/                # Specs, ADRs, backlog
prisma/              # schema + migrations
e2e/                 # Playwright
tests/api/           # Jest API tests
```
