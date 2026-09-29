# Strategies

The demo seed may already be on the list as "Expedition + Temple tablets (demo)".

The create, update, and delete lines for `POC Expedition Tablet Farming` are one ordered pass. The spec group is serial. A retry removes a leftover row of that name, and the same removal runs when the pass finishes. The conflict line uses the demo strategy and leaves it in place.

## Create a strategy

- [x] shows the new strategy on the home list with its cost per waystone — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-new-strategy-on-the-home-list.md)

### Validation

- [x] rejects a missing name — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a negative waystone cost — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects too many tablet lines — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a body that is not JSON — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a bad game, a float cost, or a missing waystone cost — unit [`strategy contracts`](../../../src/contracts/strategies.test.ts)
- [x] rejects a money amount with more than 12 integer digits or 8 fractional digits — unit [`decimal contracts`](../../../src/contracts/decimal.test.ts)
- [x] rejects a sort order above the database integer limit — unit [`strategy contracts`](../../../src/contracts/strategies.test.ts)
- [x] rejects a calculated cost that does not fit the money column — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] rejects a name or note past its length cap — unit [`text contracts`](../../../src/contracts/text.test.ts)
- [x] rejects a use count that is not a whole number of at least 1 — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)

### Cost

- [x] stores the line totals and the per-map cost — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] keeps a total the engine left past two places — API [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
- [x] per-map cost is waystone plus quantity × unit cost divided by uses — unit [`calculateStrategyCosts`](../../../src/domain/calc/index.test.ts)
- [x] no tablets leaves the waystone cost — unit [`calculateStrategyCosts`](../../../src/domain/calc/index.test.ts)

### Form

- [x] drops a tablet row that has only the default uses — unit [`buildStrategyWriteBody`](../../../src/ui/strategyForm.test.ts)
- [x] omits modifier notes on a PoE1 strategy — unit [`buildStrategyWriteBody`](../../../src/ui/strategyForm.test.ts)
- [x] a PoE1 strategy does not show uses — unit [`strategyLabels`](../../../src/ui/strategyLabels.test.ts)
- [x] saves a PoE1 line at 1 use — unit [`buildStrategyWriteBody`](../../../src/ui/strategyForm.test.ts)
- [x] points a validation error at the tablet row on the form — unit [`formDetailPath`](../../../src/ui/strategyForm.test.ts)
- [x] clears the tablet rows only after the game change is confirmed — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/clears-the-tablet-rows-only-after-the-game-change-is-confirmed.md)
- [x] changes game without asking when no row has a name, a quantity, or a unit cost — unit [`strategy form`](../../../src/ui/strategyForm.test.ts)

## Update a strategy

- [x] shows the updated cost per waystone on the home list — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-updated-cost-per-waystone-on-the-home-list.md)
- [x] replaces the lines and recalculates both totals — API [`PUT /api/strategies/:id`](../../../tests/api/strategies.test.ts)

## Delete a strategy

- [x] removes the strategy from the home list only after delete is confirmed — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/removes-the-strategy-from-the-home-list-only-after-delete-is-confirmed.md)
- [x] shows the conflict message when a strategy still has sessions — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./automated/shows-the-conflict-message-when-a-strategy-still-has-sessions.md)
- [x] deletes a strategy that has no sessions — API [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
- [x] refuses to delete a strategy that still has sessions — API [`DELETE /api/strategies/:id`](../../../tests/api/strategies.test.ts)
- [x] keeps a strategy that still has a session — API [`API persistence`](../../../tests/api/db/persistence.test.ts)
