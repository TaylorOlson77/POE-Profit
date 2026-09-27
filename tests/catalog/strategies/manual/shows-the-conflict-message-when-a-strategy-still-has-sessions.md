# shows the conflict message when a strategy still has sessions

Confirming delete on a strategy that still has a session shows the conflict message, and the strategy stays on the home list.

## Steps

Given [this strategy](#data) is on the home list and it still has a session

When I choose Delete and confirm

Then the page shows `Cannot delete a strategy that still has map sessions`, and that row is still on the list

## Data

| Field | Value |
| --- | --- |
| Name | `Expedition + Temple tablets (demo)` |
| Prompt | `Delete Expedition + Temple tablets (demo)?` |
| Message | `Cannot delete a strategy that still has map sessions` |
