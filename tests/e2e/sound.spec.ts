import { expect, test } from '@playwright/test';

test('sound: off by default, remembered, and silent until the visitor touches the page', async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__made = 0;
    const Real = window.AudioContext;
    (window as any).AudioContext = class extends Real {
      constructor() {
        super();
        (window as any).__made += 1;
      }
    };
  });
  await page.goto('/gallery');
  await expect(page.locator('[data-pref="sound"]').first()).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(await page.evaluate(() => (window as any).__made)).toBe(0);
  // Menu button on a phone, the toggle itself on a laptop.
  const menu = page.locator('[data-menu-open]:visible');
  if (await menu.count()) await menu.click();
  await page.locator('[data-pref="sound"]:visible').first().click();
  await expect(page.locator('[data-pref="sound"]').first()).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('[data-pref="sound"]').first()).toHaveAttribute('aria-pressed', 'true');
  // Off again: pressing buttons makes no audio context.
  expect(await page.evaluate(() => localStorage.getItem('peak:sound'))).toBe('1');
});

test('sound: with sound off, button clicks never start audio', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__made = 0;
    const Real = window.AudioContext;
    (window as any).AudioContext = class extends Real {
      constructor() {
        super();
        (window as any).__made += 1;
      }
    };
  });
  await page.goto('/gallery');
  await page.getByRole('button', { name: 'Events' }).click();
  expect(await page.evaluate(() => (window as any).__made)).toBe(0);
});
