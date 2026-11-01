import { expect, type Page } from "@playwright/test";
import { strategyWithSessions } from "./fixtures";

/**
 * The six settled pages. The accessibility scan, the phone checks, and the
 * screenshots open this list. Each spec keeps its own check.
 * `name` is the screenshot file stem. Changing it orphans a baseline.
 */

const DEMO_STRATEGY = strategyWithSessions.name;
const STRATEGY_PATH = "/strategies/seed_strategy_poe2_expedition";
const SESSION_PATH = "/sessions/seed_map_session_poe2_expedition";

export const settledPages = [
  {
    name: "home",
    path: "/",
    ready: async (page: Page) => {
      await expect(page.getByText(DEMO_STRATEGY)).toBeVisible();
    },
  },
  {
    name: "strategies-new",
    path: "/strategies/new",
    ready: async (page: Page) => {
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    },
  },
  {
    name: "strategy",
    path: STRATEGY_PATH,
    ready: async (page: Page) => {
      await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
        DEMO_STRATEGY,
      );
    },
  },
  {
    name: "sessions",
    path: "/sessions",
    ready: async (page: Page) => {
      await expect(
        page.getByRole("table", { name: "Map session history" }),
      ).toBeVisible();
    },
  },
  {
    name: "sessions-new",
    path: "/sessions/new",
    ready: async (page: Page) => {
      await expect(page.getByLabel("Waystones completed")).toBeVisible();
    },
  },
  {
    name: "session",
    path: SESSION_PATH,
    ready: async (page: Page) => {
      await expect(page.getByLabel("Waystones completed")).toHaveValue("40");
    },
  },
] as const;

export type SettledPageName = (typeof settledPages)[number]["name"];
