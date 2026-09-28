# Product layer — POE Profit

| Field | Value |
| --- | --- |
| Status | Working agreement (2026-09-27) |
| Applies | When a feature is planned. |
| Related | [`QA_WORKFLOW.md`](./QA_WORKFLOW.md), [`MVP_SPEC.md`](./MVP_SPEC.md) §4, [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md), [ADR-009](./DECISIONS.md) |
| Command | [`.cursor/commands/plan-feature.md`](../.cursor/commands/plan-feature.md) |

How a feature idea becomes an epic and stories. The catalog words (product area, capability, rule, test) live in [`QA_WORKFLOW.md`](./QA_WORKFLOW.md). This file is the planning layer above that page.

## Tree

| Word | Meaning |
| --- | --- |
| Product | POE Profit |
| Product area | strategies, sessions, or a new area. A new area only when a visitor could recheck it without opening those pages. Later, one coverage page. |
| Epic | The outcome that closes. One batch of stories. |
| Story | One thing a player can do. One GitHub issue. |

"Feature" is the idea Taylor brings. It is not a level on this tree. In the catalog that word means the product area. Here the idea becomes an epic.

A capability (create, update, delete) is a section on the coverage page. The test-plan command writes that section later. This step does not.

## Epic names

Plain language for the outcome that closes.

"Sign in with an email account" closes. "Authentication" is a theme. Forgot password, settings, and GGG login would sit under it forever. Do not use a theme as the title. Do not title the epic with the product area.

## Story names

Plain language for the slice. "Register and sign in."

Schema, routes, and pages are the work inside the story. A story split by layer can merge while the player still cannot finish the outcome.

A second outcome is a later epic. Forgot password and settings are not stories on the sign-in epic.

One story is one issue. Do not also file an epic that repeats it. Two or three stories that close together are one epic plus those stories. Do not add stories to fill a template.

## Acceptance criteria

A few present-tense sentences on the story. No "should". An "and" is two criteria. Each sentence is something you could watch fail.

If you would be annoyed when it shipped wrong, it needs a sentence. If it is not in the criteria, it is not in the ticket. Do not write an out-of-scope section.

Three places hold the work:

| Place | Holds |
| --- | --- |
| Story | The decision |
| Tests | The boundaries of that decision (empty, too short, duplicate) |
| Code | The implementation |

This step does not write the tests. The next command turns the sentences into coverage lines.

A failure the player can hit says why, in the same sentence. The exact wording is not required on the issue. The test locks the string the API returns (`error.message`). A later ticket is a copy change, after this behavior works.

"Signed in" has to be something the player can see. Name what is on screen.

Do not plan a slice you will throw away. An email with no password is not an account. Anyone who knows the email is that visitor, and the next story replaces it.

## Example

Illustration of density. Not the next feature. Authentication is an MVP non-goal until Taylor asks for it. [ADR-011](./DECISIONS.md) already says future accounts live in the same Postgres, as app-layer auth, not Neon Auth.

```text
Epic: Sign in with an email account
Area: account (new)
Problem: A visitor cannot come back to their own strategies.

Story: Register and sign in
- A visitor who registers with an email and a password of at least 8 characters lands on the home list, and the list shows that email.
- A shorter password stays on the form, the account is not created, and the form shows that the password is too short.
- A visitor who signs in with that email and password lands on the home list.
- An unknown email or a wrong password stays on the form, and the form shows that the sign-in failed.
- An email that already exists stays on the form, does not create a second account, and the form shows that the email is taken.
```

Name fields, forgot password, settings, GGG login, and making existing strategies private are later epics. They are absent here, so they are not part of this story.

## Filing

[`.cursor/commands/plan-feature.md`](../.cursor/commands/plan-feature.md) files the issues after Taylor accepts the split. Stories are sub-issues of the epic. It places them on the POE Profit board in Backlog ([ADR-009](./DECISIONS.md)). It does not write coverage lines, tests, or product code.
