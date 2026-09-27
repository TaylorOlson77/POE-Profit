# Strategies

A checked box means an automated test exists. It is not a pass/fail from the last run.

App running locally, no login. The demo seed may already be on the list as "Expedition + Temple tablets (demo)".

Rows you save stay in the database until you delete them. A test run or a deploy does not clear them. Re-seeding replaces only that demo strategy and its demo session.

This page does not list every unit test in the repo. A line is a behavior someone might otherwise recheck by hand.

## Create a strategy

- [ ] [shows the new strategy on the home list with its cost per waystone](../../../e2e/strategies.spec.ts) — Playwright. Steps: [manual](./manual/shows-the-new-strategy-on-the-home-list.md)

### Validation

- [x] rejects a missing name — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a negative waystone cost — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects too many tablet lines — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a body that is not JSON — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a bad game, a float cost, or a missing waystone cost — [`strategy contracts`](../../../src/contracts/strategies.test.ts)

### Cost

- [x] stores the line totals and the per-map cost — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] keeps a total the engine left past two places — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] per-map cost is waystone plus quantity × unit cost — [`calculateStrategyCosts`](../../../src/domain/calc/index.test.ts)
- [x] no tablets leaves the waystone cost — [`calculateStrategyCosts`](../../../src/domain/calc/index.test.ts)

### Form

- [x] drops blank tablet rows — [`buildStrategyWriteBody`](../../../src/ui/strategyForm.test.ts)
- [x] omits modifier notes on a PoE1 strategy — [`buildStrategyWriteBody`](../../../src/ui/strategyForm.test.ts)
- [x] points a validation error at the tablet row on the form — [`formDetailPath`](../../../src/ui/strategyForm.test.ts)

## Update a strategy

- [ ] [shows the updated cost per waystone on the home list](../../../e2e/strategies.spec.ts) — Playwright
- [x] replaces the lines and recalculates both totals — [`PUT /api/strategies/:id`](../../../tests/api/strategies.test.ts)

## Delete a strategy

- [ ] [removes the strategy from the home list only after delete is confirmed](../../../e2e/strategies.spec.ts) — Playwright
- [ ] [shows the conflict message when a strategy still has sessions](../../../e2e/strategies.spec.ts) — Playwright
- [x] deletes a strategy that has no sessions — [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
- [x] refuses to delete a strategy that still has sessions — [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
