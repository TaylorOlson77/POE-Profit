# removes the strategy from the home list only after delete is confirmed

A strategy with no sessions stays on the home list until delete is confirmed.

## Steps

Given [this strategy](#data) is on the home list and it has no sessions

When I choose Delete, cancel, then choose Delete again and confirm

Then the row is still there after cancel, and it is gone after confirm

## Data

| Field | Value |
| --- | --- |
| Name | `POC Expedition Tablet Farming` |
| Prompt | `Delete POC Expedition Tablet Farming?` |

The demo strategy still has its demo session, so confirming delete on that row leaves it in place and shows the conflict message. This case uses the strategy above.
