import { defineConfig, devices } from "@playwright/test";

const isCi = !!process.env.CI;

/**
 * Playwright E2E — critical journeys only (TEST_STRATEGY).
 * Jest owns unit + API; Playwright owns browser journeys (ADR-014).
 *
 * Local: `next dev` (fast iteration; reuseExistingServer if already running).
 * CI: `next start` after `npm run build` in the workflow (prod-like).
 *
 * One worker so the strategy conflict check and the session pass do not
 * touch the demo strategy at the same time.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isCi ? "npm run start" : "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
