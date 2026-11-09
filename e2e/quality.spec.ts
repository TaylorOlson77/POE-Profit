import { expect, test } from "@playwright/test";
import fixture from "./quality-fixture.json";

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
  await expect(
    rows.filter({ hasText: "CI" }).getByRole("link", { name: "Nov 1" }),
  ).toHaveAttribute("href", fixture.ci.href);
  await expect(
    rows.filter({ hasText: "Playwright" }).getByRole("link", { name: "Nov 1" }),
  ).toHaveAttribute("href", fixture.playwright.href);
  await expect(
    rows.filter({ hasText: "Visual" }).getByRole("link", { name: "Nov 5" }),
  ).toHaveAttribute("href", fixture.visual.href);
  await expect(
    rows.filter({ hasText: "Mutation" }).getByRole("link", { name: "Nov 5" }),
  ).toHaveAttribute("href", fixture.mutation.href);
  await expect(page.getByRole("link", { name: "Passed" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "100" })).toHaveCount(0);

  const areaLists = [
    [
      "CI",
      [
        "strategy API",
        "session API",
        "profit calc",
        "the strategy and session forms",
        "lint, typecheck, and the production build",
      ],
    ],
    [
      "Playwright",
      [
        "create, update, and delete a strategy",
        "create, update, and delete a session",
        "the six settled pages",
      ],
    ],
    [
      "Visual",
      [
        "home, new strategy, strategy, sessions, new session, and session",
        "desktop, iPhone 13, and Pixel 7",
      ],
    ],
    ["Mutation", ["line totals", "profit", "session money", "rates"]],
  ] as const;

  for (const [name, areas] of areaLists) {
    const row = rows.filter({ hasText: name });
    for (const area of areas) {
      await expect(row.getByText(area, { exact: true })).toBeHidden();
    }
    await row.getByText("Areas", { exact: true }).click();
    for (const area of areas) {
      await expect(row.getByText(area, { exact: true })).toBeVisible();
    }
  }

  await expect(page.getByRole("link", { name: "CI" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Playwright" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Visual" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Mutation" })).toHaveCount(0);
});
