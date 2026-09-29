# shows the updated cost per waystone on the home list

The home list shows the new cost per waystone after the strategy is saved.

## Steps

Given [this strategy](#data) is on the home list

When I edit it and set the waystone cost to the new value
- The field shows `3`
- Each tablet still shows 10 uses
- The form still shows `Estimated cost per waystone: 23c`

And I click save
- The form shows `Saved.` and `Estimated cost per waystone: 24c`

And I go back to the home page

Then that row shows `Estimated cost per waystone: 24c`

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Waystone cost before the edit | `2` |
| Uses on each tablet | `10` |
| Cost per waystone before the edit | `23c` |
| Waystone cost (chaos) | `3` |
