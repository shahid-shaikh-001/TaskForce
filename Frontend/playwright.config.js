import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,

  expect: {
    timeout: 15_000,
  },

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: [
    {
      name: "TaskForge Backend",
      command: "npm start",
      cwd: "../Backend",
      url: "http://localhost:5000/health",
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      name: "TaskForge Frontend",
      command:
        "npm run dev -- --host localhost --port 5173 --strictPort",
      cwd: ".",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});