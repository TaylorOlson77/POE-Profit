# Test catalog

How to write a coverage page and a step file. Whether a line belongs on the page is [QA workflow](../../docs/QA_WORKFLOW.md) (Catalog). Which layer owns the behavior is [test strategy §4](../../docs/TEST_STRATEGY.md).

Open [`strategies/coverage.md`](./strategies/coverage.md) and [`sessions/coverage.md`](./sessions/coverage.md). One folder per product area. Not a sprint, a ticket number, or an epic. Create, update, and delete are sections on that page, added when those behaviors exist.

A checked box means an automated test exists. It is not a pass or fail from the last run. Results stay in CI. Not wired to CI.

There is no `calculations/` page. A calculation earns a line on the capability it belongs to when someone might recheck that rule, or it stays only in the unit file.

## Lines

Copy the shape already on the pages. The page does not restate the test. If the name is unclear, rename the test.

The sentence is plain text. It is not a link. A browser line stays unchecked until a Playwright spec exists. The line links `UI [path]` to that spec, and `Steps` to the step file:

```text
- [ ] shows the new strategy on the home list with its cost per waystone — UI [`e2e/strategies.spec.ts`](../../../e2e/strategies.spec.ts). [Steps](./manual/shows-the-new-strategy-on-the-home-list.md)
```

When that chat adds the spec, it checks the box, keeps `UI [path]` pointed at the spec, and moves the step file from `manual/` to `automated/`. The file stays. It is not archived and it is not deleted. The Steps link becomes `./automated/<same-file>.md`.

An API or unit line has no step file. The sentence is still plain text. Checked when the test is already in the repo:

```text
- [x] rejects a missing name — [`POST /api/strategies`](../../../tests/api/strategies.test.ts)
```

The same link, box unchecked, until that test exists.

## Names

The step-file title and the automated test use the same sentence. The file name is that sentence. There is no separate case number. A number next to a file that already has a unique path is a second id, and two branches can both invent the next one.

```text
describe("Create strategy")
  it("shows the new strategy on the home list with its cost per waystone")
```

The `it` sentence still makes sense if a report shows it without the heading. "Appears on the list" does not. API and unit tests use the same kind of sentence under their own `describe` (the route, or the calculation). Present tense. No "should". No method name. An "and" in that sentence means two tests. And in the steps is the next action in the same journey, not a second test.

## Step file

Only a browser line gets one. Write it under `manual/` before that line goes on the page. API and unit lines do not get a step file.

- The title is the sentence. The file name is that sentence, lowercase, with hyphens.
- One sentence under the title says what you are checking.
- Steps come first. One When. A later action in that same journey is And. The When links to the data, as `[this strategy](#data)` does.
- A check that is true before the end is a bullet under that step. Then is only the outcome the title names.
- The values sit at the bottom, under `## Data`.
- No frontmatter. No risk section. No case number.
- A case that creates a row says the row stays until it is deleted. The database is not wiped between runs.

## Shared facts

The top of the area page holds what every case there needs: the app is running, whether there is a login, what the seed already contains, and that saved rows stay until they are deleted. A test run does not clear them.
