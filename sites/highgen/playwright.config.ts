import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// Site build/serve scripts (build-local:highgen, start:highgen) and the static export
// paths they use are relative to the repo root, so the webServer runs there.
const REPO_ROOT = path.resolve(__dirname, "../..");

/**
 * Playwright configuration for the HighGen UI smoke tests (no backend
 * required).
 *
 * The suite lives beside the site under sites/highgen/tests/e2e and runs against a
 * served production export. Locally the webServer builds the site first
 * (`build-local:highgen && start:highgen`); in CI it only runs `npm run start:highgen`,
 * relying on the smoke-tests workflow job to build the site beforehand.
 *
 * Run with:
 *   npm run test:e2e:highgen
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Explicit output folder: the HTML reporter otherwise writes to the process
  // cwd (repo root), but the suite runs from here and CI uploads it from here.
  reporter: [
    ["html", { outputFolder: path.resolve(__dirname, "playwright-report") }],
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.CI
      ? "npm run start:highgen"
      : "npm run build-local:highgen && npm run start:highgen",
    cwd: REPO_ROOT,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 120 * 1000 : 600 * 1000,
    url: "http://localhost:3000",
  },
  workers: 3,
});
