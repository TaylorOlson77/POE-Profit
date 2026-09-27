# Test catalog sketch

The shape is agreed. It lives here, in `tests/catalog/`. Not wired to CI.

Picture so far: strategies and sessions, each with create, update, and delete, plus the conflict message when a strategy still has sessions. Those are unchecked Playwright lines. The spec files are not written yet. A checked box still means an automated test exists.

Open [`strategies/coverage.md`](./strategies/coverage.md) and [`sessions/coverage.md`](./sessions/coverage.md). Each page is a product area. Create, update, and delete are capabilities on that page. A line is a rule of that capability, linked to the test that locks it. Browser steps are the other files, under `manual/` until a Playwright spec exists. Then that file moves to `automated/`. Steps are first. The values you type are at the bottom of that case.

A box on the list means an automated test exists. It does not mean the test passed last night. Results stay in CI.

## Names

The manual title and the automated test use the same kind of sentence. The file name is that sentence. There is no separate case number.

```text
describe("Create strategy")
  it("shows the new strategy on the home list with its cost per waystone")
```

The `it` sentence still makes sense if a report shows it without the heading. "Appears on the list" does not. API and unit tests use the same kind of sentence under their own `describe` (the route, or the calculation). No "should", no method name. An "and" means two tests.

## Data

The numbers for a manual case live in that case, under the steps, behind a link in the When. Shared facts (app running, no login) are one line on the area page.
