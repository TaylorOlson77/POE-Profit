import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

const isCi = !!process.env.CI;

/**
 * Screenshot baselines. The pull-request config ignores this spec.
 * Device presets keep their viewport. Scale stays at 1 so the picture
 * is that viewport in CSS pixels. Every project stays on Chromium.
 * iPhone 13's preset would otherwise launch WebKit.
 */
function chromiumAt(
  device: (typeof devices)["Desktop Chrome"],
): NonNullable<PlaywrightTestConfig["use"]> {
  return {
    ...device,
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
  };
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/visual.spec.ts",
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
      name: "desktop",
      use: chromiumAt(devices["Desktop Chrome"]),
    },
    {
      name: "iphone-13",
      use: chromiumAt(devices["iPhone 13"]),
    },
    {
      name: "pixel-7",
      use: chromiumAt(devices["Pixel 7"]),
    },
  ],
  webServer: {
    command: isCi ? "npm run start" : "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
