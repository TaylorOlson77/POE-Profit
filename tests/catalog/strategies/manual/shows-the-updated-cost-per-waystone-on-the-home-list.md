# shows the updated cost per waystone on the home list

The home list shows the new cost per waystone after the strategy is saved.

## Steps

Given [this strategy](#data) is on the home list

When I edit it and set the waystone cost to the new value
- The field shows `3`
- The form still shows `Estimated cost per waystone: 212c`

And I click save
- The form shows `Saved.` and `Estimated cost per waystone: 213c`

And I go back to the home page

Then that row shows `Estimated cost per waystone: 213c`

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Waystone cost before the edit | `2` |
| Cost per waystone before the edit | `212c` |
| Waystone cost (chaos) | `3` |
