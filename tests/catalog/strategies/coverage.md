# Strategies

A checked box means an automated test exists. It is not a pass/fail from the last run.

App running locally, no login. The demo seed may already be on the list as "Expedition + Temple tablets (demo)".

Rows you save stay in the database until you delete them. A test run or a deploy does not clear them. Re-seeding replaces only that demo strategy and its demo session.

The create, update, and delete lines for `POC Expedition Tablet Farming` are one ordered pass on that row. The spec group is serial. A retry starts by removing a leftover row of that name. The same removal runs again when the pass finishes, including after a failure, so that row does not stay in the database. The conflict line is not part of that pass. It uses the demo strategy, and confirming delete leaves that row in place.

This page does not list every unit test in the repo. A line is a behavior someone might otherwise recheck by hand.

## Create a strategy

- [x] shows the new strategy on the home list with its cost per waystone — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-new-strategy-on-the-home-list.md)

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

- [x] shows the updated cost per waystone on the home list — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-updated-cost-per-waystone-on-the-home-list.md)
- [x] replaces the lines and recalculates both totals — [`PUT /api/strategies/:id`](../../../tests/api/strategies.test.ts)

## Delete a strategy

- [x] removes the strategy from the home list only after delete is confirmed — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/removes-the-strategy-from-the-home-list-only-after-delete-is-confirmed.md)
- [x] shows the conflict message when a strategy still has sessions — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-conflict-message-when-a-strategy-still-has-sessions.md)
- [x] deletes a strategy that has no sessions — [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
- [x] refuses to delete a strategy that still has sessions — [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
