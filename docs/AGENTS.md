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
- **After MVP baseline:** GitHub Issues + POE Profit board for features/fixes (ADR-009). Feature work follows [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) (catalog, ticket flow, commands). Epic and story rules are in [`PRODUCT.md`](./PRODUCT.md). That workflow is not in force during the MVP backlog.
- **Options before code** for material decisions; durable choices go in [`DECISIONS.md`](./DECISIONS.md).
- Do **not** implement FF-* items in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) unless Taylor asks.

## Stack (locked — see ADRs)

Next.js App Router + TS · Vercel · Neon Postgres · Prisma · Route Handlers (REST, contract-first) · `decimal.js` · Jest (unit + API) · Playwright (E2E) · layout: `app/` + `src/contracts`, `src/domain/calc`, `src/server` (ADR-011–016).

## Current next step

**MVP baseline is deployed** at [poe-profit.vercel.app](https://poe-profit.vercel.app/). F1 is checked off in [`BACKLOG.md`](./BACKLOG.md). There is no F2. The public site uses the Neon `production` branch and shows only the demo strategy. Actions migrates and resets the Neon `ci` branch once per run, then Playwright runs there.

Next: the remaining baseline tickets are in [`MVP_REMAINING.md`](./MVP_REMAINING.md). R1, R2, and R4 are checked off. R3 is still open. One ticket per chat. Do not start the next ticket in the same chat.

Prep prompt **1 is done.** `tests/catalog/` has strategies and sessions (create, update, delete). The five judgment calls from that chat stay off the pages.

Prep prompt **2 is done.** The coverage pages have Playwright lines for create, update, and delete of a strategy and of a session, plus the conflict message when a strategy still has sessions. E3 checked those boxes and moved the step files to `automated/`. The specs are `e2e/strategies.spec.ts` and `e2e/sessions.spec.ts`. A missing id shows the API sentence in place of the form. There is no 404 page, and that path is not a browser line.

Prep prompt **3 is done.** `.cursor/commands/ticket-test-plan.md` plans tests for one story. The rules are [`QA_WORKFLOW.md`](./QA_WORKFLOW.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §4, and [`tests/catalog/README.md`](../tests/catalog/README.md). It is not used during the MVP backlog.

Prep prompt **4 is done.** `.cursor/commands/plan-feature.md` plans a feature. The rules are [`PRODUCT.md`](./PRODUCT.md). It files issues only after Taylor accepts, and it is not used during the MVP backlog.

A finished prep prompt is the brief for that chat. The rules now live in the docs, not in the prompt.

E3 and F1 are done. Prompt **5** creates the definition-of-done command. Prompt **7** creates the dev wrap-up command. Prompts 3 and 4 are done.

Do not execute a prep prompt just because this file was read. Run one only when Taylor pastes that prompt as the task.

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

- API tests call Route Handlers in-process with the Prisma fake in `tests/api/strategyDbMock.ts`. CI still has no `DATABASE_URL`. A Neon round-trip is deferred.
- `DELETE` of a strategy that still has map sessions returns **409 `CONFLICT`**. 404 is an unknown id. 204 is a delete with no sessions. E1 should show `error.message`.
- Money on the wire goes through `decimalToWire` (`src/server/money.ts`): plain decimal strings, no `Number()`, no `roundForDisplay`.

### D2 decisions (locked unless Taylor reopens them)

- Same harness as D1: in-process Route Handlers and `tests/api/mapSessionDbMock.ts`. A Neon CI database is still deferred. These contract tests stay on the fake even if that database exists later.
- Unknown map session id is **404**. Unknown `strategyId` on create or update is **404** (`Strategy not found`). PUT checks the session first, then the strategy, and does not replace lines when the strategy is missing.
- PUT keeps the MapSession row and replaces investment and revenue lines in a transaction. It does not delete the session or the strategy. Inactive duration columns are cleared.
- Delete session is **204** or **404**. No 409. Nullable money uses `nullableDecimalToWire`.
- Calculated fields are not on the write schema, so a client cannot supply them as the source of truth. `profitDivineApprox` stays null when the divine rate is not positive.

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

- `jest.mock("@/...")` needs `moduleNameMapper` in `jest.api.config.mjs` (`^@/(.*)$` → `<rootDir>/$1`). Load the fake with `jest.requireActual`. A raw `require()` fails `@typescript-eslint/no-require-imports`.

**CI**

- Order is lint → typecheck → unit → API → build → E2E. Typecheck runs **before** `build`, so app code must not depend on Next-generated types like `LayoutProps` (`app/layout.tsx` uses plain React props for this reason).
- API tests still have **no database access**; CI only runs `prisma generate` for them. Migrations for the app are applied locally against Neon. D1 and D2 API tests use an in-process Prisma fake. A Neon round-trip for those contract tests is still deferred.
- Playwright runs on every CI job against the Neon `ci` branch. The job is a GitHub-hosted Ubuntu runner. It installs Chromium, builds the app, and Playwright starts `next start` on that same machine at `http://127.0.0.1:3000`. It does not open the Vercel URL. Before Playwright, once per job, the workflow runs `prisma migrate deploy` and `prisma/reset-to-seed.ts` with `DATABASE_RESET=ci`. That wipe is refused unless `CI=true`, so it cannot run against `.env.local`. It does not run after each test. E2E jobs queue on one concurrency group so two runs cannot wipe `ci` together. The homepage smoke runs in that same job. CI retries a failed test once (`playwright.config.ts`). Locally, each describe passes the strategies it owns into `installUiTestCleanup` (`e2e/fixtures.ts`, `e2e/dbCleanup.ts`). A strategy with only a name is deleted, sessions first. A strategy that lists `keepSessionIds` stays, and every other session on it is deleted. Hand-created strategies with other names stay. A killed run can leave rows until the next `beforeAll`, which finds them by those names.
- `format:check` is **not** a CI gate, `docs/` is in `.prettierignore`, and a few pre-existing `src/contracts` files fail Prettier. Don't reformat them as drive-by noise.
- `actions/checkout@v4` / `actions/setup-node@v4` emit a Node 20 deprecation annotation. Runs still pass; bump to `@v5` when convenient.

**Schema/contract parity**

- Prisma returns `Decimal` objects; services must serialize to decimal **strings** at the API boundary via `decimalToWire`. Never `Number()` a money value.
- The contracts reject money and counts outside the columns. A calculated total that does not fit is 400 before insert. D1 and D2 API tests parse responses with the Zod schemas. The fake still does not prove Postgres `Restrict`, or that a stored 8-decimal-place line still multiplies. Those round-trips are R3.

## Do not

- Re-litigate locked ADRs unless Taylor reopens them
- Duplicate profit math in the UI
- Add auth, tRPC, Server Actions-as-API, or poe.ninja in MVP
- Create a flood of GitHub Issues for Phase 1
- Run a prep prompt below unless Taylor pasted that prompt as the task

## Prep prompts

Paste one prompt into a new chat. They assume this file and `docs/QA_WORKFLOW.md` are the rules.

### 1 — Catalog the tests that already exist

```text
Read docs/AGENTS.md, docs/QA_WORKFLOW.md, docs/TEST_STRATEGY.md, and tests/catalog/. The create-strategy page is the density to copy. Do not copy its content into sessions.

Extend tests/catalog/ so strategies and sessions match the tests that already exist. Read the test names. Do not invent behavior.

Write or extend coverage.md for strategies and sessions. Sections are create, update, and delete, and only when those tests exist. A line is the it sentence plus a link to the file. A checked box means the automated test exists. manual/ is the only case-file folder. Automated tests stay where they are. No case numbers. No second regression file. Do not list every calculation example. A second example of the same rule does not get a line. A line exists only when someone might otherwise recheck that behavior by hand.

Do not add a manual file unless a person still has to look at the screen and the lower layers do not already lock it. The existing create-strategy manual file can stay. Do not write Playwright specs. The catalog lives in tests/catalog/. Do not edit product code.

When a line is a judgment call, list it and ask before adding it. Then show the pages and stop.
```

### 2 — Write the Playwright cases into the catalog

```text
Read docs/AGENTS.md (E1 and E2 decisions), docs/QA_WORKFLOW.md (the browser set and the manual-file rules), docs/TEST_STRATEGY.md §4.3 and §6.3, and tests/catalog/ after prompt 1.

Propose the browser journeys for the MVP. Start from the four in the workflow, and change a journey when the real UI in the E1/E2 notes disagrees. Do not add a journey whose only new fact is a validation message the API or unit tests already lock.

Stop after the list: for each journey, the sentence name, the feature section it belongs on, and whether a manual file already exists. Wait for Taylor to cut it.

After the cut, add the manual files and the coverage lines. Box unchecked. The line links to the manual file. Write the step file the way [`tests/catalog/README.md`](../tests/catalog/README.md) says. No case numbers. Do not write Playwright specs. Do not change product code.
```

### 3 — Ticket test-plan command

```text
Read docs/QA_WORKFLOW.md, docs/TEST_STRATEGY.md §4.3, and the feature coverage pages. Create .cursor/commands/ticket-test-plan.md so a later chat can run that command.

The command is for after the MVP baseline. It must: read the ticket, stop if acceptance criteria are not observable, create the feature branch, and edit the existing feature coverage page on that branch (not a new folder per ticket).

Name the branch from the story, because that issue is the one the pull request closes: `42-register-and-sign-in`. The number, a hyphen, then a few words from the story title. Lowercase. The epic does not get a branch. A story with no epic uses that single issue's number.

Propose the lines before writing any case file. Include create, update, and delete when the ticket's screens have them and the page does not already watch them. A browser line is a fact the screen shows: saved figures, a confirm step, a row leaving or staying, or a server error a person can hit on a normal journey (the conflict message when a strategy still has sessions). The API locking the status code is not a reason to skip that line. The API does not open the page.

Leave off a line whose only new fact is a field-validation message, or a not-found sentence for an id a person cannot reach on purpose. There is no 404 page. A missing strategy or session shows the API sentence in place of the form. That stays an API line.

Stop for Taylor to cut the list, including edge cases, before writing case bodies. Every accepted browser line gets a step file under `manual/` before the case is accepted. Write it the way [`tests/catalog/README.md`](../tests/catalog/README.md) says. API and unit lines do not get a step file. A Playwright line stays unchecked. The sentence is plain text. `UI [path]` links to the spec the implementation chat will write, and `Steps` links to the step file. When that chat adds the spec, it checks the box, keeps `UI [path]` pointed at the spec, and moves the step file from `manual/` to `automated/`. The file stays. It is not archived and it is not deleted. The coverage diff is the impact. A case that creates a row says the row stays until it is deleted. The database is not wiped between runs.

It does not write product code, Playwright specs, or a separate impact table. It does not assign case numbers.

Do not run the command against a real ticket while creating it. Show the command file and stop.
```

### 4 — Feature-to-tickets command

```text
Read docs/QA_WORKFLOW.md (the pipeline), docs/DECISIONS.md ADR-009, docs/MVP_SPEC.md non-goals, and docs/FUTURE_FEATURES.md.

Create .cursor/commands/plan-feature.md for after the MVP baseline. When that command is later invoked with a feature idea, it must talk before it files anything: what problem the feature is, what is out of scope, how the work splits into an epic and tickets, and acceptance criteria that are observable. It writes GitHub issues only after Taylor accepts that split. It does not write coverage lines, test cases, or product code.

Follow the same shape as the test-catalog work: options, a cut, then the artifact. Do not create GitHub issues while building this command. Show the command file and stop.
```

### 5 — Definition-of-done command

```text
Read docs/QA_WORKFLOW.md (“What the ticket records” and “Definition of done”), docs/TEST_STRATEGY.md §10 (the implemented gates, not the format gate) and §12, and tests/catalog/README.md. Read .cursor/commands/plan-feature.md and .cursor/commands/ticket-test-plan.md and match that shape: the command is the steps, and it points at those docs instead of copying them.

Create .cursor/commands/definition-of-done.md for after the MVP baseline. If the ticket flow in QA_WORKFLOW is not in force, the command stops.

When later invoked on a pull request, it checks that pull request against the definition of done in those docs. Traceability is the check: the story’s acceptance criteria, the coverage diff, and the tests in the pull request. It posts the one comment from “What the ticket records,” including the Actions link. It asks Taylor to confirm the diff is honest before it moves the board.

It does not decide whether a line was wise. That cut happened in ticket-test-plan. It does not commit, push, or edit product code. It does not edit QA_WORKFLOW, TEST_STRATEGY, PRODUCT, DECISIONS, or the catalog rules. It does not fail CI over an empty pull-request section. CI green means the implemented gates in TEST_STRATEGY §10.

Do not run it against a real pull request while creating it. Show the command file and stop.
```

### 6 — Question the bones before Playwright code

```text
Read docs/AGENTS.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, docs/TEST_STRATEGY.md, docs/QA_WORKFLOW.md, and tests/catalog/ including the Playwright cases from prompt 2.

This is a review, not a rewrite. Playwright is about to encode the current screens. Look for decisions that are brittle once those journeys exist: math duplicated or about to be asserted in the browser, journeys that repeat API rules, routes or labels the specs would freeze, and catalog lines that do not match the UI described in the E1/E2 notes.

Do not reopen a locked ADR unless a specific journey would encode a behavior the ADR forbids, or hide a bug the ADR cares about. Name the ADR if you do. Do not change code. Do not write Playwright specs.

Write the review as: what looks solid, what looks brittle and why, what you would change before the specs and what you would leave. Ask Taylor which of the “change” items to do. Stop there.
```

### 7 — Dev wrap-up command

```text
Read docs/QA_WORKFLOW.md (the pipeline), docs/TEST_STRATEGY.md §10 (the implemented gates), and docs/AGENTS.md (the PowerShell commit note, and which behavior notes a chat keeps current). Read .cursor/commands/plan-feature.md and .cursor/commands/ticket-test-plan.md and match that shape: the command is the steps, and it points at those docs instead of copying them.

Create .cursor/commands/dev-wrap-up.md. This is the step after implementation and before definition-of-done. It is for after the MVP baseline. If the ticket flow in QA_WORKFLOW is not in force, the command stops.

When later invoked on the feature branch, it commits that work. Invoking the command is Taylor asking for the commit. It updates behavior docs the change made stale, such as the handoff notes in docs/AGENTS.md and the architecture notes. It does not edit QA_WORKFLOW, TEST_STRATEGY, PRODUCT, DECISIONS, or the catalog rules to match the code. A disagreement with those is a dated amendment, and it waits for Taylor. It runs the implemented gates from TEST_STRATEGY §10 locally. If they fail, it stops. It pushes and opens the pull request with gh, then stops.

The pull request description is the pull request. The issue comment that lists tests added or updated is definition-of-done. This command does not post that comment, does not move the board, and does not write a pass/fail report. That report is FF-006.

Do not run it against the current branch while creating it. Show the command file and stop.
```

### 8 — Outside review memo

Paste this into two new chats, one Claude and one GPT. Bring both memos back before prompt 9.

```text
You are an outside reviewer of POE Profit. You did not build it. Taylor will defend the decisions. You write a memo. You do not edit files, open a branch, or file issues.

Taylor has finished MVP coding. F1 is done: the app is deployed at https://poe-profit.vercel.app/ against the Neon production branch, and GitHub Actions migrates and resets the Neon ci branch once per run. The E2E_DATABASE skip gate is removed. There is no F2. Do not look for a second deploy epic, and do not treat its absence as missing scope. The only code changes still on the table are ones Taylor accepts from this memo.

F1 is checked off in docs/BACKLOG.md and docs/F1-CHECKLIST.md. Sentences that still say the ticket flow is not in force during the MVP backlog belong to a later cleanup. Do not spend the memo on them.

Load https://poe-profit.vercel.app/ and compare what a visitor can do with MVP_SPEC §34.

Read, in this order:
- docs/AGENTS.md (product, stack, locked E1/E2/D1/D2 notes)
- docs/MVP_SPEC.md §1–§4 and §34 (what v1 is, what it refuses, when it is done)
- docs/DECISIONS.md (every accepted ADR: the decision and the why)
- docs/ARCHITECTURE.md
- docs/TEST_STRATEGY.md §3–§4, §6–§7, §10, §12
- docs/F1-CHECKLIST.md only for the branch split: local, ci, and production. The boxes are already done.
- docs/PRODUCT.md and docs/QA_WORKFLOW.md only to see the post-baseline process. Do not review that process as product code.

Then read the code those docs name: src/domain/calc, src/contracts, src/server, app/api, the strategy and session UI, prisma/schema.prisma, tests/api, e2e/, tests/catalog/, and the CI workflow.

Lenses, in this order:
1. Money. Chaos is canonical. A player can save a session and see a profit the engine did not compute, or a Divine figure that is not derived from the stored rate.
2. Domain. Strategy and MapSession stay separate. The UI recomputes profit instead of showing the API payload.
3. Honesty of the tests. A coverage line, an ADR, or a README claim is stronger than the test or the code behind it. Name the file.
4. Public no-auth deploy (ADR-007). The production URL is live. Anyone with it can create, edit, and delete rows on the production branch. That branch is separate from local and from ci. Judge input validation and abuse basics. Do not design an auth system.
5. Interview defense. Choices a hiring manager will ask Taylor to explain.

Rules:
- An accepted ADR stands unless the code contradicts it, or the decision produces a concrete failure you can point at (wrong money, lost or overwritten rows, a test that cannot fail, a public endpoint that trusts the client).
- A documented non-goal is a risk to name, not a feature to specify. Auth, poe.ninja, live preview, and creator sharing stay off the recommendation list.
- The E2E skip gate was removed in F1. If you still find it, that is a contradiction.
- Style, naming taste, and framework swaps are out of scope.
- Do not propose the next product phase. Do not propose restoring F2.

Write one markdown memo with these sections only:

## What holds
Decisions and boundaries that match the code. One line each. Cite the ADR or file.

## Contradictions
Doc, test, or comment versus code. File and behavior. Skip the known "ticket flow is not in force yet" handoff lines.

## Holes that can ship wrong
Wrong money, lost data, or a false claim that the suite locks a behavior. For each: what fails, where, and the smallest check that would expose it. No patch.

## Accepted risks
Documented non-goals or deferred gaps that are real. What breaks later if they stay. No design.

## Questions Taylor should answer without the repo open
At most ten. Each question is one decision.

Stop. Taylor compares your memo with the other model's memo.
```

### 9 — Clean the MVP-phase instructions

Run this only after both prompt 8 memos are back and Taylor has answered them.

```text
You are cleaning the MVP-phase instructions. The baseline has shipped. F1 is done, including the Vercel deploy and the Neon ci branch in Actions. F2 was removed on purpose. Do not recreate it.

This is a docs and handoff pass. Read docs/AGENTS.md, docs/QA_WORKFLOW.md, docs/PRODUCT.md, docs/AI_DEVELOPMENT.md, docs/BACKLOG.md, docs/F1-CHECKLIST.md, docs/TEST_STRATEGY.md, docs/ARCHITECTURE.md, and .cursor/commands/.

Keep docs/MVP_SPEC.md as the v1 spec. Keep the ADRs. Keep docs/FUTURE_FEATURES.md as the idea list. Do not rename domain concepts. Do not delete tests. Do not implement a feature.

Propose one cut list, then wait. Group it as:

1. Operational tense. Places that still tell a chat to stop because the MVP backlog is current, including command gates and the QA workflow status line. definition-of-done and dev-wrap-up already exist; the workflow status line is behind the repo. The pipeline should include wrap-up where the command already sits.
2. Handoff weight. Prep prompts 1–7 in docs/AGENTS.md. The rules now live in the docs. Propose removing the pasted prompts from the live handoff. Git history keeps them. Prompts 8–10 stay until Taylor says each one is finished.
3. Current next step. F1 is done. After this cleanup, new work starts with plan-feature, then ticket-test-plan, implementation, dev-wrap-up, definition-of-done. Prompt 10 still runs before the first epic is filed.
4. F1 record. F1 is already checked off. docs/F1-CHECKLIST.md still holds the branch split (local, ci, production) and the rule that anyone with the public URL can change production rows. Propose where those lasting facts live, and whether the checklist file stays as a runbook or is retired. Do not invent a follow-on deploy epic.
5. Baseline note. A short dated note: what v1 includes, https://poe-profit.vercel.app/, and the gaps Taylor is keeping on purpose (API tests on the Prisma fake, format:check is not a gate, no auth, manual prices). Fold in any review findings Taylor accepted as documentation.
6. Optional, separate, and only if Taylor says yes: one closed Foundation issue on the POE Profit board summarizing Phase 1. It is not a product epic. Do not file it in this proposal.

Leave product code alone unless a comment instructs the next chat to treat the ticket flow as not in force, or still describes the E2E skip gate as waiting on F1. List those comments. Do not fix them in the proposal. If Taylor accepted a code change from the review memos, that change is a separate chat.

After Taylor cuts the list, edit only the accepted items. Show the diff summary and stop. Do not start a roadmap.
```

### 10 — Phase map

Run this only after prompt 9 is done.

```text
You are planning the next product phases of POE Profit. The MVP baseline has shipped, including the public deploy at https://poe-profit.vercel.app/. F2 does not exist. You produce a phase map. You do not file GitHub issues, write stories, or edit the repo.

Read docs/PRODUCT.md, docs/MVP_SPEC.md (non-goals and §34), docs/FUTURE_FEATURES.md, docs/DECISIONS.md ADR-009, and the baseline note in the handoff if it is there. Read docs/QA_WORKFLOW.md only so you know plan-feature is the next command after this chat.

An epic is an outcome that closes. A theme is not an epic. "Authentication" does not close. "Sign in with an email account" does. Product areas today are strategies and sessions. A new area exists only when a visitor could recheck it without those pages.

FUTURE_FEATURES.md is input, not a commitment. An FF item can be dropped, split, or moved. A documented non-goal stays out unless you ask Taylor to reopen it, in one line, with the reason.

Write phases as a sequence Taylor could build. For each phase:
- the player outcome of the phase
- the epic titles that close inside it
- one sentence on the problem for each epic
- what must already be true before that epic starts
- what you are leaving in a later phase on purpose

Aim for a handful of phases and a handful of epics. A second outcome is a later epic. Do not add epics to fill a template. Do not write acceptance criteria. Do not design schema. Do not propose an F2.

Stop after the map. Taylor cuts phases and epics. Each accepted epic is later split by the plan-feature command in its own chat.
```

