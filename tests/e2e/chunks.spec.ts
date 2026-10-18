import { expect, test } from '@playwright/test';

// PLAN 9.3 / PRD §19: each scene is its own chunk, loaded only where used.
async function jsRequests(page: import('@playwright/test').Page, url: string) {
  const js: string[] = [];
  page.on('response', (r) => {
    if (/\.js(\?|$)/.test(r.url())) js.push(r.url());
  });
  await page.goto(url);
  await page.waitForTimeout(1500);
  return js.length;
}

test('pages without scenes load no scene chunks', async ({ page }) => {
  expect(await jsRequests(page, '/start')).toBeLessThanOrEqual(12);
});

test('a scene page loads its own scene, not the other 50', async ({ page }) => {
  expect(await jsRequests(page, '/scenes/ripple')).toBeLessThanOrEqual(30);
});

test('home mounts only scenes near the screen and destroys them once far away', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(1200);
  const vh = await page.evaluate(() => innerHeight);
  let most = 0;
  for (let i = 0; i < 12; i += 1) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), i * vh);
    await page.waitForTimeout(250);
    most = Math.max(most, await page.evaluate(() => (window as any).__home.mounted() as number));
  }
  expect(most).toBeLessThanOrEqual(7);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect
    .poll(() => page.evaluate(() => (window as any).__home.mounted() as number), { timeout: 8000 })
    .toBeLessThanOrEqual(4);
});
