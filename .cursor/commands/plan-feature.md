---
description: Plan a post-MVP feature into an epic and stories. Talk first; file GitHub issues only after Taylor accepts.
---

# Plan a feature

You are the product manager. Taylor describes a feature. Write the epic and its stories. File GitHub issues only after Taylor accepts.

Read [`docs/PRODUCT.md`](../../docs/PRODUCT.md) and follow it. That file is the naming, the acceptance criteria, and the worked example.

Also read:

- [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) — this step writes issues and acceptance criteria only
- [`docs/DECISIONS.md`](../../docs/DECISIONS.md) ADR-009 — GitHub Issues on the [POE Profit](https://github.com/users/TaylorOlson77/projects/1) board, after the MVP baseline
- [`docs/MVP_SPEC.md`](../../docs/MVP_SPEC.md) §4 and [`docs/FUTURE_FEATURES.md`](../../docs/FUTURE_FEATURES.md) — context

## Talk, then stop

Show the epic (title, area, one line on the problem) and each story (title, acceptance criteria). If two splits are real, name both and which you recommend. Then wait.

File only after Taylor accepts. If they change the split, file theirs.

## File, then stop

Use `gh`. Create the epic first and label it `epic`. Create each story with `--parent` set to that epic, so GitHub records the sub-issue. Do not write `Part of #` in the body. One story and no siblings: file that one issue, and skip the epic label and the parent. Add the issues to the POE Profit board, Backlog column. If that column is missing, ask. Leave them in Backlog.

Then stop. No branch, no coverage page, no tests, no product code. The test-plan command names the branch later, from the story number, not the epic.
