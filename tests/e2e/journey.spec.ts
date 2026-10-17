import { collectErrors } from './helpers';
import { expect, test, type Page } from '@playwright/test';

const cssVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

const scrollToSection = async (page: Page, index: number) => {
  await page.evaluate((i) => {
    const s = document.querySelectorAll<HTMLElement>('[data-journey]')[i]!;
    window.scrollTo({ top: s.offsetTop, behavior: 'instant' });
  }, index);
  await page.waitForTimeout(250);
};

test('home loads without console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test('--ground changes from world to world as you scroll', async ({ page }) => {
  await page.goto('/');
  const grounds: string[] = [];
  const count = await page.locator('[data-journey]').count();
  expect(count).toBe(15);
  for (let i = 0; i < count; i++) {
    await scrollToSection(page, i);
    grounds.push(await cssVar(page, '--ground'));
  }
  expect(grounds.slice(0, 3)).toEqual(['#FFE3F1', '#E8C9A0', '#1E1412']);
  expect(new Set(grounds).size).toBe(13); // 12 featured worlds + Matcha (three sections)
});

test('blends smoothly between neighbors (no hard cuts)', async ({ page }) => {
  await page.goto('/');
  const vh = await page.evaluate(() => window.innerHeight);
  const values: string[] = [];
  for (let y = vh * 0.3; y <= vh * 0.7; y += vh * 0.025) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(40);
    values.push(await cssVar(page, '--ground'));
  }
  // Dreamhouse → Spice Dunes passes through several in-between colors.
  expect(new Set(values).size).toBeGreaterThan(4);
});

test('only on-screen scenes run', async ({ page }) => {
  await page.goto('/');
  await scrollToSection(page, 4);
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => (window as any).__peak.scheduler());
  expect(info.running).toBeLessThanOrEqual(2);
  expect(info.registered).toBeGreaterThan(info.running);
});

test('header and caption text stay readable at 50 scroll positions', async ({ page }, testInfo) => {
  await page.goto('/');
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const failures: string[] = [];
  for (let i = 0; i < 50; i++) {
    const y = Math.round((max * i) / 49);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(30);
    const res = await page.evaluate(() => {
      const lum = (hex: string) => {
        const n = parseInt(hex.replace('#', ''), 16);
        const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
      };
      const ratio = (a: string, b: string) => {
        const la = lum(a);
        const lb = lum(b);
        return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      };
      const cs = getComputedStyle(document.documentElement);
      const v = (n: string) => cs.getPropertyValue(n).trim();
      return {
        ink: ratio(v('--ink'), v('--ground')),
        soft: ratio(v('--ink-soft'), v('--ground')),
        accent: ratio(v('--accent-text'), v('--ground')),
      };
    });
    if (res.ink < 4.5 || res.soft < 4.5 || res.accent < 3)
      failures.push(`y=${y}: ${JSON.stringify(res)}`);
    if (i % 8 === 0 && !testInfo.project.name.includes('mobile'))
      await page.screenshot({ path: testInfo.outputPath(`journey-${i}.png`) });
  }
  expect(failures).toEqual([]);
});

test('world rail marks the active section and jumps on click', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the rail is hidden under 700px');
  await page.goto('/');
  await scrollToSection(page, 2);
  await expect(page.locator('[data-rail-dot="2"]')).toHaveAttribute('aria-current', 'true');
  await page.getByRole('link', { name: 'Go to Ripple background' }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#s-ripple');
});
