# MVP remaining

| Field | Value |
| --- | --- |
| Status | Last baseline work. Still markdown. One chat per ticket. After R1–R4 are checked off, new work uses GitHub Issues. |
| Based on | [`GPT_REVIEW.md`](./GPT_REVIEW.md), [`CLAUDE_REVIEW.md`](./CLAUDE_REVIEW.md), [`BACKLOG.md`](./BACKLOG.md) |
| Board | Do not file these four as GitHub Issues. Check them off here. |
| Handoff | Prompt 9 in [`AGENTS.md`](./AGENTS.md) reads this file and does not implement the tickets. Point the handoff at this file. R4 may ride along with that chat only while it is still the handoff pass. R1–R3 are code and stay their own chats. |

The live money path holds. Chaos is canonical, `src/domain/calc` is the only profit math, the UI renders the last payload, and Divine profit uses the session’s stored rate. Do not reopen that.

## How we track work

Same shape as [`BACKLOG.md`](./BACKLOG.md). One ticket per chat. Check the boxes in this file when that chat is done. Do not start the next ticket in the same chat.

Rough order: R1 and R2 can run in parallel. R3 does not wait on them. R4 does not wait on R3. If R3 and R4 both land, R3 owns the database-suite paragraphs in the test strategy and the handoff notes. R4 owns the five contradictions listed on that ticket. Do not let R4 rewrite R3’s sentences.

## Out of scope

Leave these alone. A later chat does not pick them up from this file.

- Last-write-wins on PUT. Two tabs can overwrite each other. An `updatedAt` check is a new API and UI behavior.
- Auth, rate limits, pagination, snapshot restore drills, automatic production migrations.
- Rewriting Playwright page objects onto literal strings. The performance block in `e2e/sessions.spec.ts` already uses literal Waystone strings.
- Making `format:check` a CI gate.
- A formula-version column on stored rows (ADR-018).
- Teaching the Prisma fake to roll back. That proves the fake.
- Rewriting `tests/api/strategies.test.ts` and `tests/api/mapSessions.test.ts` onto Postgres. Those contract tests stay on the fakes. D2 stands for that suite.

---

## R1. Bound money and counts to the columns

**Labels:** `api`, `domain`  
**Depends on:** nothing

`src/contracts/decimal.ts` accepts any length on either side of the point. Money columns are `Decimal(20, 8)`: at most 12 integer digits and 8 fractional digits. `mapsCompleted`, `sampleMapsCompleted`, and enhancement `sortOrder` are unbounded ints; Postgres `int4` max is 2,147,483,647. Overflow becomes 500 from `src/server/apiError.ts`. More than 8 fractional places are rounded by Postgres after the engine multiplies the unrounded inputs, so stored quantity × stored unit can disagree with stored `lineTotalChaos`.

A column-shaped cap is not enough. `999999999999` × `2` each fit the column and the product does not. Reject that as 400 before insert.

**AC:**

- [x] Non-negative and signed decimal strings allow at most 12 integer digits and 8 fractional digits
- [x] `mapsCompleted`, `sampleMapsCompleted`, and `sortOrder` reject values outside the Postgres int range
- [x] A calculated total that would not fit `NUMERIC(20, 8)` is a validation error, not `INTERNAL_ERROR`
- [x] Contract tests reject `2147483648`, `"1.123456789"`, and `"9999999999999"` with no database
- [x] Catalog lines on [`tests/catalog/sessions/coverage.md`](../tests/catalog/sessions/coverage.md) and [`tests/catalog/strategies/coverage.md`](../tests/catalog/strategies/coverage.md), Validation section, API/contract shape (no step file). One line per rule, not one line per example

## R2. Cap free text

**Labels:** `api`  
**Depends on:** nothing. Can run beside R1.

ADR-007 scoped MVP security to input validation and abuse basics. Line counts are capped. `name`, `description`, `mapNotes`, `notes`, `category`, and `modifierNotes` are not. Caps for this ticket: names and categories 120 characters, notes and descriptions 2,000. No pagination. No rate limit.

**AC:**

- [ ] Those fields reject a string past the cap with 400
- [ ] A contract test rejects one over-long name and one over-long note
- [ ] One catalog line per area, Validation section, no step file

## R3. Postgres API suite, local and CI

**Labels:** `api`, `test`, `ci`  
**Depends on:** nothing required. The overflow-to-400 behavior stays in R1. This ticket does not re-test it on the fake.

Keep the fakes. Add a second suite: in-process Route Handlers and the real Prisma client. It answers only whether Postgres stores what the engine calculated.

**Local debug:** `npm run test:api:db`, wrapped in `dotenv -e .env.local --` like the other `db:*` scripts. That hits the local Neon branch, the same one `npm run dev` and local Playwright use. It is not part of `npm run test:api`, so the quality job still has no database credentials. CI’s e2e job runs that same script with `CI_DATABASE_URL` / `CI_DATABASE_URL_UNPOOLED` injected, after the first migrate-and-reset, then `reset-to-seed` again, then Playwright.

**What the suite locks:**

- Create a session whose quantity and unit value use 8 decimal places, GET it back, and assert quantity × unit = `lineTotalChaos` on the stored strings
- Create a session with quantity `1` and unit value `999999999999.99999999`, GET it back, and assert quantity, unit value, and `lineTotalChaos` are that same string
- Create a session with `mapsCompleted: 2147483647`, GET it back, and assert that count
- Create, PUT replacement lines, GET, delete. Session id stays; old lines are gone
- Delete a strategy that still has a session: 409, and the row is still there
- POST a distinctive `priceRecordedAt` and GET that same instant back

Also assert `priceRecordedAt` equality in the existing mock test (`tests/api/mapSessions.test.ts` checks `priceSource` and `valuationType` and never the timestamp). The mock locks the service. The Postgres suite locks `timestamptz`.

Do not add a fault-injection hook for transaction rollback. Say that limit in [`TEST_STRATEGY.md`](./TEST_STRATEGY.md): Postgres rolls back on throw, the fake’s `$transaction` does not model that, and there is no natural failure after the line deletes.

Delete `tests/api/harness.test.ts` (`expect(true).toBe(true)` inside CI gate 4).

Point TEST_STRATEGY §4.2, §10, and §13, and the D1/D2 notes in [`AGENTS.md`](./AGENTS.md), at this split. Persistence round-trips belong to `test:api:db`. The contract suite stays on the fake. Stop saying CI has no database at all, and stop saying a Neon round-trip is still deferred.

### Remnants and the browser tests

A failing API step does not produce false Playwright failures in CI. This suite is a step before Playwright in the existing e2e job. A failed step skips the later steps, so the browser suite does not run on a broken API run.

A green API run can still poison the browser run, and a local run can poison a later `npm run test:e2e` on the same branch. Playwright does not wipe the database. It resets once at the start of the CI job, then each spec cleans only the names it owns (`e2e/dbCleanup.ts`):

- Extra strategies with any other name stay. Home and history assertions look up an exact heading (`POC Expedition Tablet Farming`, `Expedition + Temple tablets (demo)`). They do not count the list. A leftover `api-db-` row does not fail them.
- Extra sessions on the demo strategy are deleted in `beforeAll`, except `seed_map_session_poe2_expedition`.
- If that demo strategy or that seed session is missing or renamed, `beforeAll` throws `Run npm run db:seed` and the UI failure is a lie. Updating the seed session’s stored figures is the same class of bug even where today’s specs do not read those figures.

Rules for this suite:

- Each test creates its own strategy, named with an `api-db-` prefix. `try/finally` deletes the session, then the strategy, including when the assertion fails.
- Never read, update, or delete the demo strategy, the seed session id, or the name `POC Expedition Tablet Farming`.
- Do not call `reset-to-seed` from the suite. Locally that would wipe the branch the app is using. In CI, a reset from inside the suite races the browser job’s own reset.
- CI runs `reset-to-seed` a second time after this suite and before Playwright. Cleanup in the test protects the local branch. The second reset protects the browser run when a `finally` does not run (timeout, killed process).
- Local and CI are different Neon branches. The script does not default to `CI_DATABASE_URL`.

**AC:**

- [ ] `npm run test:api:db` runs against `.env.local` with no extra flags
- [ ] The same script runs in the e2e job against the `ci` branch, then `reset-to-seed` runs again before Playwright
- [ ] Tests follow the remnant rules above
- [ ] Mock test asserts the posted `priceRecordedAt`
- [ ] Harness smoke test is gone
- [ ] Catalog lines, checked, linking the new file. No step files. Sessions: stored 8-decimal-place line still multiplies; a money amount at the column limit round-trips; a map count at the integer limit round-trips; price time round-trips; replaced session keeps its id. Strategies: a strategy with a session is still there after delete. Wording can change; the rule being locked cannot
- [ ] Shared-facts blurb on both coverage pages: this suite creates `api-db-` rows and deletes them; it does not use the demo seed; a local run uses the local branch

## R4. Doc amendments

**Labels:** `docs`  
**Depends on:** nothing. Does not wait for R3. Do not contradict R3’s test-strategy sentences if both land. R3 owns the database-suite paragraphs. This ticket owns the contradictions below.

- ROI in TEST_STRATEGY §6.1 and the narrative block in [`MVP_SPEC.md`](./MVP_SPEC.md) says about `442.55%`. The engine test locks display `442.66%`. Update both figures.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) stack table still says `decimal.js` (or light variant). Full `decimal.js` is the decision. The same page lists `src/server/validation/`, which does not exist, and omits `src/ui/`.
- ADR-004 and MVP §13 ask for Market Value, Actual Paid, and Actual Sale. The enum is only `ACTUAL_PAID`, and E2 locks the UI to that. Amend the ADR and spec: MVP persists `ACTUAL_PAID` only. Do not add enum values.
- ADR-004 / MVP §12 say a line records when the price was captured. E2 stamps save time, or keeps the old stamp when the unit value did not change. Amend the spec: historical price means the value; the recorded time is save time. No capture-time picker.
- ADR-020 says enhancement lines scale by N when prefilling. E2 copies only `mapUnitCostChaos`. Note that tablet prefill is later. Do not change the form.

**AC:**

- [ ] Those five amendments are in the docs, dated, and do not reopen the ADRs beyond the sentence that now matches the code
- [ ] No product code
