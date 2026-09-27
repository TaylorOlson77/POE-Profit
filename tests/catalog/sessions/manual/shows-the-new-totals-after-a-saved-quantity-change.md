# shows the new totals after a saved quantity change

The performance totals stay on the last save while the quantity is edited, and they show the new figures after save.

## Steps

Given I am on the saved session from [this session](#data)

When I change the Divine Orb quantity to the new value and save

Then, before the save, the page says `Unsaved changes. Totals below are from the last save.` and the totals are still the original ones, and after the save the Performance block shows the new totals

## Data

| Field | Value |
| --- | --- |
| Revenue item | `Divine Orb` |
| Quantity before the edit | `7` |
| Quantity | `9` |

Original totals, still on screen until save: revenue `2120c`, profit `1720c`.

New totals:

| Field | Value |
| --- | --- |
| Divine Orb line total | `1800c` |
| Duration method | Extrapolated |
| Effective duration | `1h 20m` (`80 min`) |
| Total revenue | `2520c` |
| Total investment | `400c` |
| Profit | `2120c` |
| Profit (divine) | `≈ 10.6 Divine` |
| Profit / hour | `1590c` |
| Profit / waystone | `53c` |
| Waystones / hour | `30` |
| ROI | `530%` |

Revenue is `(9 × 200) + (30 × 14) + (60 × 5) = 2520c`. Profit is `2520 − 400 = 2120c`.
