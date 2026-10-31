# Product layer — POE Profit

| Field | Value |
| --- | --- |
| Status | Working agreement (2026-09-28) |
| Applies | When the next chunk of work is chosen, and when that chunk is split. |
| Related | [`PHASES.md`](./PHASES.md), [`QA_WORKFLOW.md`](./QA_WORKFLOW.md), [`MVP_SPEC.md`](./MVP_SPEC.md) §4, [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md), [ADR-009](./DECISIONS.md) |
| Commands | [`.cursor/commands/brainstorm.md`](../.cursor/commands/brainstorm.md), [`.cursor/commands/plan-epic.md`](../.cursor/commands/plan-epic.md) |

How an idea becomes work you can finish. The catalog words (product area, capability, rule, test) live in [`QA_WORKFLOW.md`](./QA_WORKFLOW.md). This file is the planning layer above that page.

## Workflow

```text
brainstorm  →  phases  →  plan-epic  →  tickets  →  ticket-test-plan  →  implement
(ideas)        (PHASES.md)  (one epic)   (GitHub)    (coverage)            (one ticket per chat)
```

`brainstorm` is off the delivery pipeline. It is how the next chunks get chosen. `plan-epic` is the first pipeline step. It reads one phase, confirms the epics, then writes tickets for one epic. Taylor reviews both cuts before anything is filed.

Ideas that do not fit a phase live in [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md). A documented non-goal in [`MVP_SPEC.md`](./MVP_SPEC.md) §4 stays out unless Taylor reopens it in one line, with the reason.

"Feature" is the idea Taylor brings. It is not a level on this tree. In the catalog that word means the product area.

## Tree

| Word | Meaning |
| --- | --- |
| Product | POE Profit |
| Phase | The next chunk of the product you agree to build. One player outcome. A handful of epics. |
| Epic | The outcome that closes inside that phase. One batch of tickets. |
| Ticket | One completable action. One thing a player can finish. One GitHub issue. |
| Product area | strategies, sessions, or a new area. A new area only when a visitor could recheck it without opening those pages. Later, one coverage page. |

A capability (create, update, delete) is a section on the coverage page. The test-plan command writes that section later. Planning does not.

The later pipeline commands call the ticket the story. Same issue. The branch name comes from it.

## Phase

A phase is a chunk Taylor could build next, not a theme and not the whole roadmap. "A public board" can be a phase. "The future of the app" cannot.

Write it in [`PHASES.md`](./PHASES.md) only after Taylor accepts it.

Constraints:

- One player outcome. Two outcomes are two phases.
- Name the epic titles that close inside it. A phase with no epics is a theme.
- A handful of epics. Do not add one to fill the phase.
- For each epic, one sentence on the problem, what must already be true, and what stays in a later phase on purpose.
- Order the phases so a later one can name what the earlier one already shipped.
- No acceptance criteria. No schema. No tickets.
- A new product area only when a visitor could recheck that outcome without the strategy form or the session form.

`brainstorm` may name those epics so the chunk is concrete. `plan-epic` is where the split is confirmed or cut. Brainstorm does not file issues.

## Epic

Plain language for the outcome that closes.

"Sign in with an email account" closes. "Authentication" is a theme. Forgot password, settings, and GGG login would sit under it forever. Do not use a theme as the title. Do not title the epic with the product area.

Constraints:

- One outcome. A second outcome is a later epic.
- One sentence on the problem. A player can tell when it is still true.
- One batch of tickets that ship together.
- Name the product area. A new area follows the rule in the tree.
- The epic does not get a branch.
- One ticket and no siblings: file that ticket, and do not also file an epic that repeats it.
- Do not add tickets to fill a template.

`PHASES.md` is the epic planning document. Brainstorm names epic titles there. Do not invent a second GitHub document type for epics.

### On the board

Two or more tickets under one epic: file an epic issue labeled `epic`, and make each ticket a sub-issue. Put the epic and its tickets on the POE Profit board in Backlog.

Only tickets move through Ready, In Progress, In Review, and Testing. The epic stays in Backlog while its children move. When every child is Done, `definition-of-done` moves the epic to Done. Do not park the epic in In Progress for the life of the batch.

Optional board view: Group by Parent issue. That makes swimlanes. Stories still flow left to right inside a lane. The epic card still stays in Backlog until Done.

One ticket and no siblings: that issue is the only card. No epic label. No parent.

`plan-epic` reads one phase. It shows the epics and waits. Tickets come after Taylor accepts the epic, and only for that one epic. The next epic is a later run. Do not start a later phase while an earlier one is open, unless [`PHASES.md`](./PHASES.md) says that phase can overlap.

## Ticket

One completable action. When it merges, a player can finish that action. "Register and sign in" is a ticket. "Add the users table" is not. Schema, routes, and pages are the work inside the ticket. A ticket split by layer can merge while the player still cannot finish the action.

One GitHub issue. One pull request. Implementation is one ticket per chat. Do not plan a slice you will throw away. An email with no password is not an account. Anyone who knows the email is that visitor, and the next ticket replaces it. Do not write an out-of-scope section. If it is not on the issue or in the ticket note, it is not in the ticket.

A ticket whose acceptance criteria depend on a measurement is filed after the measurement exists.

The "As a / I want / so that" line is the description. It is not the title.

### Title

The action, in a few words, readable on the board. "Set how many uses a tablet lasts."

### Description

One or two sentences on the issue. Who it is for, and why it matters.

### Acceptance criteria

About three to five conditions. Each one is done or not done. Present tense. No "should". One condition per bullet. Two things the player sees from the same save can share a bullet.

A failure the player can hit says why, in that bullet. The exact wording is not required on the issue. The test locks the string the API returns (`error.message`). A later ticket is a copy change, after this behavior works.

"Signed in" has to be something the player can see. Name what is on screen.

One key example when the rule would be ambiguous without a number. The other examples are not more bullets. Empty, zero, a second quantity, and a fraction are boundaries of a condition already on the issue.

### Ticket note

After the issue is filed, `plan-epic` posts a comment that starts with `## Boundary notes`.

The comment holds the decisions and examples already discussed: the formula, the defaults, a second quantity, the empty row, the failure cases. It is a start for `ticket-test-plan`. It is not the test list. That command reads the latest comment with that heading, then still proposes cases the comment does not mention. Taylor still cuts the list.

When a decision changes, edit that comment and keep the heading. A second comment that starts with `## Boundary notes` is the one the test command reads, so the older decisions would drop out. If Taylor changes an acceptance criterion in that chat, update the bullet on the issue too.

The epic title is the outcome. It does not start with `EPIC -`. The `epic` label marks it. A ticket filed alone can gain a sibling later. File the epic then, and set the parent on the ticket that already exists.

Four places hold the work:

| Place | Holds |
| --- | --- |
| Issue | The title, the description, and the conditions |
| Ticket note | Decisions and examples that start the test command |
| Tests | The boundaries of a condition (empty, too short, duplicate) |
| Code | The implementation |

`plan-epic` does not write the tests. The next command turns the conditions, and the note, into coverage lines.

## Example

Illustration of density. Not the next epic. The next epic is in [`PHASES.md`](./PHASES.md). Authentication was an MVP non-goal. Taylor reopened it for the public-board phase. [ADR-011](./DECISIONS.md) says those accounts live in the same Postgres, as app-layer auth, not Neon Auth.

```text
Phase: A public board
Player outcome: Someone else can use the public site without reading your strategies.

Epic: Sign in with an email account
Area: account (new)
Problem: A visitor cannot come back to their own strategies.
Already true: a release can apply schema changes to the live database.
Left for later: forgot password, display name, settings, GGG login.

Ticket: Register and sign in
Description: A visitor cannot come back to their own strategies.

- A visitor who registers with an email and a password of at least 8 characters lands on the home list, and the list shows that email.
- A shorter password stays on the form, the account is not created, and the form shows that the password is too short.
- A visitor who signs in with that email and password lands on the home list.
- An unknown email or a wrong password stays on the form, and the form shows that the sign-in failed.
- An email that already exists stays on the form, does not create a second account, and the form shows that the email is taken.
```

Name fields, forgot password, settings, and GGG login are later epics. They are absent here, so they are not part of this ticket. A blank email and a password of only spaces are boundaries of the criteria above. They belong in the ticket note.

## Filing

[`.cursor/commands/plan-epic.md`](../.cursor/commands/plan-epic.md) files the issues after Taylor accepts the tickets. Two or more tickets: the epic is filed first, and each ticket is a sub-issue. One ticket and no siblings: that issue alone, no epic. It places tickets on the POE Profit board in Backlog ([ADR-009](./DECISIONS.md)). When an epic issue exists, it is also added to Backlog and left there until Done. It then posts the ticket note as a comment. It starts on `main` and does not create a branch. It does not write coverage lines, tests, or product code.
