---
description: Commit a post-MVP feature branch, refresh stale behavior notes, run the local gates, and open the pull request.
---

# Dev wrap-up

You are wrapping up one story after implementation. Taylor invokes this on the feature branch.

This command is for after the MVP baseline. Read [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md). If that ticket flow is not in force, stop. Do not commit.

This step sits after implementation and before [`definition-of-done`](./definition-of-done.md).

Read and follow:

- [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) — the pipeline and the branch
- [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md) §10 — the implemented gates. `format:check` is not a gate.
- [`docs/AGENTS.md`](../../docs/AGENTS.md) — the PowerShell commit note, and the handoff notes a chat keeps current

Do not edit [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md), [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md), [`docs/PRODUCT.md`](../../docs/PRODUCT.md), [`docs/DECISIONS.md`](../../docs/DECISIONS.md), or [`tests/catalog/README.md`](../../tests/catalog/README.md) to match the code.

## Notes

Update behavior notes this change made stale. That is the handoff notes in [`docs/AGENTS.md`](../../docs/AGENTS.md), and the architecture notes in [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

A disagreement with `docs/QA_WORKFLOW.md`, `docs/TEST_STRATEGY.md`, `docs/PRODUCT.md`, `docs/DECISIONS.md`, or `tests/catalog/README.md` is a dated amendment. Propose it and wait. It is not in force until Taylor accepts it.

## Commit

Invoking this command is Taylor asking for the commit. Commit the work on this branch, including those note updates.

Stay on the feature branch. QA workflow names it from the story. If this checkout is not that branch, stop.

The message goes in a temp file, as the PowerShell note in [`docs/AGENTS.md`](../../docs/AGENTS.md) says. If the work is already committed, do not make an empty commit.

## Gates, then stop

Run the implemented gates in [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md) §10 locally, in that order. This repo runs them as [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). If a gate fails, stop. Do not push.

## Pull request, then stop

Push the branch and open the pull request with `gh`. The description is the pull request. The body closes that story, because QA workflow names the branch from the issue the pull request closes. The body goes in a file, the same way the commit message does.

A removed coverage line says why in that description. Exploratory notes stay a few bullets there, as QA workflow describes.

Do not post the issue comment that lists tests added or updated. That comment is [`definition-of-done`](./definition-of-done.md). Do not move the board. Do not write a pass/fail report. That report is [FF-006](../../docs/FUTURE_FEATURES.md).

Then stop.
