# shows the latest results on /quality

The home page opens /quality, and the page shows the four latest results.

## Steps

Given I am on the home page

When I choose Quality beside Sessions

Then the page shows the results in [these results](#data)

## Data

| Result | When | Outcome |
| --- | --- | --- |
| CI | Nov 1 | Passed |
| Playwright | Nov 1 | Passed |
| Visual | Nov 5 | Passed |
| Mutation | Nov 5 | 100. 84 killed. None survived. |
