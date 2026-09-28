# Agent handoff — POE Profit

Read this first in a new chat, then the docs listed under **Required reading**.

## Product / repo

| Thing | Value |
| --- | --- |
| Product name | **POE Profit** |
| GitHub repo | https://github.com/TaylorOlson77/POE-Profit |
| Project board | https://github.com/users/TaylorOlson77/projects/1 — the tracker for every epic and ticket from here on. Do not re-file the finished Phase 1 checklist as a Foundation epic. |
| Local workspace | `d:\POE Profit` (older copies may still be named `POE Strategy Tracker`) |

## Process (locked)

- GitHub Issues + the [POE Profit board](https://github.com/users/TaylorOlson77/projects/1) for features and fixes ([ADR-009](./DECISIONS.md)). The pipeline is [`QA_WORKFLOW.md`](./QA_WORKFLOW.md). Epic and story rules are [`PRODUCT.md`](./PRODUCT.md). The next phases are [`PHASES.md`](./PHASES.md).
- **Options before code** for material decisions; durable choices go in [`DECISIONS.md`](./DECISIONS.md).
- Do **not** implement FF-* items in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) unless Taylor asks. A phase in [`PHASES.md`](./PHASES.md) is the ask. `plan-epic` confirms that phase's epics, then files one epic's tickets.
- `main` is the production branch. Vercel deploys it. A change lands through a pull request with green CI ([`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §10) and docs that match the code.

## Commits

Subject: `type: imperative summary`

| Type | Use |
| --- | --- |
| `feat` | Player-visible behavior |
| `fix` | Incorrect behavior |
| `test` | Tests only |
| `docs` | Docs only |
| `refactor` | Behavior unchanged |
| `chore` | Tooling, dependencies, CI |

Lowercase type. No trailing period. Under 72 characters. Name the behavior (`feat: reject a money total that does not fit the column`).

A body is for the why, and only when the subject does not already say it. Leave a blank line before the body. On PowerShell the message goes in a temp file: `git commit -F <file>`.

The branch name comes from the story: `42-register-and-sign-in`. The number, a hyphen, then a few words from the story title. Lowercase. A docs change with no story uses `docs-short-name`.

`plan-epic` starts on `main`. Doc and command edits from that work go on `docs-short-name` and through the same CI gates. They do not ride on the ticket branch.

The pull request title is the story title. The body includes `Closes #N`. Do not put `Closes` on intermediate commits.

## Stack (locked — see ADRs)

Next.js App Router + TS · Vercel · Neon Postgres · Prisma · Route Handlers (REST, contract-first) · `decimal.js` · Jest (unit + API) · Playwright (E2E) · layout: `app/` + `src/contracts`, `src/domain/calc`, `src/server` (ADR-011–016).

## Baseline (2026-09-28)

v1 is live at [poe-profit.vercel.app](https://poe-profit.vercel.app/). There is no F2. Phase 1 is the archived checklist in [`archive/BACKLOG.md`](./archive/BACKLOG.md).

A player can create a PoE2 strategy, log a map session with investment and revenue, enter a manual price (`ACTUAL_PAID`), save, and see profit, ROI, and rates from the last API payload. They can reopen the session, edit it, and delete it. The public site uses the Neon `production` branch and shows the demo strategy. Actions migrates and resets the Neon `ci` branch; Playwright runs there, not against the Vercel URL. Branch setup is in the [README](../README.md).

Anyone with the public URL can create, edit, and delete production rows. That does not reach `local` or `ci`. `npm run db:reset:production` restores the demo seed.

Gaps kept on purpose:

- Contract API tests stay on the Prisma fake (`npm run test:api`). Persistence round-trips are `npm run test:api:db`.
- `format:check` is not a CI gate.
- No auth. Prices are manual. The recorded time is save time.
- Last-write-wins on PUT.
- No rate limits, pagination, snapshot restore, or automatic production migrations.
- The Prisma fake's `$transaction` does not roll back.

New work starts with `plan-epic` on the current phase in [`PHASES.md`](./PHASES.md), then `ticket-test-plan`, implementation, `dev-wrap-up`, and `definition-of-done`. One ticket per chat. `brainstorm` is off that pipeline. The words are in [`PRODUCT.md`](./PRODUCT.md).

### E2 decisions (locked unless Taylor reopens them)

- History is `/sessions`. Create is `/sessions/new` (optional `?strategyId=`). Edit is `/sessions/[id]`, and that page is also the detail view. Client components `fetch` `/api/map-sessions` and parse with the Zod contracts.
- Home links to Sessions. Each strategy row links to Log session with that strategy preselected. Changing the strategy copies its `mapUnitCostChaos` into the cost field.
- Calculated totals, line totals, and the duration method label come from the last API payload. They do not update while typing. A dirty form says the figures are from the last save. After create, the URL becomes `/sessions/[id]` so those figures are on screen.
- Map/waystone cost is `mapsCompleted` × `mapUnitCostChaos` from the API (`mapInvestmentChaos`). It is not an investment line. No waystone tier and no separate session date; history Date is `createdAt`.
- Revenue categories are a select of the MVP seed list. A stored category outside that list stays as an extra option. Category subtotals are not shown.
- `priceSource` is `MANUAL` and `valuationType` is `ACTUAL_PAID`. `priceRecordedAt` is stamped now for a new line or when the unit value changes; otherwise the stored timestamp is kept.
- The write body includes only the active duration method. Other method inputs stay in component state until save. New sessions default to Extrapolated. Observed times use `datetime-local` and are converted to ISO.
- Form labels follow the selected strategy's game. The history column header stays Waystones. Nullable rates render as `N/A`. Effective duration is `formatDuration` (`1h 20m`) plus minutes.
- Delete asks in the history row. **204** removes it. **404** shows `error.message`. No 409.
- Unit tests cover `buildMapSessionWriteBody`, `formDetailPath`, datetime conversion, and the display formatters. The browser journey is E3.

### E1 decisions (locked unless Taylor reopens them)

- The list is `/`. Create is `/strategies/new`. Edit is `/strategies/[id]`. Client components `fetch` the strategy routes and parse responses with the Zod contracts. They do not import Prisma or services.
- `lineTotalChaos` and `estimatedCostPerMapChaos` on screen come from the last API payload. A live preview while typing is **FF-005**, and it must call `calculateStrategyCosts`.
- Display money with `formatChaos` (`roundForDisplay` + `c`). No `Number()`.
- Delete asks in the row. **204** removes it. **409** and **404** show `error.message`.
- New strategies default to `POE2`. Labels follow `game`: Waystone / Tablets for PoE2, Map / Scarabs for PoE1. Modifier notes are sent only for PoE2.
- Unit tests cover `buildStrategyWriteBody` and `formDetailPath` in `src/ui/strategyForm.test.ts`. Those transforms never reach the API (blank rows dropped, PoE1 notes omitted, Zod line indexes mapped back to the form row). `detailsFromZod` only joins Zod paths; the validation rules stay in the contract tests. The create/edit/delete browser journey is E3.

### D1 decisions (locked unless Taylor reopens them)

- Contract API tests call Route Handlers in-process with the Prisma fake in `tests/api/strategyDbMock.ts`. They run in the quality job, which is not given a database URL.
- Persistence round-trips are `npm run test:api:db` (`tests/api/db/persistence.test.ts`): the same handlers and the real Prisma client. Locally that is the Neon `local` branch. In CI the e2e job runs it against the Neon `ci` branch.
- `DELETE` of a strategy that still has map sessions returns **409 `CONFLICT`**. 404 is an unknown id. 204 is a delete with no sessions. E1 should show `error.message`.
- Money on the wire goes through `decimalToWire` (`src/server/money.ts`): plain decimal strings, no `Number()`, no `roundForDisplay`.

### D2 decisions (locked unless Taylor reopens them)

- Contract tests use the same style of harness as D1: in-process Route Handlers and `tests/api/mapSessionDbMock.ts`. They stay on the fake. Session persistence round-trips are `npm run test:api:db`, not this file.
- Unknown map session id is **404**. Unknown `strategyId` on create or update is **404** (`Strategy not found`). PUT checks the session first, then the strategy, and does not replace lines when the strategy is missing.
- PUT keeps the MapSession row and replaces investment and revenue lines in a transaction. It does not delete the session or the strategy. Inactive duration columns are cleared.
- Delete session is **204** or **404**. No 409. Nullable money uses `nullableDecimalToWire`.
- Calculated fields are not on the write schema, so a client cannot supply them as the source of truth. `profitDivineApprox` stays null when the divine rate is not positive.

## Required reading (build chat)

1. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system map + folder layout  
2. [`DECISIONS.md`](./DECISIONS.md) — ADRs (especially 006–016)  
3. [`MVP_SPEC.md`](./MVP_SPEC.md) — product rules + non-goals  
4. [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) — what to test  
5. [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) — how a ticket moves  
6. [`PRODUCT.md`](./PRODUCT.md) — epic and story rules  
7. [`PHASES.md`](./PHASES.md) — the next phases, and the next epic  
8. [`AI_DEVELOPMENT.md`](./AI_DEVELOPMENT.md) — working contract with Taylor  

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

**Next.js dev server**

- A second `npm run dev` exits with code 1 when one is already running. The message names the existing PID and `http://localhost:3000`. Use that server. Local Playwright sets `reuseExistingServer`, so `npm run test:e2e` attaches to it.

**Playwright browsers**

- `npm install` does not download Chromium. The first local `npm run test:e2e` fails with `Executable doesn't exist` until `npx playwright install chromium`. CI already runs `npx playwright install --with-deps chromium` before E2E.

**Observed session times**

- `<input type="datetime-local">` has no timezone. `new Date(value)` reads it as local time; `toISOString()` is what `z.string().datetime()` accepts. Round-trip tests go through `Date` in the runner's timezone. Do not hardcode an offset.

**Zod 4**

- Cannot `.merge()` a `ZodDiscriminatedUnion` into an object. Chain `.and()` instead (see `MapSessionSchema`).

**Dark-mode native `<select>` (Windows)**

- The page text is light (`--foreground`). Windows paints the dropdown on a white panel, and `<option>` inherits that light text, so the unselected row disappears. `app/globals.css` sets `select { color-scheme: light }` and `option { background: #fff; color: #171717 }`. The closed control still uses the page text color.

**decimal.js**

- `Decimal.toString()` uses scientific notation for small values (`"0.00000001"` becomes `"1e-8"`). `DecimalStringSchema` rejects that. Serialize with `decimalToWire` in `src/server/money.ts` (`toFixed`, then strip storage-scale zeros). Never `Number()` a money value.
- Money strings allow at most 12 integer digits and 8 fractional digits, matching `NUMERIC(20, 8)`. `mapsCompleted`, `sampleMapsCompleted`, and enhancement `sortOrder` stop at `2147483647`. `fitsMoneyColumn` rejects a calculated total that would not fit the column. The write routes return 400 before insert.

**Jest API tests**

- `jest.mock("@/...")` needs `moduleNameMapper` in `jest.api.config.mjs` (`^@/(.*)$` → `<rootDir>/$1`). Load the fake with `jest.requireActual`. A raw `require()` fails `@typescript-eslint/no-require-imports`. That config ignores `tests/api/db/`. `npm run test:api:db` uses `jest.api-db.config.mjs` and does not load the fakes.

**CI**

- Order is lint → typecheck → unit → API → build → E2E. Typecheck runs **before** `build`, so app code must not depend on Next-generated types like `LayoutProps` (`app/layout.tsx` uses plain React props for this reason).
- `npm run test:api` is not given a database URL. CI only runs `prisma generate` for that step. D1 and D2 stay on the Prisma fakes.
- The e2e job runs `npm run test:api:db` after the first migrate-and-reset, then `reset-to-seed` again, then the production build and Playwright. The workflow injects `CI_DATABASE_URL` / `CI_DATABASE_URL_UNPOOLED` as `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. The script does not read `CI_DATABASE_URL`. Locally `npm run test:api:db` loads `.env.local` (the Neon `local` branch). Each test creates an `api-db-` strategy and deletes it in `finally`. It does not call `reset-to-seed` and it does not touch the demo seed.
- Playwright runs on every CI job against the Neon `ci` branch. The job is a GitHub-hosted Ubuntu runner. It installs Chromium, builds the app, and Playwright starts `next start` on that same machine at `http://127.0.0.1:3000`. It does not open the Vercel URL. The workflow migrates and resets, runs `npm run test:api:db`, resets to the seed again, then builds and starts Playwright. Both resets use `DATABASE_RESET=ci` and are refused unless `CI=true`, so they cannot run against `.env.local`. They do not run after each test. A failed persistence step skips the second reset and Playwright; the next job's first reset clears leftover rows. E2E jobs queue on one concurrency group so two runs cannot wipe `ci` together. The homepage smoke runs in that same job. CI retries a failed test once (`playwright.config.ts`). Locally, each describe passes the strategies it owns into `installUiTestCleanup` (`e2e/fixtures.ts`, `e2e/dbCleanup.ts`). A strategy with only a name is deleted, sessions first. A strategy that lists `keepSessionIds` stays, and every other session on it is deleted. Hand-created strategies with other names stay. A killed run can leave rows until the next `beforeAll`, which finds them by those names.
- `format:check` is **not** a CI gate, `docs/` is in `.prettierignore`, and a few pre-existing `src/contracts` files fail Prettier. Don't reformat them as drive-by noise.
- `actions/checkout@v4` / `actions/setup-node@v4` emit a Node 20 deprecation annotation. Runs still pass; bump to `@v5` when convenient.

**Schema/contract parity**

- Prisma returns `Decimal` objects; services must serialize to decimal **strings** at the API boundary via `decimalToWire`. Never `Number()` a money value.
- The contracts reject money and counts outside the columns. A calculated total that does not fit is 400 before insert. D1 and D2 API tests parse responses with the Zod schemas. `tests/api/db/persistence.test.ts` locks a stored 8-decimal-place line, the money and map-count ceilings, `timestamptz`, line replacement, and `onDelete: Restrict`. The fake's `$transaction` still does not roll back. A session update deletes lines and then writes the new ones, and there is no natural failure between those steps, so rollback is not locked.

## Do not

- Re-litigate locked ADRs unless Taylor reopens them
- Duplicate profit math in the UI
- Add auth before the public-board phase in [`PHASES.md`](./PHASES.md). Taylor reopened it for that phase. App-layer auth in the same Postgres, not Neon Auth (ADR-011).
- Add tRPC, Server Actions-as-API, or poe.ninja unless Taylor reopens that non-goal
- Seed a Foundation epic, or cut GitHub Issues for the finished Phase 1 checklist
- Commit or push feature work to `main`
