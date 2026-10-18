import { expect, test } from '@playwright/test';

// After launch (PLAN 9.7) normal pages are indexable; only the 404 page opts out.
const ROUTES = ['/', '/gallery', '/tour', '/start', '/words', '/scenes/particles'];

for (const route of ROUTES) {
  test(`${route} has no noindex`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
}

test('the 404 page stays noindex', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('robots.txt allows everything and points to the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).not.toMatch(/^Disallow: \/$/m);
  expect(body).toMatch(/Sitemap: https:\/\/peak-teal\.vercel\.app\//);
});

test('the sitemap lists the live pages and no dev pages', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain('https://peak-teal.vercel.app/sitemap-0.xml');
  const map = await (await request.get('/sitemap-0.xml')).text();
  expect(map).toContain('https://peak-teal.vercel.app/gallery');
  expect(map).toContain('https://peak-teal.vercel.app/scenes/ripple');
  expect(map).not.toContain('/dev/');
});
