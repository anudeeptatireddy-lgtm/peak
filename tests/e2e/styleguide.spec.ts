import { expect, test } from '@playwright/test';

test('styleguide shows every world and all text passes contrast', async ({ page }) => {
  await page.goto('/dev/styleguide');
  await expect(page.locator('.world')).toHaveCount(17);

  const failures = await page.evaluate(() => {
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) throw new Error(`Unexpected color ${c}`);
      return m[1]!.split(',').map((v) => parseFloat(v));
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    const ratio = (a: string, b: string) => {
      const la = lum(parse(a));
      const lb = lum(parse(b));
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-check]')) {
      const card = el.closest<HTMLElement>('.world')!;
      const r = ratio(getComputedStyle(el).color, getComputedStyle(card).backgroundColor);
      if (r < Number(el.dataset.check))
        out.push(`${card.dataset.world}: ${el.textContent?.trim()} ${r.toFixed(2)}`);
    }
    return out;
  });
  expect(failures).toEqual([]);
});
