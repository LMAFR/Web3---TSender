import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'test',
  fullyParallel: process.env.CI ? true : false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? parseInt(`${process.env.WORKERS}`, 10) : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:3001',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  globalSetup: './test/playwright/global-setup',
  globalTeardown: './test/playwright/global-teardown',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      'PORT=3001 NEXT_PUBLIC_E2E=true NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545 pnpm run build && ' +
      'PORT=3001 NEXT_PUBLIC_E2E=true NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545 pnpm run start',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});