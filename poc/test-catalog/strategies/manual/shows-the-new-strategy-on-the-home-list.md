# shows the new strategy on the home list with its cost per waystone

A saved strategy shows on the home list, and the cost per waystone is the one that was saved.

## Steps

Given I am on the home page

When I open New strategy, enter [this strategy](#data), and save

Then I am back on the home page, and that row shows Path of Exile 2 and `Estimated cost per waystone: 212c`

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Game | Path of Exile 2 |
| Description | `Tablet-focused expedition farming` |
| Waystone notes | `T16 waystones` |
| Waystone cost (chaos) | `2` |
| Tablet name | `Expedition Tablet` |
| Quantity per map | `2` |
| Unit cost (chaos) | `100` |
| Tablet name | `Temple Tablet` |
| Modifier notes | `remnants` |
| Quantity per map | `1` |
| Unit cost (chaos) | `10` |

`2 + (2 × 100) + (1 × 10) = 212`, shown as `212c`.
