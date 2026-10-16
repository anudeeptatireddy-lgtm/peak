import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/gallery',
  '/tour',
  '/start',
  '/fix',
  '/ship',
  '/words',
  '/drops',
  '/about',
  '/rss.xml',
];

for (const route of ROUTES) {
  test(`${route} loads without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('unknown routes show the 404 page with links back', async ({ page }) => {
  const response = await page.goto('/this-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page doesn't exist");
  await expect(page.getByRole('link', { name: 'Browse the gallery' })).toBeVisible();
});
