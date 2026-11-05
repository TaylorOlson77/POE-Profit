# Quality

The page does not use the demo seed. The browser pass does not call GitHub. It renders the fixture in `e2e/quality-fixture.json`.

## Open /quality

- [x] shows the latest results on /quality — UI [`e2e/quality.spec.ts`](../../../e2e/quality.spec.ts). [Steps](./automated/shows-the-latest-results-on-quality.md)
- [x] marks a finished run Passed or Failed — unit [`latestResults`](../../../src/quality/latestResults.test.ts)
- [x] shows the mutation score from the run that scored — unit [`latestResults`](../../../src/quality/latestResults.test.ts)
- [x] says a missing run is not available — unit [`latestResults`](../../../src/quality/latestResults.test.ts)
