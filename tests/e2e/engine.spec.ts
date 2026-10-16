import { expect, test } from '@playwright/test';

type W = { __updates: number; __stills: number };

test('scheduler runs visible scenes when motion is on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/dev/engine');
  await expect
    .poll(() => page.evaluate(() => (window as unknown as W).__updates))
    .toBeGreaterThan(5);
});

test('with reduced motion the scheduler waits for Play', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dev/engine');
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => (window as unknown as W).__updates)).toBe(0);
  expect(await page.evaluate(() => (window as unknown as W).__stills)).toBeGreaterThan(0);
  if (isMobile) await page.locator('[data-motion-toggle]').click();
  else await page.getByRole('button', { name: 'Play motion' }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as W).__updates))
    .toBeGreaterThan(5);
});
