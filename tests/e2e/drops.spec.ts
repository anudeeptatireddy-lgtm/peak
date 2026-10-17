import { expect, test } from '@playwright/test';

test('drops: list, detail page and RSS feed', async ({ page, request }) => {
  await page.goto('/drops');
  await expect(page.getByRole('heading', { level: 1, name: 'Drops' })).toBeVisible();
  await page.getByRole('link', { name: 'Hello, peak' }).first().click();
  await expect(page).toHaveURL(/\/drops\/hello-peak/);
  await expect(page.getByRole('heading', { level: 1, name: 'Hello, peak' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tweak it and get the prompt' })).toHaveAttribute(
    'href',
    '/scenes/particles',
  );
  const res = await request.get('/rss.xml');
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  expect(xml).toContain('<title>Hello, peak</title>');
  expect(xml).toContain('/drops/hello-peak/');
});

test('home: shows the latest drop and no stand-in notes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#latest-drop')).toContainText('Hello, peak');
  await expect(page.locator('body')).not.toContainText('Stand-in');
});
