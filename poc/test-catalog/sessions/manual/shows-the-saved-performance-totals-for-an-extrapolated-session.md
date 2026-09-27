# shows the saved performance totals for an extrapolated session

After save, the session page shows the performance totals from that save. The form opens on Extrapolated, and the waystone cost is the one copied from the strategy.

## Steps

Given I am on the home page

When I choose Log session for [this strategy](#data), enter [this session](#data), and save

Then the address is that session, and the Performance block shows the saved totals below

## Data

The strategy is the demo row. Log session selects it and fills the waystone cost.

| Field | Value |
| --- | --- |
| Strategy | `Expedition + Temple tablets (demo)` |
| Waystone cost (chaos) | `2` |
| Waystones completed | `40` |
| Divine rate (chaos per divine) | `200` |
| Method | Extrapolated |
| Sample waystones | `10` |
| Sample minutes | `20` |
| Investment item | `Expedition Tablet` |
| Qty | `40` |
| Unit | `7` |
| Investment item | `Temple Tablet` |
| Qty | `40` |
| Unit | `1` |
| Category | Currency |
| Revenue item | `Divine Orb` |
| Qty | `7` |
| Unit | `200` |
| Category | Currency |
| Revenue item | `Exalted Orb` |
| Qty | `30` |
| Unit | `14` |
| Category | Tablets |
| Revenue item | `Expedition Tablet` |
| Qty | `60` |
| Unit | `5` |

Saved totals:

| Field | Value |
| --- | --- |
| Waystone investment | `80c` |
| Duration method | Extrapolated |
| Effective duration | `1h 20m` (`80 min`) |
| Total revenue | `2120c` |
| Total investment | `400c` |
| Profit | `1720c` |
| Profit (divine) | `≈ 8.6 Divine` |
| Profit / hour | `1290c` |
| Profit / waystone | `43c` |
| Waystones / hour | `30` |
| ROI | `430%` |

Waystone spend is `40 × 2 = 80`, added to the investment lines (`280 + 40`) for `400c`. Revenue is `(7 × 200) + (30 × 14) + (60 × 5) = 2120c`. Profit is `2120 − 400 = 1720c`. The Divine Orb quantity is `7` so this row is not the demo session, whose profit is `1920c`.
