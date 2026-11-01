import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Settled pages at phone size. Vertical scrolling may bring a control into view.
 * A sideways page scroll, or a control past the viewport width, fails the run.
 * The desktop journeys stay on the pull-request config.
 */

const DEMO_STRATEGY = "Expedition + Temple tablets (demo)";
const STRATEGY_PATH = "/strategies/seed_strategy_poe2_expedition";
const SESSION_PATH = "/sessions/seed_map_session_poe2_expedition";

type Control = {
  name: string;
  locator: (page: Page) => Locator;
};

/** A control is a link, field, or button this test measures. It does not click it. */
const pages: {
  path: string;
  ready: (page: Page) => Promise<void>;
  controls: Control[];
}[] = [
  {
    path: "/",
    ready: async (page) => {
      await expect(page.getByText(DEMO_STRATEGY)).toBeVisible();
    },
    controls: [
      {
        name: "New strategy",
        locator: (page) => page.getByRole("link", { name: "New strategy" }),
      },
    ],
  },
  {
    path: "/strategies/new",
    ready: async (page) => {
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    },
    controls: [
      {
        name: "Name",
        locator: (page) => page.getByLabel("Name", { exact: true }),
      },
      {
        name: "Save strategy",
        locator: (page) => page.getByRole("button", { name: "Save strategy" }),
      },
    ],
  },
  {
    path: STRATEGY_PATH,
    ready: async (page) => {
      await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
        DEMO_STRATEGY,
      );
    },
    controls: [
      {
        name: "Name",
        locator: (page) => page.getByLabel("Name", { exact: true }),
      },
      {
        name: "Save strategy",
        locator: (page) => page.getByRole("button", { name: "Save strategy" }),
      },
    ],
  },
  {
    path: "/sessions",
    ready: async (page) => {
      await expect(
        page.getByRole("table", { name: "Map session history" }),
      ).toBeVisible();
    },
    controls: [
      {
        name: "New session",
        locator: (page) => page.getByRole("link", { name: "New session" }),
      },
    ],
  },
  {
    path: "/sessions/new",
    ready: async (page) => {
      await expect(page.getByLabel("Waystones completed")).toBeVisible();
    },
    controls: [
      {
        name: "Waystones completed",
        locator: (page) => page.getByLabel("Waystones completed"),
      },
      {
        name: "Save session",
        locator: (page) => page.getByRole("button", { name: "Save session" }),
      },
    ],
  },
  {
    path: SESSION_PATH,
    ready: async (page) => {
      await expect(page.getByLabel("Waystones completed")).toHaveValue("40");
    },
    controls: [
      {
        name: "Waystones completed",
        locator: (page) => page.getByLabel("Waystones completed"),
      },
      {
        name: "Save session",
        locator: (page) => page.getByRole("button", { name: "Save session" }),
      },
    ],
  },
];

async function scrollVerticallyIntoView(locator: Locator): Promise<void> {
  await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const room = 8;
    if (rect.top < room) {
      window.scrollBy(0, rect.top - room);
    } else if (rect.bottom > window.innerHeight - room) {
      window.scrollBy(0, rect.bottom - window.innerHeight + room);
    }
  });
}

async function assertInsideViewportWidth(
  page: Page,
  locator: Locator,
  name: string,
): Promise<void> {
  await scrollVerticallyIntoView(locator);
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box, name).not.toBeNull();
  expect(viewport, name).not.toBeNull();
  if (box === null || viewport === null) {
    return;
  }
  expect(box.x, `${name} left`).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, `${name} right`).toBeLessThanOrEqual(
    viewport.width + 1,
  );
}

async function assertPageDoesNotScrollSideways(page: Page): Promise<void> {
  // A wide table may scroll inside its own box. That must not move the page.
  const scrollX = await page.evaluate(() => {
    window.scrollTo(1000, 0);
    const x = window.scrollX;
    window.scrollTo(0, 0);
    return x;
  });
  expect(scrollX).toBe(0);
}

test.describe("Phone pages", () => {
  for (const target of pages) {
    test(`${target.path} keeps its controls inside the viewport width`, async ({
      page,
    }) => {
      await page.goto(target.path);
      await target.ready(page);
      await assertPageDoesNotScrollSideways(page);
      for (const control of target.controls) {
        await assertInsideViewportWidth(
          page,
          control.locator(page),
          control.name,
        );
      }
      await assertPageDoesNotScrollSideways(page);
    });
  }
});
