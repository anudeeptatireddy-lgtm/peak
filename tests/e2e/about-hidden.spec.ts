import { expect, test } from '@playwright/test';

// The About page is hidden until the owner sends their details (DECISIONS, 2026-10-20):
// /about is the 404 page, nothing links to it, the sitemap leaves it out, and no placeholder
// text such as "[YOUR NAME]" is visible anywhere.
test('/about shows the 404 page', async ({ page }) => {
  const res = await page.goto('/about');
  expect(res?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: "This page doesn't exist" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('body')).not.toContainText('[YOUR NAME]');
  await expect(page.locator('body')).not.toContainText('[ONE-LINE BIO]');
});

for (const path of ['/', '/gallery', '/words', '/start']) {
  test(`${path}: no About link in the header or footer, and no placeholder`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('header a[href="/about"], footer a[href="/about"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/about"]')).toHaveCount(0);
    await expect(page.locator('footer.site-footer')).not.toContainText('[YOUR NAME]');
    await expect(page.locator('footer.site-footer')).not.toContainText('About');
  });
}

test('the sitemap leaves /about out', async ({ request }) => {
  const map = await (await request.get('/sitemap-0.xml')).text();
  expect(map).toContain('https://peak-teal.vercel.app/gallery');
  expect(map).not.toMatch(/\/about\/?</);
});
