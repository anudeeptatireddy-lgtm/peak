// Runs browser tests against the deployed site (PLAN wrap-up routine, step 9.9).
// PEAK_LIVE_URL defaults to the production address. By default only the smoke
// tests run; PEAK_LIVE_FULL=1 runs the whole suite.
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PEAK_LIVE_URL ?? 'https://peak-teal.vercel.app';
const full = !!process.env.PEAK_LIVE_FULL;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: full ? undefined : ['pages.spec.ts', 'indexing.spec.ts', 'journey.spec.ts'],
  fullyParallel: true,
  retries: 1,
  reporter: 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
