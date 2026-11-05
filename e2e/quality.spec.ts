import { expect, test } from "@playwright/test";

test("shows the latest results on /quality", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("link")).toHaveText([
    "Sessions",
    "Quality",
    "New strategy",
  ]);

  await header.getByRole("link", { name: "Quality" }).click();

  await expect(page).toHaveURL("/quality");
  await expect(page.getByRole("heading", { name: "Quality" })).toBeVisible();
  await expect(
    page.getByText("The latest CI run, Playwright report, midnight run"),
  ).toHaveCount(0);

  const rows = page.getByRole("listitem");
  await expect(rows.filter({ hasText: "CI" })).toContainText(
    "Lint, typecheck, unit tests, API tests, and the production build.",
  );
  await expect(rows.filter({ hasText: "CI" })).toContainText("Nov 1");
  await expect(rows.filter({ hasText: "CI" })).toContainText("Passed");
  await expect(rows.filter({ hasText: "Playwright" })).toContainText(
    "Browser journeys through strategies and sessions.",
  );
  await expect(rows.filter({ hasText: "Playwright" })).toContainText("Nov 1");
  await expect(rows.filter({ hasText: "Playwright" })).toContainText("Passed");
  await expect(rows.filter({ hasText: "Visual" })).toContainText(
    "Screenshots of the six settled pages on a desktop and two phones.",
  );
  await expect(rows.filter({ hasText: "Visual" })).toContainText("Nov 5");
  await expect(rows.filter({ hasText: "Visual" })).toContainText("Passed");
  await expect(rows.filter({ hasText: "Mutation" })).toContainText(
    "Changes to the profit calc that the unit tests still catch.",
  );
  await expect(rows.filter({ hasText: "Mutation" })).toContainText("Nov 5");
  await expect(rows.filter({ hasText: "Mutation" })).toContainText("100");
  await expect(rows.filter({ hasText: "Mutation" })).toContainText(
    "84 killed. None survived.",
  );
  await expect(page.getByRole("link", { name: "CI" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Playwright" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Visual" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Mutation" })).toHaveCount(0);
});
