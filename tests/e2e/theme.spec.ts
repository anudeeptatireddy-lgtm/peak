import { expect, test } from '@playwright/test';

const groundOf = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--ground').trim(),
  );

test('Riso follows the system theme without a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/dev/theme');
  await expect.poll(() => groundOf(page)).toBe('#F4F2FF');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => groundOf(page)).toBe('#160E44');
});
