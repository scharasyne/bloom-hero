import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "tests/playwright/.env.test") });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const authDir = path.join(__dirname, "tests/playwright/.auth");

export default defineConfig({
  testDir: "./tests/playwright/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  globalSetup: path.join(__dirname, "tests/playwright/global-setup.ts"),
  projects: [
    {
      name: "guest",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/\.(admin|vendor|customer)\.spec\.ts$/],
    },
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "admin.json"),
      },
      testMatch: [/\.admin\.spec\.ts$/, /\/admin\//],
    },
    {
      name: "vendor",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "vendor.json"),
      },
      testMatch: [/\.vendor\.spec\.ts$/],
      testIgnore: [/\.unregistered\.spec\.ts$/],
    },
    {
      name: "unregistered",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "unregistered.json"),
      },
      testMatch: [/\.unregistered\.spec\.ts$/],
    },
    {
      name: "customer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "customer.json"),
      },
      testMatch: [/\.customer\.spec\.ts$/, /\/customer\//],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
