import { expect, test } from "@playwright/test";

test("homepage loads with POE Profit branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "POE Profit" })).toBeVisible();
});
