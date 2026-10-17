import { expect, test } from '@playwright/test';

const rotation = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const card = [...document.querySelectorAll<HTMLElement>('[data-stage] *')].find((e) =>
      e.style.transform.includes('rotateX'),
    )!;
    const m = /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/.exec(card.style.transform);
    return { x: Number(m![1]), y: Number(m![2]) };
  });

test.describe('tilt', () => {
  test('the card turns toward the pointer and settles', async ({ page, isMobile }) => {
    test.skip(isMobile, 'needs a mouse');
    await page.goto('/dev/scenes?s=tilt');
    await page.waitForTimeout(600);
    const box = (await page.locator('[data-stage]').boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.1, { steps: 4 });
    await page.waitForTimeout(1200);
    const r = await rotation(page);
    expect(r.y).toBeGreaterThan(5);
    expect(r.x).toBeGreaterThan(5);
    expect(r.y).toBeLessThanOrEqual(14.5);
  });

  test('no motion button unless "Follow phone tilt" is on', async ({ page }) => {
    await page.goto('/dev/scenes?s=tilt');
    await page.waitForTimeout(400);
    await expect(page.getByRole('button', { name: 'Use motion' })).toHaveCount(0);
  });
});
