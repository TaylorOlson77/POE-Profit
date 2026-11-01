import { expect, test, type Page } from "@playwright/test";

/**
 * Settled pages compared to a committed screenshot.
 * Baselines come from the Ubuntu CI image. A Windows run is not a baseline.
 * The desktop journeys and the phone width checks stay on their own configs.
 */

const DEMO_STRATEGY = "Expedition + Temple tablets (demo)";
const STRATEGY_PATH = "/strategies/seed_strategy_poe2_expedition";
const SESSION_PATH = "/sessions/seed_map_session_poe2_expedition";

const pages: {
  name: string;
  path: string;
  ready: (page: Page) => Promise<void>;
}[] = [
  {
    name: "home",
    path: "/",
    ready: async (page) => {
      await expect(page.getByText(DEMO_STRATEGY)).toBeVisible();
    },
  },
  {
    name: "strategies-new",
    path: "/strategies/new",
    ready: async (page) => {
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    },
  },
  {
    name: "strategy",
    path: STRATEGY_PATH,
    ready: async (page) => {
      await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
        DEMO_STRATEGY,
      );
    },
  },
  {
    name: "sessions",
    path: "/sessions",
    ready: async (page) => {
      await expect(
        page.getByRole("table", { name: "Map session history" }),
      ).toBeVisible();
    },
  },
  {
    name: "sessions-new",
    path: "/sessions/new",
    ready: async (page) => {
      await expect(page.getByLabel("Waystones completed")).toBeVisible();
    },
  },
  {
    name: "session",
    path: SESSION_PATH,
    ready: async (page) => {
      await expect(page.getByLabel("Waystones completed")).toHaveValue("40");
    },
  },
];

test.describe("Visual baselines", () => {
  for (const target of pages) {
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
