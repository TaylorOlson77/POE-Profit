# Sessions

A checked box means an automated test exists. It is not a pass/fail from the last run.

App running locally, no login. The demo seed may already include a session for "Expedition + Temple tablets (demo)".

Rows you save stay in the database until you delete them. A test run or a deploy does not clear them. Re-seeding replaces only that demo strategy and its demo session.

The create, update, and delete lines are one ordered pass on one session. The spec group is serial. A retry starts by removing a leftover session on the demo strategy that is not the demo session. The same removal runs again when the pass finishes, including after a failure. The demo session stays. Sessions on any other strategy stay.

This page does not list every unit test in the repo. A line is a behavior someone might otherwise recheck by hand.

## Create a session

- [x] shows the saved performance totals for an extrapolated session — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/shows-the-saved-performance-totals-for-an-extrapolated-session.md)

### Validation

- [x] rejects an end time before the start — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a zero sample — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a negative unit value — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a body that is not JSON — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a missing map cost — [`map session contracts`](../../../src/contracts/mapSessions.test.ts)
- [x] rejects a money amount with more than 12 integer digits or 8 fractional digits — [`decimal contracts`](../../../src/contracts/decimal.test.ts)
- [x] rejects a map count or sample count above the database integer limit — [`map session contracts`](../../../src/contracts/mapSessions.test.ts)
- [x] rejects a calculated total that does not fit the money column — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)

### Totals

- [x] stores the line totals, map spend, profit, and rates — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] map spend is the map count times the unit cost, added to investment and not as a line — [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] no investment or revenue lines still counts that map spend — [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] no maps and no lines leaves every total at zero — [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] extrapolated duration spreads the sample across the maps completed — [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] observed duration is the time between start and end — [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] manual duration is the minutes entered — [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] a zero duration blanks the hourly rates — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] zero maps blanks the per-map rates — [`rate metrics and ROI`](../../../src/domain/calc/index.test.ts)
- [x] zero investment blanks the ROI — [`rate metrics and ROI`](../../../src/domain/calc/index.test.ts)
- [x] divine profit is blank when the rate is not positive — [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)

### Form

- [x] drops blank investment and revenue rows — [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] keeps the price time until the unit value changes — [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] sends only the selected duration method — [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] asks for a strategy when none is selected — [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] rejects a count that is not a whole number — [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] points a validation error at the line row on the form — [`formDetailPath`](../../../src/ui/mapSessionForm.test.ts)
- [x] round-trips an observed time through the local field — [`local datetime conversion`](../../../src/ui/mapSessionForm.test.ts)

## Update a session

- [x] shows the new totals after a saved quantity change — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/shows-the-new-totals-after-a-saved-quantity-change.md)
- [x] recalculates the totals when the session is replaced — [`PUT /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
- [x] keeps only the active duration method — [`PUT /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
- [x] keeps a stored category that is not in the seed list — [`categoryOptions`](../../../src/ui/revenueCategories.test.ts)

## Delete a session

- [x] removes the session from history only after delete is confirmed — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/removes-the-session-from-history-only-after-delete-is-confirmed.md)
- [x] deletes a session and it is gone — [`DELETE /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
