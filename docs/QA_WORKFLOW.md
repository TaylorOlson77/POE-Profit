# QA workflow — POE Profit

| Field | Value |
| --- | --- |
| Status | In force (2026-09-28). `plan-feature`, `ticket-test-plan`, `dev-wrap-up`, and `definition-of-done` exist. |
| Applies | Feature and fix work on GitHub Issues. |
| Related | [`TEST_STRATEGY.md`](./TEST_STRATEGY.md), [`PRODUCT.md`](./PRODUCT.md), [`AI_DEVELOPMENT.md`](./AI_DEVELOPMENT.md), [ADR-009](./DECISIONS.md) |

How a ticket moves once GitHub Issues are the tracker, and where the coverage pages live. The pages are [`tests/catalog/`](../tests/catalog/README.md).

## How this fits the test strategy

[`TEST_STRATEGY.md`](./TEST_STRATEGY.md) decides which layer owns a behavior and how deep that layer goes. This document decides what a person writes down, and in what order.

| Question | Document |
| --- | --- |
| Does this belong in a unit test, an API test, or a browser check? | Test strategy §3–§4 |
| What does the MVP already promise to automate? | Test strategy §6–§7. Those tables are a snapshot. A later ticket does not add a row there. |
| What would someone recheck by hand, and which test already locks it? | The feature coverage page |
| When is the ticket done? | Test strategy §12 is the quality bar. The checklist in this file is how the ticket shows the bar was met. |
| What is the epic, and what are the acceptance criteria? | [`PRODUCT.md`](./PRODUCT.md) |
| How is a line and a step file written? | [`tests/catalog/README.md`](../tests/catalog/README.md) |

A coverage page is not a second copy of the unit suite. Calculation tests stay in the test file. The page is the rules of a capability, each tied to the test that locks it. A line appears only when a person might otherwise retest that behavior, or when a person still runs it by hand. That sentence is the filter. A second example of a rule already on the page stays in the test file.

## What a visitor should see

The catalog is markdown in git, because a case has to change on a branch and stay unchanged on main until merge.

Each product area has one coverage page. Create, update, and delete are sections on that page, added when those behaviors exist. What a checked box means, and how a line is written, is [`tests/catalog/README.md`](../tests/catalog/README.md). Results belong to CI and, later, the deploy report ([FF-006](./FUTURE_FEATURES.md)).

| Word | In this catalog |
| --- | --- |
| Product | POE Profit |
| Product area | The folder and the page: strategies, sessions. This is what “feature coverage page” means. |
| Capability | A section: create, update, delete |
| Rule | One line |
| Test | The link on that line |
| Epic | Not a catalog word. An epic is a batch of stories that ships and closes. Names and acceptance criteria are in [`PRODUCT.md`](./PRODUCT.md). |

“Feature” is the word that slips. Here it means the product area. In conversation it often means the capability. Keep them apart.

Interview mapping:

| Usual tool | Here |
| --- | --- |
| Test repository | `tests/catalog/<area>/coverage.md` |
| Test case | The step file for a browser line. Where it lives is [`tests/catalog/README.md`](../tests/catalog/README.md). |
| Regression suite | CI for every checked line. The manual cases, across the coverage pages, are the human pass. |
| Requirement link | the pull request that edits the coverage page |
| Test run | GitHub Actions now; a generated deploy report later (FF-006) |

## Pipeline

Each command stops for Taylor before it writes the next artifact.

```text
plan-feature  →  ticket-test-plan  →  implement  →  dev-wrap-up  →  definition-of-done
(issues, AC)     (branch, coverage)   (code + tests)  (commit, PR)    (comment, then the board)
```

| Step | Command | Writes | Does not write |
| --- | --- | --- | --- |
| 1 | `.cursor/commands/plan-feature.md` | Epic, child issues, observable acceptance criteria, board placement | Coverage lines, code, automation |
| 2 | `.cursor/commands/ticket-test-plan.md` | Branch. Edits to the coverage page: lines added, retargeted, or removed. A file under `manual/` only when a person would still run the case. | Product code. A separate impact table. The coverage diff is the impact. |
| 3 | Implementation chat | Product code and the automated tests the new checked lines name, same pull request | A second copy of the cases on the GitHub issue |
| 4 | `.cursor/commands/dev-wrap-up.md` | The commit, doc updates Taylor accepted, and the pull request | The definition-of-done comment. A pass/fail report (FF-006). |
| 5 | `.cursor/commands/definition-of-done.md` | A traceability comment on the issue; move the board only after the checks pass | New product scope. It does not invent whether a line belongs on the page. |

The test-plan command reads this file, [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §4, and [`tests/catalog/README.md`](../tests/catalog/README.md). When a session disagrees with a rule here, the command proposes a dated amendment in this file. The amendment is not in force until Taylor accepts it.

Name the branch from the story, because that issue is the one the pull request closes.

```text
42-register-and-sign-in
```

The number, a hyphen, then a few words from the story title. Lowercase. The epic does not get a branch. A story with no epic uses that single issue's number. The implementation chat stays on that branch. A docs change with no story uses `docs-short-name`. Commit subjects follow the Commits section in [`AGENTS.md`](./AGENTS.md).

`main` is the production branch. Vercel deploys it. Do not commit or push feature work to `main`. The pull request needs green CI ([`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §10) and docs that match the code.

Shared facts live at the top of the area page ([`tests/catalog/README.md`](../tests/catalog/README.md)). If the command lacks one, it asks, and the answer is written there before the case is accepted.

## Catalog

Stood up from the automation that already existed, so a feature ticket can show what it changed.

How a page, a line, and a step file are written is [`tests/catalog/README.md`](../tests/catalog/README.md).

### What gets a line

| Situation | Coverage page | Case file |
| --- | --- | --- |
| Unit or API already locks it, and someone might recheck it by hand | One line: the `it` sentence and a link. Box checked. | None |
| Same rule, different numbers | No extra line | None |
| A person still has to look at the screen | One browser line. Box unchecked until a Playwright spec exists. | Steps under `manual/`, then the data to type |
| Browser test exists for that case | Box checked, link to the spec, and the same steps file moved from `manual/` to `automated/`. | The steps stay. The folder says the spec now runs them. |

### How many

Per ticket, agree the lines before writing a case file:

- Acceptance criteria: a handful, each one something you could watch fail.
- Eyes files: rare. Past a few, each extra file is a behavior you would actually look at.
- Unit examples: as many as the boundaries of the function. Each one locks a different outcome.
- API: one example per contract outcome ([`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §4).
- Browser: zero or one new journey on that ticket. If a journey already walks the screen, extend it.

Cut a line when you would not run it, when it cannot fail on its own, or when the steps describe widgets.

The seven browser lines for strategies and sessions are checked. An unchecked line is a journey the spec does not contain yet.

A screen fact the happy path does not show is an edge case. Propose it, and add the line only after Taylor accepts it.

### Regression

CI is the regression run for every checked line. The manual cases are the human pass. There is no second regression file. A file that only repeats the manual cases will be skipped.

Add a manual case only when all three are true:

1. The behavior will still matter in six months.
2. If it broke, money, saved data, or a primary journey would be wrong.
3. A lower layer does not already lock it on every pull request.

There is no time ceiling. If you would not run the line, it does not go on the page. One-off checks die with the ticket.

## What the ticket records

The coverage page is the product. The pull request is the ticket. Heavy testing does not mean a new folder of validation cases.

A new rule that should still be true in six months becomes an automated test, and a coverage line only if someone might recheck it by hand. Trying a long name, an empty tablet row, or switching games during the ticket is exploratory. It is a few bullets on the pull request. It becomes a catalog line only when it finds a rule the suite does not already lock.

The definition-of-done comment is the whole "I tested this" record:

- Coverage lines added, changed, or removed
- Automated tests added or updated, and the Actions run
- Manual: which case file was run, or "none"
- Exploratory: what was looked at on the screen, and what was deliberately not added to the catalog

## Definition of done

A post-MVP ticket is done when the quality bar in [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §12 is met, and the definition-of-done command can confirm:

1. The coverage page diff is the impact: lines added, retargeted, or removed, and a removed line says why in the pull request.
2. Every checked line links to a test file that exists.
3. Every browser line matches [`tests/catalog/README.md`](../tests/catalog/README.md): the step file is linked, steps come before the data, and a checked line also links to a spec that exists.
4. CI is green on that pull request ([`TEST_STRATEGY.md`](./TEST_STRATEGY.md) §10).
5. The issue has the comment from "What the ticket records," including the Actions link.

The command checks that links resolve. It does not decide that a line is wise. That cut happens in the test-plan step, with Taylor. Before it moves the board item, Taylor confirms the coverage diff is honest and the new manual cases are ones they would run.

We are not failing CI on an empty pull-request section. The control is this command, plus the rule that "done" means it passed. Revisit a mechanical gate only if we skip it.

## Reporting (later)

[FF-006](./FUTURE_FEATURES.md). A generated deploy report. The summary is the feature and the action (create, update, delete), with a pass rate and counts by layer. Counts come from the run. The drill-down is the coverage page with pass or fail joined on the test name. Manual results name the case file, not a separate id. Do not commit a history of full run logs into the repo.

Do not scrape case text onto the ticket. The definition-of-done comment links the coverage page and the run.
