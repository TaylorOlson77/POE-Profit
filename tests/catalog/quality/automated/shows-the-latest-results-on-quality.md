# shows the latest results on /quality

The home page opens /quality, and the page shows the four latest results.

## Steps

Given I am on the home page

When I choose Quality beside Sessions

Then the page shows the results in [these results](#data). Each Areas list is closed until it is opened. The date is a link to that run. CI and Playwright share one address.

## Data

| Result | Covers | Areas | When | Outcome | Run |
| --- | --- | --- | --- | --- | --- |
| CI | Lint, typecheck, unit tests, API tests, and the production build. | strategy API; session API; profit calc; the strategy and session forms; lint, typecheck, and the production build | Nov 1 | Passed | `https://github.com/TaylorOlson77/POE-Profit/actions/runs/101` |
| Playwright | Browser journeys through strategies and sessions. | create, update, and delete a strategy; create, update, and delete a session; the six settled pages | Nov 1 | Passed | `https://github.com/TaylorOlson77/POE-Profit/actions/runs/101` |
| Visual | Screenshots of the six settled pages on a desktop and two phones. | home, new strategy, strategy, sessions, new session, and session; desktop, iPhone 13, and Pixel 7 | Nov 5 | Passed | `https://github.com/TaylorOlson77/POE-Profit/actions/runs/202` |
| Mutation | Changes to the profit calc that the unit tests still catch. | line totals; profit; session money; rates | Nov 5 | 100. 84 killed. None survived. | `https://github.com/TaylorOlson77/POE-Profit/actions/runs/303` |
