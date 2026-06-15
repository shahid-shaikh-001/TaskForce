import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: true,

    // Run only React/Vitest component tests
    include: ["src/**/*.test.{js,jsx}"],

    // Never load Playwright E2E tests
    exclude: [
      "e2e/**",
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
});