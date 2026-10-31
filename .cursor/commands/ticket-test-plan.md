---
description: Plan tests for one story. Propose coverage lines, stop for a cut, then branch and edit that area's page.
---

# Ticket test plan

You are planning tests for one story. Taylor names the story.

Read [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) and follow it.

Read and follow:

- [`docs/QA_WORKFLOW.md`](../../docs/QA_WORKFLOW.md) — this step. Branch name, what gets a line, how many, and the cut.
- [`docs/TEST_STRATEGY.md`](../../docs/TEST_STRATEGY.md) §4 — which layer owns the behavior
- [`docs/PRODUCT.md`](../../docs/PRODUCT.md) — a story, an epic, and what an observable criterion is
- [`tests/catalog/README.md`](../../tests/catalog/README.md) — how to edit a coverage page and write a step file

When this session disagrees with a rule in `docs/QA_WORKFLOW.md`, propose a dated amendment there and wait. It is not in force until Taylor accepts it.

If this run hit a pain point in the command, name it and the one-line change. Wait. After Taylor accepts, add that line here.

Learned on 2026-09-28, from the tablet-uses cut:

- The propose half does not edit files. Plan mode fits it. Switch to agent after the cut.
- If this session cannot rename the chat, say the title `{number}-test-plan` and continue.
- Name the existing tests whose assertions change, including a test whose coverage sentence stays. That list stays in the chat.
- Keep a browser sentence when the screen still shows that outcome. A new field and a new number go in the steps.
- A decision Taylor changes here updates the issue bullet and the existing boundary comment. Do not post a second `## Boundary notes` comment.
- A sibling story is a draft until Taylor accepts the title and the acceptance criteria. Then file it under the epic. It does not go on this branch.

Learned on 2026-10-30, from the Playwright report link:

- Do not add a coverage line, a step file, or a new area page when the case is not worth running again. Say so and stop. A one-off look stays on the pull request.

## Read the ticket, then stop

Use `gh` and read the story: number, title, body, labels, and parent.

Rename this chat to `{number}-test-plan`.

Read the latest issue comment that starts with `## Boundary notes`, when one exists. [`docs/PRODUCT.md`](../../docs/PRODUCT.md) says what that comment is. It is a start. Propose coverage from the acceptance criteria, the comment, and the cases the comment leaves out.

Stop if the acceptance criteria are not observable, as [`docs/PRODUCT.md`](../../docs/PRODUCT.md) defines. Name the criterion. Do not rewrite the issue on your own. `plan-epic` owns the first wording. When Taylor changes a decision in this chat, update that bullet and edit the existing boundary comment.

The epic does not get a branch. If this issue is the epic, ask which story.

## Propose, then stop

Read that area's coverage page. Propose the lines this story adds, retargets, or removes. Follow QA workflow (what gets a line, how many, edge cases) and test strategy §4. For each line: the section, the sentence, the layer, the criterion it locks or the words "edge case", and whether the page already watches it.

If the area has no page, name the area and wait. [`docs/PRODUCT.md`](../../docs/PRODUCT.md) says when a new area exists. The catalog README says there is one page for that area.

If a shared fact is missing, ask in this proposal. QA workflow says where the answer is written.

Then wait for Taylor to cut the list, including edge cases. No branch. No case file. No page edit.

## Write, then stop

After the cut, create the branch from `main` the way QA workflow names it, and set that branch active. If the worktree has other changes, or that branch already exists, stop and ask.

Edit the existing area page, and write step files, the way [`tests/catalog/README.md`](../../tests/catalog/README.md) says. A new area page is created only after Taylor accepted the area.

Do not write product code, a Playwright spec, an impact table, or case numbers. The coverage diff is the impact. Say in the chat why a removed line came off. That reason belongs in the pull request later.

Then stop. Leave the branch uncommitted unless Taylor asks. No pull request. No issue comment that pastes the cases.
