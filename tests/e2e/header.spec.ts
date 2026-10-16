import { expect, test } from '@playwright/test';

test.describe('desktop header', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('tab order is logical', async ({ page }) => {
    await page.goto('/gallery');
    const names: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      names.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          return el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '';
        }),
      );
    }
    expect(names).toEqual([
      'Skip to content',
      'peak, home',
      'Gallery',
      'Tour',
      'Start here',
      'Words',
      'Drops',
      'Pause motion',
      'Living colors',
      'Sound',
    ]);
  });

  test('Pause motion toggles and toggles remember state', async ({ page }) => {
    await page.goto('/gallery');
    const motion = page.getByRole('button', { name: 'Pause motion' });
    await motion.click();
    await expect(page.getByRole('button', { name: 'Play motion' })).toBeVisible();
    const living = page.locator('.controls [data-pref="living"]');
    await expect(living).toHaveAttribute('aria-pressed', 'true');
    await living.click();
    await expect(living).toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.locator('.controls [data-pref="living"]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('opens, traps focus, closes with Esc and returns focus', async ({ page }) => {
    await page.goto('/gallery');
    const openBtn = page.locator('[data-menu-open]');
    await openBtn.click();
    const sheet = page.getByRole('dialog', { name: 'Menu' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Tour' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(openBtn).toBeFocused();
  });
});
