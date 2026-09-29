# Sessions

The demo seed may already include a session for "Expedition + Temple tablets (demo)".

The create, update, and delete lines are one ordered pass on one session. The spec group is serial. A retry removes a leftover session on the demo strategy that is not the demo session, and the same removal runs when the pass finishes. The demo session stays. Sessions on any other strategy stay.

## Create a session

- [x] shows the saved performance totals for an extrapolated session — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/shows-the-saved-performance-totals-for-an-extrapolated-session.md)

### Validation

- [x] rejects an end time before the start — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a zero sample — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a negative unit value — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a body that is not JSON — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a missing map cost — unit [`map session contracts`](../../../src/contracts/mapSessions.test.ts)
- [x] rejects a money amount with more than 12 integer digits or 8 fractional digits — unit [`decimal contracts`](../../../src/contracts/decimal.test.ts)
- [x] rejects a map count or sample count above the database integer limit — unit [`map session contracts`](../../../src/contracts/mapSessions.test.ts)
- [x] rejects a calculated total that does not fit the money column — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] rejects a name or note past its length cap — unit [`text contracts`](../../../src/contracts/text.test.ts)

### Stored values

- [x] stores an 8-decimal-place line that still multiplies — API [`API persistence`](../../../tests/api/db/persistence.test.ts)
- [x] round-trips a money amount at the column limit — API [`API persistence`](../../../tests/api/db/persistence.test.ts)
- [x] round-trips a map count at the integer limit — API [`API persistence`](../../../tests/api/db/persistence.test.ts)
- [x] round-trips the price time — API [`API persistence`](../../../tests/api/db/persistence.test.ts)

### Totals

- [x] stores the line totals, map spend, profit, and rates — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] map spend is the map count times the unit cost, added to investment and not as a line — unit [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] no investment or revenue lines still counts that map spend — unit [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] no maps and no lines leaves every total at zero — unit [`calculateSessionMoney`](../../../src/domain/calc/index.test.ts)
- [x] extrapolated duration spreads the sample across the maps completed — unit [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] observed duration is the time between start and end — unit [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] manual duration is the minutes entered — unit [`effectiveDurationMinutes`](../../../src/domain/calc/index.test.ts)
- [x] a zero duration blanks the hourly rates — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)
- [x] zero maps blanks the per-map rates — unit [`rate metrics and ROI`](../../../src/domain/calc/index.test.ts)
- [x] zero investment blanks the ROI — unit [`rate metrics and ROI`](../../../src/domain/calc/index.test.ts)
- [x] divine profit is blank when the rate is not positive — API [`POST /api/map-sessions`](../../../tests/api/mapSessions.test.ts)

### Form

- [x] drops blank investment and revenue rows — unit [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] keeps the price time until the unit value changes — unit [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] sends only the selected duration method — unit [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] asks for a strategy when none is selected — unit [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] rejects a count that is not a whole number — unit [`buildMapSessionWriteBody`](../../../src/ui/mapSessionForm.test.ts)
- [x] points a validation error at the line row on the form — unit [`formDetailPath`](../../../src/ui/mapSessionForm.test.ts)
- [x] round-trips an observed time through the local field — unit [`local datetime conversion`](../../../src/ui/mapSessionForm.test.ts)

## Update a session

- [x] shows the new totals after a saved quantity change — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/shows-the-new-totals-after-a-saved-quantity-change.md)
- [x] recalculates the totals when the session is replaced — API [`PUT /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
- [x] keeps the session id when lines are replaced — API [`API persistence`](../../../tests/api/db/persistence.test.ts)
- [x] keeps only the active duration method — API [`PUT /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
- [x] keeps a stored category that is not in the seed list — unit [`categoryOptions`](../../../src/ui/revenueCategories.test.ts)

## Delete a session

- [x] removes the session from history only after delete is confirmed — UI [`e2e/sessions.spec.ts`](../../../e2e/sessions.spec.ts). [Steps](./automated/removes-the-session-from-history-only-after-delete-is-confirmed.md)
- [x] deletes a session and it is gone — API [`DELETE /api/map-sessions/:id`](../../../tests/api/mapSessions.test.ts)
