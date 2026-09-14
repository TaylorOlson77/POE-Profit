# POE Profit

Farming strategy profitability tracker for Path of Exile (PoE2-first MVP).

## Requirements

- Node.js 20+ (20.19+ recommended)
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

`.env.example` documents required vars. Never commit `.env.local`.

## Testing layers (ADR-014 / ADR-019)

| Layer | Tool | Location | Command |
| --- | --- | --- | --- |
| Unit | Jest | colocated `src/**/*.test.ts` | `npm test` |
| API | Jest | `tests/api/` | `npm run test:api` |
| E2E | Playwright | `e2e/` | `npm run test:e2e` |

Jest does **not** run Playwright specs, and Playwright does **not** run unit/API math cases.

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
```
