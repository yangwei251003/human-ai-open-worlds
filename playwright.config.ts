import { defineConfig } from "@playwright/test";
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "/human-ai-open-worlds";
export default defineConfig({
  testDir: "./tests", timeout: 60000, workers: 1,
  use: { baseURL: `http://127.0.0.1:4197${prefix}/`, channel: process.env.BROWSER_CHANNEL || undefined, contextOptions: { reducedMotion: "reduce" }, trace: "retain-on-failure" },
  webServer: { command: "node scripts/preview-prefix.mjs", url: `http://127.0.0.1:4197${prefix}/`, reuseExistingServer: !process.env.CI },
});
