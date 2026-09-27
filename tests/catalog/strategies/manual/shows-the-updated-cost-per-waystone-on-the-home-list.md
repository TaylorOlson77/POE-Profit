# shows the updated cost per waystone on the home list

The home list shows the new cost per waystone after the strategy is saved. Until that save, the cost on the form stays at the previous figure.

## Steps

Given [this strategy](#data) is on the home list

When I edit it, set the waystone cost to the new value, and save

Then the form shows `Saved.` and `Estimated cost per waystone: 213c`, and the home list shows the same cost on that row

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Waystone cost before the edit | `2` |
| Cost per waystone before the edit | `212c` |
| Waystone cost (chaos) | `3` |

`3 + (2 × 100) + (1 × 10) = 213`, shown as `213c`.
