# removes the session from history only after delete is confirmed

The session stays on the history list until delete is confirmed.

## Steps

Given [this session](#data) is on the Sessions list

When I choose Delete
- The prompt says `Delete this session?`

And I cancel
- The row is still there

And I choose Delete again and confirm

Then the row is gone

## Data

| Field | Value |
| --- | --- |
| Strategy | `Expedition + Temple tablets (demo)` |
| Waystones | `40` |
| Profit | `2120c` |

That profit is the session after the Divine Orb quantity change. The demo session on the same strategy shows profit `1920c`. Leave that row.
