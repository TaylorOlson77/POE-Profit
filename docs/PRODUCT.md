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

`plan-epic` reads one phase. It shows the epics and waits. Tickets come after Taylor accepts the epic, and only for that one epic. The next epic is a later run. Do not start a later phase while an earlier one is open, unless [`PHASES.md`](./PHASES.md) says that phase can overlap.

## Ticket

One completable action. When it merges, a player can finish that action. "Register and sign in" is a ticket. "Add the users table" is not. Schema, routes, and pages are the work inside the ticket. A ticket split by layer can merge while the player still cannot finish the action.

Constraints:

- One GitHub issue. One pull request. Implementation is one ticket per chat.
- Plain language for the action.
- A few present-tense acceptance criteria. No "should". An "and" is two criteria. Each sentence is something you could watch fail.
- If you would be annoyed when it shipped wrong, it needs a sentence. If it is not in the criteria, it is not in the ticket. Do not write an out-of-scope section.
- A failure the player can hit says why, in the same sentence. The exact wording is not required on the issue. The test locks the string the API returns (`error.message`). A later ticket is a copy change, after this behavior works.
- "Signed in" has to be something the player can see. Name what is on screen.
- Do not plan a slice you will throw away. An email with no password is not an account. Anyone who knows the email is that visitor, and the next ticket replaces it.

Three places hold the work:

| Place | Holds |
| --- | --- |
| Ticket | The decision |
| Tests | The boundaries of that decision (empty, too short, duplicate) |
| Code | The implementation |

`plan-epic` does not write the tests. The next command turns the sentences into coverage lines.

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
- A visitor who registers with an email and a password of at least 8 characters lands on the home list, and the list shows that email.
- A shorter password stays on the form, the account is not created, and the form shows that the password is too short.
- A visitor who signs in with that email and password lands on the home list.
- An unknown email or a wrong password stays on the form, and the form shows that the sign-in failed.
- An email that already exists stays on the form, does not create a second account, and the form shows that the email is taken.
```

Name fields, forgot password, settings, and GGG login are later epics. They are absent here, so they are not part of this ticket.

## Filing

[`.cursor/commands/plan-epic.md`](../.cursor/commands/plan-epic.md) files the issues after Taylor accepts the tickets. Tickets are sub-issues of the epic. It places them on the POE Profit board in Backlog ([ADR-009](./DECISIONS.md)). It does not write coverage lines, tests, or product code.
