# shows the new totals after a saved quantity change

After save, the Performance block shows the new totals.

## Steps

Given I am on the saved session from [this session](#data)

When I change the Divine Orb quantity to the new value
- The page says `Unsaved changes. Totals below are from the last save.`
- Revenue is still `2120c` and profit is still `1720c`

And I save

Then the Performance block shows the new totals

## Data

| Field | Value |
| --- | --- |
| Revenue item | `Divine Orb` |
| Quantity before the edit | `7` |
| Quantity | `9` |

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
