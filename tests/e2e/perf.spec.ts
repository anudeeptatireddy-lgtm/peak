import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';

// PLAN 9.3 / PRD §19: scripting at most 8 ms per frame for any single scene at default
// params. Measured in the scheduler (the time spent in every scene's update call per frame).
// Chromium only: it is the one engine with stable timings here.
const slugs = readdirSync('src/scenes', { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'node_modules')
  .map((d) => d.name)
  .filter((n) => !['kits'].includes(n));

test.describe('frame time budget', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'timings are measured in Chromium');
  test.setTimeout(60_000);
  for (const slug of slugs) {
    test(`${slug}: scripting under 8 ms per frame at defaults`, async ({ page }) => {
      await page.goto(`/scenes/${slug}`);
      await expect
        .poll(() => page.evaluate(() => (window as any).__peak.scheduler().frameMs.length), {
          timeout: 20000,
        })
        .toBeGreaterThan(90);
      const ms = await page.evaluate(() => (window as any).__peak.scheduler().frameMs as number[]);
      const tail = ms.slice(30).sort((a, b) => a - b);
      const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
      const p95 = tail[Math.floor(tail.length * 0.95)]!;
      console.log(`PERF ${slug} mean=${mean.toFixed(2)} p95=${p95.toFixed(2)}`);
      expect(mean, `${slug} mean ${mean.toFixed(2)}ms`).toBeLessThanOrEqual(8);
    });
  }
});
