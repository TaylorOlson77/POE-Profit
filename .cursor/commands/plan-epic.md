---
description: Read a phase, confirm its epics, then split one epic into tickets. File only after Taylor accepts.
---

# Plan an epic

You are the product manager. The rules are [`docs/PRODUCT.md`](../../docs/PRODUCT.md). Follow that file for what a phase, an epic, and a ticket are. Do not restate them.

Also read:

- [`docs/PHASES.md`](../../docs/PHASES.md) — the phase Taylor names, or the current phase if he does not
- [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) — this step writes the issue and the ticket note. Title, description, acceptance criteria, and what the note holds are [`docs/PRODUCT.md`](../../docs/PRODUCT.md). Do not restate them.
- [`docs/DECISIONS.md`](../../docs/DECISIONS.md) ADR-009 — GitHub Issues on the [POE Profit](https://github.com/users/TaylorOlson77/projects/1) board
- [`docs/MVP_SPEC.md`](../../docs/MVP_SPEC.md) §4 and [`docs/FUTURE_FEATURES.md`](../../docs/FUTURE_FEATURES.md) — non-goals, and ideas that are not a phase

If this run hit a pain point in the command, name it and the one-line change. Wait. After Taylor accepts, add that line here.

If this run learns something the product docs should say, propose that edit and wait. Do not change the docs until he accepts.

## Epics, then stop

Read the phase. Show each epic that closes inside it: title, area, one line on the problem, what must already be true, what is left on purpose. Start from the list in `PHASES.md`. Change it when the split is wrong, and say why. If two splits are real, name both and which you recommend.

Wait. Do not write tickets yet.

## Tickets, then stop

When he accepts the epic, rename this chat to a few words from that epic title.

For the one epic he accepts, show each ticket in the shape [`docs/PRODUCT.md`](../../docs/PRODUCT.md) shows: title, description, and acceptance criteria. One epic. The next epic is a later run of this command.

Wait.

## File, then stop

File only after he accepts the tickets. If he changes the split, file his.

Use `gh`. Create the epic first and label it `epic`. The title is the outcome. Do not prefix it with `EPIC -`. Create each ticket with `--parent` set to that epic, so GitHub records the sub-issue. Do not write `Part of #` in the body. One ticket and no siblings: file that one issue, and skip the epic label and the parent. If a second story is accepted later, file the epic then and set the parent on the ticket that already exists. Add the issues to the POE Profit board, Backlog column. If that column is missing, ask. Leave them in Backlog.

If the epic list in `PHASES.md` changed and he accepted the change, update that phase in `PHASES.md` so the next run reads the same split.

After filing, rename this chat to the epic number when an epic issue exists, otherwise the ticket number, then a space and a few words from the title.

Post a comment on the ticket that starts with `## Boundary notes`, the way [`docs/PRODUCT.md`](../../docs/PRODUCT.md) describes. One ticket and no epic: the comment goes on that issue. The note is a start for the test command. When a decision changes, edit that comment. Do not post a second one with the same heading.

This command starts on `main` and does not create a branch. If it edited docs or commands, name those files at the end. They may ride on the ticket branch, as [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) describes.

Then stop. No branch, no coverage page, no tests, no product code. The test-plan command names the branch later, from the ticket number, not the epic.
