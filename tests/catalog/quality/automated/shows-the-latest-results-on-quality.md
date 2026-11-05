# shows the latest results on /quality

The home page opens /quality, and the page shows the four latest results.

## Steps

Given I am on the home page

When I choose Quality beside Sessions

Then the page shows the results in [these results](#data)

## Data

| Result | Covers | When | Outcome |
| --- | --- | --- | --- |
| CI | Lint, typecheck, unit tests, API tests, and the production build. | Nov 1 | Passed |
| Playwright | Browser journeys through strategies and sessions. | Nov 1 | Passed |
| Visual | Screenshots of the six settled pages on a desktop and two phones. | Nov 5 | Passed |
| Mutation | Changes to the profit calc that the unit tests still catch. | Nov 5 | 100. 84 killed. None survived. |
