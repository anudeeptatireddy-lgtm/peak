import { expect, test } from '@playwright/test';

test('404: a playful scene and links back', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/this-is-not-a-page');
  await expect(page.locator('[data-lost-scene] canvas')).toBeAttached();
  for (const name of ['Go home', 'Browse the gallery', 'Start here'])
    await expect(page.locator('#main').getByRole('link', { name })).toBeVisible();
  expect(errors).toEqual([]);
});
