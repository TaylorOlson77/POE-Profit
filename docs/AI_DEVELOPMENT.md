# AI-Assisted Development (not vibe coding)

This project uses Cursor as an **engineering accelerator**, not as a substitute for understanding.

The portfolio story is: requirements → decisions → architecture → implementation → tests → explainable choices. (GitHub Issues/board come **after** MVP baseline — see `BACKLOG.md` / ADR-009.)

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
6. **Interview trail** — New decisions and concepts get Q&A entries in `INTERVIEW_PREP.md`.

## What AI may do

- Propose options and tradeoffs
- Draft architecture and tickets
- Implement code after a decision
- Generate tests and docs drafts
- Quiz Taylor from `INTERVIEW_PREP.md`

## What Taylor owns

- Final product and architecture choices
- Acceptance criteria judgment
- Reviewing diffs for understanding (not just “tests green”)
- Being able to explain the system without Cursor present

## Session strategy (Cursor)

Chats do **not** fully remember each other. Carry context via the repo:

| Mechanism | Use for |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | **Start here** — product name, process, stack, next step |
| `docs/*.md` | Specs, ADRs, architecture, backlog checklist, test strategy, interview Qs |
| `.cursor/rules` | Always-on working rules (`ai-development-workflow.mdc`) |
| `@`-mention files | Pull exact docs into a new chat |
| Same chat | Stay when mid-decision or mid-implementation |
| New chat | Clean phase (e.g. planning done → start scaffolding) |

**Suggested opener for a build chat:**

> Read `docs/AGENTS.md`, then `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/MVP_SPEC.md`, `docs/TEST_STRATEGY.md`, and `docs/BACKLOG.md`. Confirm we’re on Phase 1 (markdown checklist, no foundation Issues). Next work is A1 scaffold unless the checklist shows otherwise. Propose a short plan, then implement.

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
- [`BACKLOG.md`](./BACKLOG.md)
- [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) — post-MVP ideas (not committed scope)
- [`COMPETITIVE_ANALYSIS.md`](./COMPETITIVE_ANALYSIS.md)
- [`TEST_STRATEGY.md`](./TEST_STRATEGY.md)
- [`INTERVIEW_PREP.md`](./INTERVIEW_PREP.md)
