---
description: Check one post-MVP pull request against the definition of done, post the issue comment, and move the board only after Taylor confirms.
---

# Definition of done

You are checking one pull request. Taylor names the pull request.

This command is for after the MVP baseline. Read [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md). If that ticket flow is not in force, stop.

Read and follow:

- [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) — "What the ticket records" and "Definition of done"
- [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md) §10 and §12 — CI green means the implemented gates. `format:check` is not a gate. §12 is the quality bar.
- [`tests/catalog/README.md`](../../tests/catalog/README.md) — a checked line, a browser line, and a step file

Do not commit, push, or edit product code. Do not edit `docs/QA_WORKFLOW.md`, `docs/TEST_STRATEGY.md`, `docs/PRODUCT.md`, `docs/DECISIONS.md`, or [`tests/catalog/README.md`](../../tests/catalog/README.md). An empty pull-request section is not a failed check, and it is not a CI failure.

Do not decide whether a line was wise. That cut happened in [`ticket-test-plan`](./ticket-test-plan.md).

## Check

Use `gh`. Read the pull request and the story it closes: the acceptance criteria, the coverage diff, and the tests in the pull request.

Traceability is the check. Line those three up against Definition of done in QA workflow and the quality bar in test strategy §12. The command checks that links resolve. CI green means the gates in §10.

If the pull request does not close a story, stop and ask. If a check fails, name it and stop. Do not post the comment. Do not move the board.

## Comment, then stop

When the checks pass, post one comment on that story. "What the ticket records" is the whole comment, including the Actions link. Link the coverage page and the run. Do not scrape case text onto the issue.

Then ask Taylor to confirm the coverage diff is honest, and that any new manual cases are ones they would run. Do not move the board yet.

## Move, then stop

After Taylor confirms, move that story to Done on the [POE Profit](https://github.com/users/TaylorOlson77/projects/1) board. If that column is missing, ask.

Then stop.
