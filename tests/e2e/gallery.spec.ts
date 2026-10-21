import { expect, test } from '@playwright/test';

const COUNT = 62;

test.describe('gallery', () => {
  test('shows every scene in its own world, with the featured ones first', async ({ page }) => {
    await page.goto('/gallery');
    const tiles = page.locator('.tile');
    await expect(tiles).toHaveCount(COUNT);
    expect(await tiles.first().getAttribute('data-slug')).toBe('particles');
    // Each tile carries its own world's colors, so the grid is a patchwork.
    const grounds = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.tile')].map((t) =>
        t.style.getPropertyValue('--ground'),
      ),
    );
    expect(new Set(grounds).size).toBeGreaterThan(10);
  });

  test('lava and glitch are here, and the industry heroes too', async ({ page }) => {
    await page.goto('/gallery');
    for (const slug of ['lava', 'glitch', 'fogged', 'tailor', 'latte'])
      await expect(page.locator(`.tile[data-slug="${slug}"]`)).toHaveCount(1);
  });

  test('filters and sort live in the URL', async ({ page }) => {
    await page.goto('/gallery?tag=events&sort=easy');
    await expect(page.getByRole('button', { name: 'Events', pressed: true })).toBeVisible();
    const visible = page.locator('.tile:not([hidden])');
    const n = await visible.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(COUNT);
    // Easiest first: the first visible tile is an Easy scene.
    const first = await visible.first().locator('.meta').textContent();
    expect(first).toMatch(/^\s*Easy/);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page).not.toHaveURL(/tag=/);
    await expect(page.locator('.tile:not([hidden])')).toHaveCount(COUNT);
  });

  test('an empty filter says what to do next', async ({ page }) => {
    await page.goto('/gallery');
    await page.evaluate(() =>
      document.querySelectorAll<HTMLElement>('.tile').forEach((t) => (t.dataset.tags = 'x')),
    );
    await page.getByRole('button', { name: 'Events' }).click();
    await expect(page.getByText('Nothing matches that filter')).toBeVisible();
    await page.getByRole('button', { name: 'Show all' }).click();
    await expect(page.locator('[data-empty]')).toBeHidden();
  });

  test('at most four previews animate at once', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1500);
    const running = await page.evaluate(() => (window as any).__peak.scheduler().running as number);
    expect(running).toBeLessThanOrEqual(4);
    const mounted = await page.evaluate(() => (window as any).__gallery.live() as number);
    expect(mounted).toBeGreaterThan(0);
    expect(mounted).toBeLessThan(COUNT);
  });
});
