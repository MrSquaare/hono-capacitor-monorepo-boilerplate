import { defineConfig, devices } from "@playwright/test";

process.env.VITE_API_RETRY = "0";
process.env.VITE_COVERAGE = "true";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalSetup: "./tests/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev --port 5174",
    reuseExistingServer: !process.env.CI,
    url: "http://localhost:5174",
  },
  workers: process.env.CI ? 1 : undefined,
});
