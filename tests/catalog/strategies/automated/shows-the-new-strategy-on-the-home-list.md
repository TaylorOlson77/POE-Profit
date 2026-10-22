# shows the new strategy on the home list with its cost per waystone

A saved strategy shows on the home list, and the cost per waystone is the one that was saved.

## Steps

Given I am on the home page

When I open New strategy, enter [this strategy](#data), and save
- The new tablet shows 10 uses

Then I am back on the home page, and that row shows Path of Exile 2 and `Estimated cost per waystone: 202c`

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Game | Path of Exile 2 |
| Description | `Tablet-focused expedition farming` |
| Waystone notes | `T16 waystones` |
| Waystone cost (chaos) | `2` |
| Divine rate (chaos per divine) | `200` |
| Tablet name | `Expedition Tablet` |
| Quantity per map | `1` |
| Unit cost | `10` |
| Currency | Divines |
| Uses | `10` |
