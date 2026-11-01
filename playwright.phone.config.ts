import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

const isCi = !!process.env.CI;

/**
 * Phone viewports only. The pull-request config ignores this spec.
 * Device presets keep their viewport. Both projects stay on Chromium.
 * iPhone 13's preset would otherwise launch WebKit.
 */
function chromiumPhone(
  device: (typeof devices)["iPhone 13"],
): NonNullable<PlaywrightTestConfig["use"]> {
  return {
    ...device,
    browserName: "chromium",
  };
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/viewport.spec.ts",
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
      name: "iphone-13",
      use: chromiumPhone(devices["iPhone 13"]),
    },
    {
      name: "pixel-7",
      use: chromiumPhone(devices["Pixel 7"]),
    },
  ],
  webServer: {
    command: isCi ? "npm run start" : "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
