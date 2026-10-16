import { expect, test, type Page } from '@playwright/test';

const vars = (page: Page) =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      c1: cs.getPropertyValue('--c1').trim(),
      ink: cs.getPropertyValue('--ink').trim(),
      accent: cs.getPropertyValue('--accent-text').trim(),
    };
  });

test('accents drift while Living colors is on, text colors never do', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/gallery');
  await page.waitForTimeout(300);
  const a = await vars(page);
  await page.waitForTimeout(3000);
  const b = await vars(page);
  expect(b.c1).not.toBe(a.c1);
  expect(b.ink).toBe(a.ink);
  expect(b.accent).toBe(a.accent);
});

test('accents stay put with Living colors off', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('peak:living', '0'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/gallery');
  await page.waitForTimeout(300);
  const a = await vars(page);
  await page.waitForTimeout(2000);
  expect((await vars(page)).c1).toBe(a.c1);
  expect(a.c1).toBe('#EC1C7F');
});

test('accents stay put while motion is paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/gallery');
  await page.waitForTimeout(300);
  const a = await vars(page);
  await page.waitForTimeout(2000);
  expect((await vars(page)).c1).toBe(a.c1);
});
