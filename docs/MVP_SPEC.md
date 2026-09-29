# POE Profit — MVP v1

| Field | Value |
| --- | --- |
| Status | Shipped (2026-09-28) |
| Product name | POE Profit |
| Initial game | Path of Exile 2 |
| Future support | Path of Exile 1 |
| Version | 1.0 |
| Revised | 2026-09-28 |
| App shape | Deployable web application; no authentication in MVP |

v1 shipped on 2026-09-28 at [poe-profit.vercel.app](https://poe-profit.vercel.app/). §34 is met. This file stays the product contract.

## 1. Product Overview

POE Profit is a tool for recording, calculating, and analyzing the profitability and efficiency of Path of Exile farming strategies.

The initial version focuses on replacing a spreadsheet-based workflow with a purpose-built application that makes it easy to record:

- Farming strategy information
- Investment / costs
- Revenue
- Item quantities
- Item valuations
- MapSession duration
- Maps / Waystones completed
- Profit
- Profit per hour
- Profit per map / Waystone
- ROI
- Other useful efficiency metrics

The application should make recording a farming session faster and less error-prone than maintaining a spreadsheet manually.

The long-term vision is to evolve the application into a farming strategy experimentation and evidence platform, where players can record results, compare strategies, and eventually contribute community data supporting or challenging published farming claims.

The MVP does not attempt to implement this broader platform.

### Deployment

MVP v1 is a **deployable web application**. Authentication is intentionally out of scope for MVP (see Non-Goals). A public deployment may expose recorded data to anyone with the URL; that trade-off is accepted for portfolio and learning purposes and is documented in `DECISIONS.md`.

## 2. MVP Goals

The MVP should allow a player to:

- Create a farming strategy
- Record an individual map session (MapSession)
- Record investment / cost items
- Record revenue items
- Assign quantities and manually recorded values (`ACTUAL_PAID`)
- Store each value with a save-time stamp (amended 2026-09-28; no capture-time picker)
- Automatically calculate line totals
- Automatically calculate total investment
- Automatically calculate total revenue
- Automatically calculate profit
- Record run duration using an explicit duration method (observed, extrapolated, or manual)
- Record the number of Waystones / maps completed
- Calculate efficiency metrics
- View historical runs
- Review the details and calculations for an individual run
- Edit or correct a run
- Delete a run
- Support both PoE2 terminology and a data model capable of supporting PoE1 later

The MVP should prioritize **correctness, transparency, and testability** over feature breadth.

## 3. Game Support

### MVP

The application will initially target **Path of Exile 2**.

PoE2 terminology should be used throughout the primary UI.

| PoE2 (MVP UI) | Future PoE1 equivalent |
| --- | --- |
| Waystone | Map |
| Tablet | Scarab |
| Tablets | Scarabs |
| Waystone tier | Map tier |
| Currency | Currency |
| Essences | Essences |
| Oils | Oils |

The underlying domain model should avoid unnecessarily hard-coding PoE2 terminology where the concept is shared between games.

For example, internally we may use a generic concept such as `MapLikeItem` while the UI displays **Waystone** for PoE2. Similarly, an enhancement item may be represented generically while the UI displays **Tablet** for PoE2 and **Scarab** for PoE1.

This should allow PoE1 support to be added later without rewriting the calculation engine.

## 4. Explicit MVP Non-Goals

The following are intentionally out of scope for MVP v1:

- **Authentication** — no user accounts or login system
- **GGG API** — no automatic stash retrieval or account integration
- **Automatic pricing** — no poe.ninja or other market-price integration
- **Stash reconciliation** — no “true profit” via stash snapshots
- **Community submissions** — no public strategy sharing or community run submissions
- **Social features** — no comments, likes, follows, profiles, creator accounts, or leaderboards
- **Atlas simulator** — no interactive atlas planning tool
- **Automated item recognition** — no image recognition or OCR
- **Automatic strategy import** — no importing from YouTube, Excel, websites, etc.
- **Advanced statistical analysis** — no confidence intervals, statistical significance, or sophisticated community benchmarking

These may become future features.

## 5. Core Concepts

The MVP is built around three primary concepts:

### Strategy

A reusable definition of a farming strategy.

Examples:

- Breach Tablet Farming
- Delirium Waystone Farming
- Blight Farming
- Expedition Farming

A strategy describes what the player intends to do.

### MapSession

A specific execution of a strategy — one completed mapping session.

Example: *Breach Tablet Farming — September 11, 2026 — 40 Waystones*

A strategy may have many map sessions:

```text
Strategy
 ├── MapSession #1
 ├── MapSession #2
 ├── MapSession #3
 └── MapSession #4
```

This distinction is important for future analytics. (Domain name: **MapSession**; UI may brand differently. Former name: Run — ADR-005.)

### Line Item

A single investment or revenue item.

Example:

- Item: Gilded Tablet
- Quantity: 40
- Unit value: 7 chaos
- Total: 280 chaos

The total should always be calculated by the application.

## 6. Strategy

A Strategy is a reusable **per-map setup cost template** (ADR-020), not a full run log.

**Required**

- Name
- Game
- Description

**Optional**

- Map notes (free text for now; later structured / regex map–waystone mods)

**Required map/waystone slot (exactly one)**

- Map/waystone unit cost in Chaos (quantity is always 1 per map; UI: Map for PoE1, Waystone for PoE2)

**Enhancement lines (0–N, per map)**

Scarabs (PoE1) or tablets (PoE2): name, quantity, unit cost in Chaos, how many maps that purchase lasts, optional modifier notes (UI: PoE2 tablets only). Each line total is **(quantity × unit cost) / uses**. Uses of 1 leaves quantity × unit cost, which is a scarab. **Estimated cost per map** = map/waystone unit cost + sum of enhancement line totals (example: map 2c + 2×100c / 10 uses + 1×10c / 10 uses = 23c). Totals are calculated by the app. A new PoE2 row starts at 10 uses. The Uses field is hidden for PoE1 and the saved line is 1 use.

Tier / party size / quantity-% defaults and external reference URL are **out of MVP Strategy** (rare cases can use description or map notes; atlas links may return later as a dedicated field).

The MVP does not need a complex strategy builder — a short form, a required map/waystone cost, and a small scarab/tablet list is enough.

## 7. MapSession

A MapSession represents a single completed mapping session (ADR-005).

**Required**

- Strategy
- Duration method (`Observed` | `Extrapolated` | `Manual`; default **Extrapolated**)
- Number of maps / Waystones completed
- Map/waystone unit cost in Chaos
- Fields required by the chosen duration method (see §8)

**Optional**

- Notes

These contextual fields are recorded for future analysis but are **not** used to mathematically normalize profitability in MVP v1.

## 8. MapSession Timing

Wall-clock alone often overstates active farming time (breaks, trading, helping others). Many players time a sample of maps and extrapolate. MVP therefore supports an explicit **duration method** per map session (ADR-006).

**Default for new runs:** Extrapolated.

Rate metrics always use **effective duration** derived from that method. The UI must show which method was used.

### Method: Extrapolated (default)

User times a sample of active mapping, then extrapolates to the full run:

```text
averageMinutesPerMap = sampleDurationMinutes / sampleMapsCompleted
effectiveDurationMinutes = averageMinutesPerMap × mapsCompleted
```

Example: 10 Waystones in 20 minutes, 40 Waystones completed → 2 min/Waystone → **80 minutes** effective duration.

Requires `sampleMapsCompleted > 0` and `sampleDurationMinutes > 0`.

### Method: Observed

```text
effectiveDuration = endTime - startTime
```

Requires start time and end time. End time cannot precede start time.

### Method: Manual

User enters active farming duration directly (minutes) when they already know the figure they want to use.

### Display

The application should display effective duration in human-readable form (for example `1h 20m`) and in minutes where appropriate, plus the duration method label.

**Important:** Observed, extrapolated, and manual durations answer different questions. They must not be silently mixed or presented as interchangeable without labeling. Future stash snapshot workflows improve loot truth; they do not replace choosing a duration method.

## 9. Investment / Cost

A run can contain zero or more investment items.

Example:

| Item | Quantity | Unit Value | Total |
| --- | --- | --- | --- |
| Alchemy Orb | 250 | 0.20c | 50c |
| Scour | 60 | 0.26c | 15.60c |
| Chisel | 160 | 0.25c | 40c |
| Horizon | 160 | 0.30c | 48c |
| Gilded Tablet | 40 | 7c | 280c |
| Waystone | 40 | 2c | 80c |

**Investment total:** 513.60 chaos

## 10. Revenue

A run can contain zero or more revenue items.

Revenue should be organized into categories.

Initial categories:

- Currency
- Tablets
- Oils
- Waystones
- Invitations
- Fragments
- Divination Cards
- Essences
- Fossils
- Other

Categories should be data-driven rather than permanently hard-coded so they can be expanded later.

## 11. Revenue Line Item

Each revenue item contains:

- Item
- Quantity
- Unit value
- Total value
- Price recorded at
- Price source
- Valuation type

Example:

- Divine Orb
- Quantity: 1
- Unit value: 200 chaos
- Total value: 200 chaos
- Price recorded: save time
- Source: Manual
- Valuation: Actual Paid

## 12. Price Recording

MVP pricing is **manual**.

Users must explicitly enter the value used for an item.

Historical price means that stored value. The recorded time is save time: a new line, or a line whose unit value changed, is stamped when the session is saved; an unchanged unit value keeps its previous stamp. There is no capture-time picker. (Amended 2026-09-28.)

This is important because market prices change. A historical run should not change its profitability simply because the current market price changes.

Example:

- Divine Orb
- Value: 200 chaos
- Recorded: save time
- Source: Manual
- Valuation: Actual Paid

That stored value remains associated with the run.

## 13. Price Types

MVP persists valuation type **`ACTUAL_PAID` only** (what the player actually paid). Market Value and Actual Sale Price are not stored, and those enum values are not added in MVP. (Amended 2026-09-28.)

## 14. Currency

**Chaos** is the canonical calculation currency.

**Divines** are displayed as a secondary representation.

Example:

```text
Profit
2,273.49 Chaos
≈ 11.37 Divine
```

The application should maintain the conversion rate used for the run.

Example:

```text
Divine Value: 200 Chaos
```

This conversion should be captured with the run rather than dynamically changing historical results.

## 15. Calculation Rules

### Line total

```text
lineTotal = quantity × unitValue
```

Example: `40 × 7 = 280` chaos

### Total investment

```text
totalInvestment = sum(all investment line totals)
```

### Total revenue

```text
totalRevenue = sum(all revenue line totals)
```

### Profit

```text
profit = totalRevenue - totalInvestment
```

### Effective duration

```text
durationMinutes = effectiveDurationMinutes  // from duration method (§8)
durationHours = durationMinutes / 60
```

### Profit per hour

```text
profitPerHour = profit / durationHours
```

### Profit per map / Waystone

```text
profitPerMap = profit / mapsCompleted
```

### Maps / Waystones per hour

```text
mapsPerHour = mapsCompleted / durationHours
```

### ROI

```text
ROI = profit / totalInvestment × 100
```

If investment is zero, ROI should be represented as unavailable rather than producing an infinite or invalid number.

## 16. Edge Cases

The calculation engine must explicitly handle:

| Condition | Expected behavior |
| --- | --- |
| Zero effective duration | Profit/hour and maps/hour must not produce Infinity or NaN; show N/A (or equivalent) |
| Zero maps | Profit/map and maps/hour unavailable; extrapolated method also invalid if sampleMaps = 0 |
| Zero sample duration / maps (extrapolated) | Reject or mark effective duration unavailable — do not divide by zero |
| Zero investment | ROI unavailable |
| Negative profit | Valid (example: Profit: -50 chaos) |
| Fractional quantities | Supported (example: 8.5 Essences) |
| Decimal unit prices | Supported (example: 0.20, 0.26, 0.66) |
| High precision | Avoid floating-point display errors for currency values; establish a consistent precision / rounding strategy |
| Mixed duration methods across runs | Allowed; comparisons must respect method labels |

## 17. Rounding

Calculations should retain sufficient precision internally.

Display rounding should occur at the presentation layer.

Example: display `20.4` chaos rather than `20.400000000000002` chaos.

The calculation engine must have explicit tests around decimal arithmetic.

## 18. MVP MapSession Screen

The primary map-session entry experience should feel like a spreadsheet that does the annoying math for you.

Suggested layout:

```text
--------------------------------------------------
Strategy: Blight Tablet Farming
Date: September 11, 2026

Duration method: Extrapolated
Sample: 10 Waystones in 20 min (2.00 min/Waystone)
Waystones Completed: 40
Effective duration: 1h 20m

Waystone Tier: 16

--------------------------------------------------
INVESTMENT

Item              Qty     Unit       Total
Alchemy           250     0.20c      50.00c
Scour              60     0.26c      15.60c
...
                                      -------
Investment Total:                   513.60c

--------------------------------------------------
REVENUE

Currency

Item              Qty     Unit       Total
Divine              1      200c      200c
Exalt               1       14c       14c
Chaos              79        1c       79c

...

Category Total:                     552.79c

--------------------------------------------------
TOTAL REVENUE:                    2,787.09c
TOTAL INVESTMENT:                   513.60c

PROFIT:                           2,273.49c

--------------------------------------------------
PERFORMANCE

Duration method:                  Extrapolated
Effective duration:                   1h 20m
Profit / Hour:                    1,705.12c
Profit / Waystone:                   56.84c
Waystones / Hour:                    30.00

ROI:                               442.66%

--------------------------------------------------
```

ROI in this block is the display figure the engine test locks (`442.66%`). Amended 2026-09-28.

## 19. MapSession History

The application should provide a list of historical map sessions.

Example columns:

| Date | Strategy | Waystones | Duration | Revenue | Investment | Profit | Profit/hr |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sep 11 | Blight | 40 | 1h39 | 2787c | 514c | 2273c | 1370c/h |
| Sep 10 | Breach | 30 | 1h12 | 2100c | 420c | 1680c | 1400c/h |

The user should be able to select a run and view its complete details.

## 20. Editing

Users should be able to edit:

- MapSession metadata
- Duration method and related timing fields
- Maps / Waystones completed
- Investment lines
- Revenue lines
- Price information
- Notes

All derived values should recalculate automatically.

Users should never manually edit calculated totals.

## 21. Deletion

Users should be able to delete a map session.

Deletion should require confirmation.

The application should not silently delete data.

## 22. Validation

### Strategy

- Name required
- Game required

### MapSession

- Strategy required
- Duration method required (defaults to Extrapolated on create if omitted by client)
- Map/waystone unit cost required
- Maps / Waystones completed cannot be negative
- **Extrapolated:** sample maps completed must be greater than zero; sample duration must be greater than zero
- **Observed:** start time and end time required; end time cannot precede start time
- **Manual:** duration minutes must be greater than or equal to zero

### Line items

- Item required
- Quantity must be greater than or equal to zero
- Unit value must be greater than or equal to zero
- Currency must be valid

Invalid data should produce clear user-facing validation messages.

## 23. Data Model

Conceptual model:

```text
Strategy
  |
  | 1
  |
  | many
  v
MapSession
  |
  +-------------------+
  |                   |
  v                   v
InvestmentLine     RevenueLine
```

Possible entities:

- Strategy
- MapSession
- MapSessionLineItem
- Item
- Category
- PriceSnapshot

The exact database implementation belongs in the technical design (`ARCHITECTURE.md`).

## 24. API Requirements

The MVP backend should expose operations equivalent to:

### Strategies

- `GET /strategies`
- `POST /strategies`
- `GET /strategies/:id`
- `PUT /strategies/:id`
- `DELETE /strategies/:id`

### MapSessions

- `GET /map-sessions`
- `POST /map-sessions`
- `GET /map-sessions/:id`
- `PUT /map-sessions/:id`
- `DELETE /map-sessions/:id`

The exact REST structure may change during technical design.

The API should return calculated values rather than requiring the frontend to independently reproduce business calculations.

## 25. Calculation Architecture

The calculation engine should be isolated from the UI and API layers.

```text
Input MapSession
   ↓
Calculation Engine
   ↓
Calculated MapSession
   ↓
API / UI
```

This allows the calculation logic to be heavily unit tested and prevents business logic from becoming scattered across React components, API controllers, database queries, etc.

## 26. Testing Requirements

Testing is a major component of the MVP. This project is intentionally intended to demonstrate senior QA / SDET capability.

### Unit tests

The calculation engine should have extensive unit coverage, including:

- Basic line totals
- Fractional quantities
- Decimal prices
- Multiple investment lines
- Multiple revenue lines
- Negative profit
- Zero investment
- Zero effective duration
- Extrapolated sample with zero maps or zero duration
- Zero maps (completed)
- ROI
- Profit / hour
- Profit / map
- Maps / hour
- Duration method selection behavior (observed / extrapolated / manual)
- Currency conversion
- Rounding
- Large values

## 27. API Tests

API tests should verify:

- Creating strategies
- Retrieving strategies
- Updating strategies
- Deleting strategies
- Creating runs
- Retrieving runs
- Updating runs
- Deleting runs
- Validation failures
- Calculation correctness
- Invalid IDs
- Missing required fields
- Boundary conditions

## 28. E2E Tests

Playwright should test critical user workflows.

### Create strategy

```text
Create strategy
      ↓
Enter strategy information
      ↓
Save
      ↓
Verify strategy appears
```

### Record map session

```text
Create map session
      ↓
Add investment
      ↓
Add revenue
      ↓
Enter prices
      ↓
Choose duration method
      ↓
Enter timing fields
      ↓
Save
      ↓
Verify calculations and method label
```

### Edit run

```text
Open run
      ↓
Change quantity
      ↓
Save
      ↓
Verify totals recalculate
```

### Delete run

```text
Open run
      ↓
Delete
      ↓
Confirm
      ↓
Verify run no longer appears
```

## 29. Test Strategy

Testing should follow a pyramid:

```text
             E2E
            /   \
       API /     \ UI
          /       \
     Integration Tests
        /         \
       /  Unit     \
      /_____________\
```

The calculation engine should have the highest level of automated coverage because incorrect calculations represent a core business risk.

Playwright should focus on high-value user journeys rather than testing every permutation through the browser.

Detailed strategy lives in `TEST_STRATEGY.md`.

## 30. Quality Requirements

The project should include:

- Automated unit tests
- API tests
- Playwright E2E tests
- Linting
- Formatting
- Type checking
- CI pipeline
- Test reports
- Failure artifacts
- Screenshots for failed E2E tests
- Clear README
- Architecture documentation
- Test strategy documentation
- AI development documentation

## 31. AI-Assisted Development

AI tools are explicitly part of the development process.

AI should be used as an engineering assistant, not as a replacement for engineering ownership.

The developer remains responsible for:

- Requirements
- Architecture
- Acceptance criteria
- Test strategy
- Security decisions
- Code review
- Test review
- Edge cases
- Product decisions
- Final implementation quality

AI may assist with:

- Boilerplate
- Implementation
- Refactoring
- Test generation
- Documentation
- Debugging
- Code exploration
- Alternative approaches

The repository should document significant AI-assisted development decisions (see future `AI_DEVELOPMENT.md`).

## 32. Future Roadmap

### V1.x

- Better run editing
- Charts
- Strategy comparison
- More detailed notes
- Saved item catalog
- Better price-entry workflow

### V2

- PoE1 support
- Market price integrations
- poe.ninja integration
- Price snapshot automation
- Strategy templates

### V3

- GGG account authentication
- Stash data
- Stash reconciliation
- Automated inventory / run accounting

### V4

- Community strategies
- Community runs
- Aggregated results
- Sample sizes
- Median / average results
- Strategy comparisons

### V5

- Creator strategy pages
- Evidence-based strategy analysis
- Community validation
- Advanced statistics
- Strategy discovery

## 33. Product Philosophy

The application should avoid presenting profitability as an absolute truth.

A farming strategy's profitability depends on variables including:

- Player efficiency
- Build
- Gear
- Map / Waystone tier
- Quantity
- Rarity
- Atlas configuration
- Tablet / scarab configuration
- Market prices
- Drop variance
- Player strategy execution

The application should therefore present recorded results as **observations**, not guarantees.

The long-term goal is to make it easier to collect enough observations to understand the variability of a strategy.

## 34. MVP Definition of Done

MVP v1 is complete when a user can:

1. Create a PoE2 farming strategy
2. Record a complete map session
3. Enter investments and revenue
4. Enter historical prices
5. Save the map session
6. See automatically calculated profit and efficiency
7. Reopen the map session later
8. Edit it
9. Have automated tests verify the core behavior

The MVP is not complete merely because the UI works.

The calculation engine, API, validation, and automated tests must also meet the project's quality requirements.
