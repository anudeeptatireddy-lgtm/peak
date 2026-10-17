import { expect, test } from '@playwright/test';

test('about: marked placeholders, nothing invented, tilt card mounts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/about');
  for (const p of [
    '[ONE-LINE BIO]',
    "[WHAT YOU'RE LOOKING FOR",
    '[CONTACT LINK]',
    '[SOCIAL LINKS]',
    'WHY I MADE PEAK',
  ])
    await expect(page.locator('body')).toContainText(p);
  await expect(
    page.locator('[data-about-card] canvas, [data-about-card] *').first(),
  ).toBeAttached();
  expect(errors).toEqual([]);
});

test('404: a playful scene and links back', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/this-is-not-a-page');
  await expect(page.locator('[data-lost-scene] canvas')).toBeAttached();
  for (const name of ['Go home', 'Browse the gallery', 'Start here'])
    await expect(page.locator('#main').getByRole('link', { name })).toBeVisible();
  expect(errors).toEqual([]);
});
