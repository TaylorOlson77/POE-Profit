# shows the updated cost per waystone on the home list

The home list shows the new cost per waystone after the strategy is saved.

## Steps

Given [this strategy](#data) is on the home list

When I edit it and set the waystone cost to the new value
- The field shows `3`
- The tablet still shows 10 divines and 10 uses
- The divine rate still shows `200`
- The form still shows `Estimated cost per waystone: 202c`

And I click save
- The form shows `Saved.` and `Estimated cost per waystone: 203c`

And I go back to the home page

Then that row shows `Estimated cost per waystone: 203c`

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Waystone cost before the edit | `2` |
| Divine rate (chaos per divine) | `200` |
| Tablet unit cost | `10` divines |
| Uses | `10` |
| Cost per waystone before the edit | `202c` |
| Waystone cost (chaos) | `3` |
