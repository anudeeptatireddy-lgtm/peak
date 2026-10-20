import { expect, test, type Page } from '@playwright/test';
import { collectErrors } from './helpers';

// PRD §8.8 (Realism standard): WebGL scenes fall back to Canvas 2D when WebGL is unavailable,
// and draw something real when it is.
const REALISTIC = ['velvet', 'soap'];

const drewSomething = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector('[data-stage] canvas') as HTMLCanvasElement | null;
    if (!canvas) return false;
    const g = canvas.getContext('2d');
    if (!g) return 'webgl';
    const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
    const first = [data[0], data[1], data[2]];
    for (let i = 4; i < data.length; i += 4 * 61)
      if (data[i] !== first[0] || data[i + 1] !== first[1] || data[i + 2] !== first[2]) return true;
    return false;
  });

for (const slug of REALISTIC) {
  test.describe(`${slug} (realistic)`, () => {
    test('draws with WebGL', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/dev/scenes?s=${slug}`);
      await expect
        .poll(() => page.evaluate(() => (window as any).__peak?.scheduler().frames ?? 0), {
          timeout: 30_000,
        })
        .toBeGreaterThan(5);
      expect(await drewSomething(page)).toBe('webgl');
      expect(errors).toEqual([]);
    });

    test('falls back to Canvas 2D when WebGL is unavailable', async ({ page }) => {
      const errors = collectErrors(page);
      await page.addInitScript(() => {
        const real = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
          return (real as any).call(this, type, ...rest);
        } as typeof real;
      });
      await page.goto(`/dev/scenes?s=${slug}`);
      await page.waitForTimeout(1500);
      expect(await drewSomething(page)).toBe(true);
      expect(errors).toEqual([]);
    });
  });
}

test.describe('soap: blowing too hard pops a letter', () => {
  const blow = async (page: Page, rounds: number) => {
    await page.setViewportSize({ width: 640, height: 420 });
    for (let i = 0; i < rounds; i++) {
      await page.mouse.move(200 + (i % 2) * 24, 210, { steps: 2 });
      await page.waitForTimeout(40);
    }
    return Number((await page.locator('[data-stage]').getAttribute('data-pops')) ?? 0);
  };
  test('a hard breath pops it (default settings)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'uses mouse hover');
    await page.goto('/dev/scenes?s=soap');
    await page.waitForTimeout(1200);
    expect(await blow(page, 40)).toBeGreaterThan(0);
  });
  test('with pop sensitivity at 0 it never pops', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'uses mouse hover');
    await page.goto('/dev/scenes?s=soap');
    await page.waitForTimeout(800);
    await page.locator('input[name="popSensitivity"]').evaluate((el) => {
      (el as HTMLInputElement).value = '0';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    expect(await blow(page, 40)).toBe(0);
  });
});
