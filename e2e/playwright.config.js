// Playwright config (spec 007 / T019). Drives the real frontend served by the
// e2e compose stack on :8080. The stack is brought up by the caller (locally or
// via the reusable stack-tests workflow) before these specs run.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',
  timeout: 30000,
  expect: { timeout: 10000 },
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    // Locally, set PW_CHANNEL=chrome to use the system Google Chrome and skip the
    // Playwright browser download. In CI leave it unset to use bundled chromium.
    channel: process.env.PW_CHANNEL || undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
