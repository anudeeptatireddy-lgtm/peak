import { expect, test } from '@playwright/test';

// Until launch (PLAN 9.7) search engines are asked to skip every page.
const ROUTES = ['/', '/gallery', '/tour', '/start', '/words', '/scenes/particles', '/missing-page'];

for (const route of ROUTES) {
  test(`${route} carries noindex`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}

test('robots.txt disallows everything', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toMatch(/User-agent: \*/);
  expect(body).toMatch(/^Disallow: \/$/m);
});
