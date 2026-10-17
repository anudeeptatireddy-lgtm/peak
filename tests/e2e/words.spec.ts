import { expect, test } from '@playwright/test';

test('words: 24 words with say-it sentences and seen-in links', async ({ page }) => {
  await page.goto('/words');
  await expect(page.locator('.word')).toHaveCount(24);
  await expect(page.locator('#spring [data-copy-text]')).not.toBeEmpty();
  expect(await page.locator('#spring .seen a').count()).toBeGreaterThan(0);
});

test('words: search filters as you type', async ({ page }) => {
  await page.goto('/words');
  await page.getByRole('searchbox').fill('damp');
  await expect(page.locator('.word:not([hidden])')).toHaveCount(1);
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await expect(page.locator('.word:not([hidden])')).toHaveCount(24);
});

test('words: a deep link highlights the word', async ({ page }) => {
  await page.goto('/words#damping');
  await expect(page.locator('#damping')).toHaveClass(/is-target/);
  await expect(page.locator('#damping')).toBeInViewport();
});

test('words: demos run only while on screen', async ({ page }) => {
  await page.goto('/words');
  await expect.poll(() => page.evaluate(() => (window as any).__words.live())).toBeGreaterThan(0);
  const n = await page.evaluate(() => (window as any).__words.live());
  expect(n).toBeLessThan(8);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => (window as any).__words.live())).toBeLessThan(8);
});

test('words: a slider changes its demo without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/words#damping');
  await page.locator('#damping [data-slider]').fill('0.7');
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
