# clears the tablet rows only after the game change is confirmed

A tablet row stays until the game change is confirmed.

## Steps

Given I open New strategy

When I enter [this strategy](#data) and change the game to Path of Exile 1
- The prompt says `Switch games and clear the tablets?`

And I cancel
- The game is still Path of Exile 2
- The tablet name is still `Expedition Tablet`
- Name, description, waystone notes, and waystone cost are unchanged

And I change the game to Path of Exile 1 and confirm
- The game is Path of Exile 1
- Name, description, waystone notes, and waystone cost are unchanged

Then the tablet rows are gone

## Data

| Field | Value |
| --- | --- |
| Name | `Game change tablets` |
| Game | Path of Exile 2 |
| Description | `Rows clear only after confirm` |
| Waystone notes | `T16 waystones` |
| Waystone cost (chaos) | `2` |
| Tablet name | `Expedition Tablet` |
| Quantity per map | `1` |
| Unit cost (chaos) | `100` |
| Uses | `10` |

This case does not save, so it leaves no strategy.
