import { expect, test } from "@playwright/test";
import { settledPages } from "./settledPages";

/**
 * Settled pages compared to a committed screenshot.
 * Baselines come from the Ubuntu CI image. A Windows run is not a baseline.
 * The desktop journeys and the phone width checks stay on their own configs.
 */

test.describe("Visual baselines", () => {
  for (const target of settledPages) {
    test(`${target.path} matches its screenshot`, async ({ page }) => {
      await page.goto(target.path);
      await target.ready(page);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${target.name}.png`, {
        fullPage: true,
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 0,
      });
    });
  }
});
