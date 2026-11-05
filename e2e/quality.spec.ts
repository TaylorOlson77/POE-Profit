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

  const rows = page.getByRole("listitem");
  await expect(rows.filter({ hasText: "CI" })).toContainText("Nov 1");
  await expect(rows.filter({ hasText: "CI" })).toContainText("Passed");
  await expect(rows.filter({ hasText: "Playwright" })).toContainText("Nov 1");
  await expect(rows.filter({ hasText: "Playwright" })).toContainText("Passed");
  await expect(rows.filter({ hasText: "Visual" })).toContainText("Nov 5");
  await expect(rows.filter({ hasText: "Visual" })).toContainText("Passed");
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
