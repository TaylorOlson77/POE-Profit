---
description: Commit a feature branch, propose doc updates the change made stale, run the local gates, and open the pull request.
---

# Dev wrap-up

You are wrapping up one story in the chat that already ran `ticket-test-plan` and the implementation. Taylor invokes this on the feature branch. Stay in that chat. [`definition-of-done`](./definition-of-done.md) is the fresh chat, after the pull request is open.

Do not read [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) or [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md) again. This chat already read them for the test plan.

If this chat did not run `ticket-test-plan`, stop and say so.

Read:

- The Commits section and the PowerShell commit note in [`docs/AGENTS.md`](../../docs/AGENTS.md)
- The diff on this branch

Do not edit [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md), [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md), [`docs/PRODUCT.md`](../../docs/PRODUCT.md), [`docs/DECISIONS.md`](../../docs/DECISIONS.md), or [`tests/catalog/README.md`](../../tests/catalog/README.md) to match the code.

If this run hit a pain point in the command, name it and the one-line change. Wait. After Taylor accepts, add that line here.

## Notes

From the diff, open the docs that describe behavior this branch changed, including a gitignored study note and [`tests/catalog/README.md`](../../tests/catalog/README.md) when the diff touches them. Skip a doc the diff does not affect. This pass is for stale sentences. It is not a second read of the pipeline.

Propose a change only when this work makes a current doc wrong or incomplete. Show the edits and wait. After Taylor accepts, edit those files. If the branch does not change what they say, say so and continue.

The study notes stay local. Do not commit them.

A disagreement with `docs/QA_WORKFLOW.md`, `docs/TEST_STRATEGY.md`, `docs/PRODUCT.md`, `docs/DECISIONS.md`, or `tests/catalog/README.md` is a dated amendment. It is not in force until Taylor accepts it.

## Commit

Invoking this command is Taylor asking for the commit. Commit the work on this branch, including the doc updates Taylor accepted. The study notes stay local.

Stay on the feature branch. QA workflow names it from the story. If this checkout is not that branch, stop.

Name the commit the way the Commits section in [`docs/AGENTS.md`](../../docs/AGENTS.md) says. The message goes in a temp file, as the PowerShell note there says. If the work is already committed, do not make an empty commit.

## Gates, then stop

Run these gates locally, in this order. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) is that list. `format:check` is not a gate. If a gate fails, stop. Do not push.

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run test:api`
5. `npm run build`
6. `npm run test:api:db`
7. `npm run test:e2e`

## Pull request, then stop

Push the branch and open the pull request with `gh`. The description is the pull request. The body closes that story, because QA workflow names the branch from the issue the pull request closes. The body goes in a file, the same way the commit message does.

A removed coverage line says why in that description. Exploratory notes stay a few bullets there, as QA workflow describes.

Do not post the issue comment that lists tests added or updated. That comment is [`definition-of-done`](./definition-of-done.md). Do not move the board. Do not write a pass/fail report. That report is [FF-006](../../docs/FUTURE_FEATURES.md).

Then stop.
