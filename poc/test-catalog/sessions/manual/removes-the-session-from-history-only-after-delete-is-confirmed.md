# removes the session from history only after delete is confirmed

The session stays on the history list until delete is confirmed.

## Steps

Given [this session](#data) is on the Sessions list

When I choose Delete, cancel, then choose Delete again and confirm

Then the row is still there after cancel, and it is gone after confirm

## Data

| Field | Value |
| --- | --- |
| Strategy | `Expedition + Temple tablets (demo)` |
| Waystones | `40` |
| Profit | `2120c` |
| Prompt | `Delete this session?` |

That profit is the session after the Divine Orb quantity change. The demo session on the same strategy shows profit `1920c`. Leave that row.
