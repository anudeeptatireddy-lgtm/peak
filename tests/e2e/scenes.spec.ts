// The browser half of the scene definition of done (PLAN, top of file):
// loads cleanly, draws a still frame, respects reduced motion, cleans up after
// itself, and keeps vertical scrolling available on touch.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SCENES = readdirSync(join(process.cwd(), 'src/scenes'), { withFileTypes: true })
  .filter(
    (d) => d.isDirectory() && existsSync(join(process.cwd(), 'src/scenes', d.name, 'index.ts')),
  )
  .map((d) => d.name)
  .sort();

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

const drewSomething = (page: Page) =>
  page.evaluate(() => {
    const stage = document.querySelector('[data-stage]')!;
    const canvas = stage.querySelector('canvas');
    if (!canvas) return stage.textContent!.trim().length > 0;
    const ctx = canvas.getContext('2d')!;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4 * 97) if (data[i]! > 0) return true;
    return false;
  });

for (const slug of SCENES) {
  test.describe(slug, () => {
    test('runs without console errors', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/dev/scenes?s=${slug}`);
      await expect
        .poll(() => page.evaluate(() => (window as any).__peak?.scheduler().frames ?? 0))
        .toBeGreaterThan(10);
      await page.mouse.move(200, 300);
      await page.mouse.move(260, 320, { steps: 5 });
      await page.mouse.click(240, 300);
      await page.waitForTimeout(300);
      expect(await drewSomething(page)).toBe(true);
      expect(errors).toEqual([]);
    });

    test('shows a still frame and waits under reduced motion', async ({ page }) => {
      const errors = collectErrors(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/dev/scenes?s=${slug}`);
      await page.waitForTimeout(800);
      expect(await page.evaluate(() => (window as any).__peak.scheduler().frames)).toBe(0);
      expect(await drewSomething(page)).toBe(true);
      expect(errors).toEqual([]);
    });

    test('keeps vertical scrolling for touch', async ({ page }) => {
      await page.goto(`/dev/scenes?s=${slug}`);
      const touchAction = await page.evaluate(
        () => getComputedStyle(document.querySelector('[data-stage]')!).touchAction,
      );
      expect(touchAction).toBe('pan-y');
    });

    test('destroy leaves no listeners behind', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'uses the Chrome DevTools Protocol');
      const errors = collectErrors(page);
      await page.goto(`/dev/scenes?s=${slug}`);
      await expect
        .poll(() => page.evaluate(() => (window as any).__peak?.scheduler().frames ?? 0))
        .toBeGreaterThan(3);
      const cdp = await page.context().newCDPSession(page);
      const count = async () => {
        let total = 0;
        for (const expr of ['window', 'document', 'document.querySelector("[data-stage]")']) {
          const { result } = await cdp.send('Runtime.evaluate', { expression: expr });
          const { listeners } = await cdp.send('DOMDebugger.getEventListeners', {
            objectId: result.objectId!,
          });
          total += listeners.length;
        }
        return total;
      };
      const before = await count();
      await page.evaluate(() => (window as any).__peakDev.remount(20));
      await page.waitForTimeout(200);
      expect(await count()).toBe(before);
      const registered = await page.evaluate(() => (window as any).__peak.scheduler().registered);
      expect(registered).toBe(1);
      expect(errors).toEqual([]);
    });
  });
}
