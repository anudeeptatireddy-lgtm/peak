import { expect, test, type Page } from '@playwright/test';
import { getWorld } from '../../src/theme/worlds';

const COUNT = 64;
const ground = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--ground').trim(),
  );
const settle = (page: Page) =>
  page
    .evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    .then(() => page.waitForTimeout(80));

test.describe('tour', () => {
  test.setTimeout(240_000);
  test('has every Tour scene, a counter, and no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/tour');
    await expect(page.locator('[data-journey]')).toHaveCount(COUNT);
    await expect(page.locator('[data-count-label]')).toHaveText(`1 of ${COUNT}`);
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });

  test('the ground changes at every boundary between neighbors', async ({ page }) => {
    await page.goto('/tour');
    const info = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-journey]')].map((s) => {
        const r = s.getBoundingClientRect();
        return {
          top: r.top + scrollY,
          bottom: r.bottom + scrollY,
          h: r.height,
          world: s.dataset.world!,
        };
      }),
    );
    const vh = await page.evaluate(() => innerHeight);
    // Each scene's centre shows that scene's own ground (the poll waits for the scroll to land).
    for (const [i, t] of info.entries()) {
      // Scroll again on every poll: the first scroll can land short while neighbors mount.
      await expect
        .poll(
          async () => {
            await page.evaluate((n) => {
              const s = document.querySelectorAll<HTMLElement>('[data-journey]')[n]!;
              const r = s.getBoundingClientRect();
              scrollTo({
                top: r.top + scrollY + r.height / 2 - innerHeight / 2,
                behavior: 'instant',
              });
            }, i);
            await page.waitForTimeout(120);
            return ground(page);
          },
          { message: `ground at the centre of ${t.world}`, timeout: 15000 },
        )
        .toBe(getWorld(t.world as never).ground);
    }
    // Neighbors never share a ground, and the boundary itself is a blend of the two.
    for (let i = 0; i < info.length - 1; i++) {
      const a = getWorld(info[i]!.world as never).ground;
      const b = getWorld(info[i + 1]!.world as never).ground;
      expect(a, `scenes ${i} and ${i + 1} share a ground`).not.toBe(b);
      await expect
        .poll(
          async () => {
            await page.evaluate((n) => {
              const s = document.querySelectorAll<HTMLElement>('[data-journey]')[n]!;
              const r = s.getBoundingClientRect();
              scrollTo({ top: r.bottom + scrollY - innerHeight / 2, behavior: 'instant' });
            }, i);
            await page.waitForTimeout(120);
            const g = await ground(page);
            return g !== a && g !== b;
          },
          { message: `boundary ${i} is a blend`, timeout: 15000 },
        )
        .toBe(true);
    }
  });

  test('never more than two scenes run, and memory stays flat while scrolling to the end', async ({
    page,
  }) => {
    await page.goto('/tour');
    const vh = await page.evaluate(() => innerHeight);
    let most = 0;
    let running = 0;
    for (let i = 0; i < COUNT; i += 1) {
      await page.evaluate((y) => scrollTo(0, y), i * vh);
      await page.waitForTimeout(150);
      const s = await page.evaluate(() => ({
        mounted: (window as any).__tour.mounted() as number,
        running: (window as any).__peak.scheduler().running as number,
      }));
      most = Math.max(most, s.mounted);
      running = Math.max(running, s.running);
    }
    expect(running).toBeLessThanOrEqual(2);
    expect(most).toBeLessThanOrEqual(6);
  });

  test('shuffle reorders scenes, keeps neighbors in different worlds, and round-trips the URL', async ({
    page,
  }) => {
    await page.goto('/tour');
    const before = await page.evaluate(() => (window as any).__tour.order() as string[]);
    await page.getByRole('button', { name: 'Shuffle order' }).click();
    const after = await page.evaluate(() => (window as any).__tour.order() as string[]);
    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort());
    await expect(page).toHaveURL(/order=/);
    const worlds = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-journey]')].map((s) => s.dataset.world),
    );
    for (let i = 1; i < worlds.length; i++) expect(worlds[i]).not.toBe(worlds[i - 1]);
    // The same URL gives the same order.
    const url = page.url();
    await page.goto(url);
    expect(await page.evaluate(() => (window as any).__tour.order())).toEqual(after);
    await page.getByRole('button', { name: 'Reset order' }).click();
    expect(await page.evaluate(() => (window as any).__tour.order())).toEqual(before);
    await expect(page).not.toHaveURL(/order=/);
  });

  test('autoplay moves on every 12 seconds and stops on any touch', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/tour');
    await page.getByRole('button', { name: 'Autoplay' }).click();
    await expect(page.getByRole('button', { name: 'Autoplay' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.clock.runFor(12100);
    await expect(page.locator('[data-count-label]')).toHaveText(`2 of ${COUNT}`);
    await page.clock.runFor(12100);
    await expect(page.locator('[data-count-label]')).toHaveText(`3 of ${COUNT}`);
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => (window as any).__tour.autoplaying())).toBe(false);
    await expect(page.getByRole('button', { name: 'Autoplay' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const label = await page.locator('[data-count-label]').textContent();
    await page.clock.runFor(13000);
    await expect(page.locator('[data-count-label]')).toHaveText(label!);
  });
});

test.describe('tour mounting under stress', () => {
  /** Mounted scenes that sit more than two screens from the viewport (they must not exist). */
  const farMounted = (page: Page) =>
    page.evaluate(() => {
      const vh = innerHeight;
      return [...document.querySelectorAll<HTMLElement>('[data-journey]')].filter((s) => {
        const r = s.getBoundingClientRect();
        const far = r.bottom < -vh * 2 || r.top > vh * 3;
        return far && s.querySelector('[data-mount]')!.childElementCount > 0;
      }).length;
    });

  test('no far scene stays mounted after load settles', async ({ page }) => {
    await page.goto('/tour');
    await page.waitForTimeout(1200);
    expect(await farMounted(page)).toBe(0);
    expect(
      await page.evaluate(() => (window as any).__tour.mounted() as number),
    ).toBeLessThanOrEqual(5);
  });

  test('fast scrolling, shuffle and autoplay together never leave far scenes mounted', async ({
    page,
  }) => {
    await page.goto('/tour');
    await page.getByRole('button', { name: 'Autoplay' }).click();
    const vh = await page.evaluate(() => innerHeight);
    let running = 0;
    for (let i = 0; i < 40; i += 1) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), ((i * 7) % 40) * vh);
      if (i === 12 || i === 27)
        await page
          .getByRole('button', { name: /Shuffle|Reset/ })
          .first()
          .click();
      await page.waitForTimeout(25);
      running = Math.max(
        running,
        await page.evaluate(() => (window as any).__peak.scheduler().running as number),
      );
    }
    // Let loads and the last scroll settle, then nothing far may still be mounted.
    await expect.poll(() => farMounted(page), { timeout: 10000 }).toBe(0);
    expect(running).toBeLessThanOrEqual(2);
    expect(
      await page.evaluate(() => (window as any).__tour.mounted() as number),
    ).toBeLessThanOrEqual(6);
  });
});
