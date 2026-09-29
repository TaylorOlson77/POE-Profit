# AI-Assisted Development (not vibe coding)

This project uses Cursor as an **engineering accelerator**, not as a substitute for understanding.

The portfolio story is: requirements → decisions → architecture → implementation → tests → explainable choices. GitHub Issues and the board are the tracker (ADR-009). Phase 1 is archived in `docs/archive/BACKLOG.md`.

## Goals

- Learn by building a real deployable web app.
- Be able to defend every major tool and design choice in an interview.
- Prefer “I chose X because Y” over “the AI generated it.”

## Working contract

1. **Options before code** — For material decisions, present 2–3 options with pros/cons. Taylor chooses.
2. **Docs are source of truth** — Durable decisions live in `docs/` (especially `DECISIONS.md` and `ARCHITECTURE.md`), not only in chat.
3. **Explain before / after implement** — Before non-trivial implementation: short plan. After: what changed and why it matches the spec.
4. **Tests prove risk** — Calculation and validation behavior are covered per `TEST_STRATEGY.md`.
5. **No silent scope creep** — Non-goals in `MVP_SPEC.md` stay out unless we explicitly reopen them.

## What AI may do

- Propose options and tradeoffs
- Draft architecture and tickets
- Implement code after a decision
- Generate tests and docs drafts

## What Taylor owns

- Final product and architecture choices
- Acceptance criteria judgment
- Reviewing diffs for understanding (not just “tests green”)
- Being able to explain the system without Cursor present

## Session strategy (Cursor)

Chats do **not** fully remember each other. Carry context via the repo:

| Mechanism | Use for |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | Handoff when the chat is not running a command: product name, process, stack, baseline, commits |
| `docs/*.md` | The command names which of these to open. A build chat does not read the set. |
| `.cursor/rules` | Always-on working rules (`ai-development-workflow.mdc`) |
| `@`-mention files | Pull exact docs into a new chat |
| Same chat | One build chat per ticket: `ticket-test-plan`, then implementation, then `dev-wrap-up`. Close it when the pull request is open. |
| New chat | `plan-epic` once per epic. `definition-of-done` once per pull request. `brainstorm` only when the phase list is thin. Close each when it stops. |

**Build chat**

Name the story and run `ticket-test-plan`. That command lists what to read. Stay in the chat through implementation and `dev-wrap-up`. Do not open with a pass over `AGENTS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `MVP_SPEC.md`, `TEST_STRATEGY.md`, `QA_WORKFLOW.md`, `PRODUCT.md`, and `PHASES.md`.

**Plan-epic and definition-of-done**

Each is a fresh chat. Follow that command's read list.

## Anti-patterns (avoid)

- “Build the whole app” in one prompt with no decisions recorded
- Accepting a stack you cannot explain
- Duplicating business math in the UI “because it’s easier”
- Skipping tests because the happy path looked right in the browser

## Related docs

- [`AGENTS.md`](./AGENTS.md) — handoff for new chats
- [`MVP_SPEC.md`](./MVP_SPEC.md)
- [`DECISIONS.md`](./DECISIONS.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`archive/BACKLOG.md`](./archive/BACKLOG.md) — finished Phase 1 checklist
- [`PHASES.md`](./PHASES.md) — agreed next phases
- [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) — ideas that are not a phase
- [`TEST_STRATEGY.md`](./TEST_STRATEGY.md)
- [`QA_WORKFLOW.md`](./QA_WORKFLOW.md) — ticket flow and test catalog
- [`PRODUCT.md`](./PRODUCT.md) — epic and story rules
