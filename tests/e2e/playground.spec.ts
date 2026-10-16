// The scene page playground (PLAN 2.1–2.7, 2.12): controls, worlds, Shuffle and
// Cycle worlds, URL state, the prompt tab, the phone sheet and Just play.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { collectErrors } from './helpers';

const BUILT = ['particles', 'elastic', 'velocity', 'ripple', 'flow', 'warp'];

type PlaygroundState = {
  world: string;
  cycle?: string[];
  params: Record<string, number | string | boolean>;
};
const state = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __playground: { state: PlaygroundState } }).__playground.state,
  );
const ready = (page: Page) => page.waitForFunction(() => '__playground' in window);
const ground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ground'));

/** Moves a range input to a fraction of its range, the way a drag would. */
async function slide(page: Page, id: string, at: number) {
  return page.evaluate(
    ([id, at]) => {
      const r = document.querySelector<HTMLInputElement>(`[data-param="${id}"] input`)!;
      const v = Number(r.min) + (Number(r.max) - Number(r.min)) * Number(at);
      r.value = String(v);
      r.dispatchEvent(new Event('input', { bubbles: true }));
      return r.value;
    },
    [id, at] as const,
  );
}

for (const slug of BUILT) {
  test(`${slug}: page loads with a control for every setting and no errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/scenes/${slug}/`);
    await ready(page);
    const ids = Object.keys((await state(page)).params);
    const controls = await page
      .locator('[data-param]')
      .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.param));
    expect(controls.sort()).toEqual(ids.sort());
    await expect(page.locator('[data-prompt]')).not.toBeEmpty();
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('changing a slider updates the prompt at once and the URL soon after', async ({ page }) => {
    await page.goto('/scenes/ripple/');
    await ready(page);
    // The prompt is rebuilt synchronously in the input handler: well under 100ms.
    const sameTick = await page.evaluate(() => {
      const r = document.querySelector<HTMLInputElement>('[data-param="spacing"] input')!;
      r.value = r.max;
      const t0 = performance.now();
      r.dispatchEvent(new Event('input', { bubbles: true }));
      const text = document.querySelector('[data-prompt]')!.textContent!;
      return {
        ms: performance.now() - t0,
        has: text.includes(`${r.max}px`) || text.includes(r.max),
      };
    });
    expect(sameTick.has).toBe(true);
    expect(sameTick.ms).toBeLessThan(100);
    await expect(page).toHaveURL(/spacing=/);
  });

  test('tabs work with the arrow keys', async ({ page }) => {
    await page.goto('/scenes/flow/');
    await ready(page);
    await page.locator('#tab-tweak').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-prompt')).toBeFocused();
    await expect(page.locator('#tab-prompt')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#pane-prompt')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#tab-how')).toBeFocused();
  });

  test('info buttons show help text', async ({ page }) => {
    await page.goto('/scenes/particles/');
    await ready(page);
    const ctl = page.locator('[data-param="stiffness"]');
    await ctl.locator('.ctl-info').click();
    await expect(ctl.locator('.ctl-help')).toBeVisible();
    await expect(ctl.locator('.ctl-help a')).toHaveAttribute('href', /\/words#/);
  });

  test('Copy prompt copies exactly the visible text; download matches', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/scenes/warp/');
    await ready(page);
    await page.locator('#tab-prompt').click();
    await page.locator('[data-opt="detail"] [data-value="quick"]').click();
    await page.locator('[data-copy-prompt="tab"]').click();
    await expect(page.locator('[data-toast]')).toHaveText(/Prompt copied/);
    const visible = await page.locator('[data-prompt]').textContent();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(visible);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-download]').click(),
    ]);
    expect(download.suggestedFilename()).toBe('PROMPT.md');
    expect(readFileSync((await download.path())!, 'utf8')).toBe(visible);
  });

  test('Share my version round-trips params, world and the Cycle loop', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/scenes/particles/');
    await ready(page);
    await slide(page, 'density', 0.25);
    await slide(page, 'dotSize', 1);
    await page.locator('[data-param="text"] input').fill('MAYA');
    await page.locator('[data-world-id="blueprint"]').click();
    await page.locator('[data-cycle]').click();
    const before = await state(page);
    expect(before.cycle).toHaveLength(4);
    await page.locator('[data-share]').click();
    await expect(page.locator('[data-toast]')).toHaveText(/Link copied/);
    const url = await page.evaluate(() => navigator.clipboard.readText());
    expect(url).toContain('cycle=');

    const other = await context.newPage();
    await other.goto(url);
    await ready(other);
    const after = await state(other);
    expect(after.params).toEqual(before.params);
    expect(after.cycle).toEqual(before.cycle);
    await expect(other.locator('[data-param="text"] input')).toHaveValue('MAYA');
    await expect(other.locator('[data-cycle]')).toHaveAttribute('aria-checked', 'true');
  });

  test('Reset restores defaults; Surprise me keeps the text', async ({ page }) => {
    await page.goto('/scenes/particles/');
    await ready(page);
    const defaults = (await state(page)).params;
    await page.locator('[data-param="text"] input').fill('HELLO');
    await page.locator('[data-surprise]').click();
    const surprised = (await state(page)).params;
    expect(surprised.text).toBe('HELLO');
    expect(surprised).not.toEqual({ ...defaults, text: 'HELLO' });
    await page.locator('[data-reset]').click();
    expect((await state(page)).params).toEqual(defaults);
    await expect(page.locator('[data-param="text"] input')).toHaveValue(String(defaults.text));
    await expect(page).toHaveURL(/\/scenes\/particles\/$/);
  });

  test('picking a world re-themes the page; custom colors work', async ({ page }) => {
    await page.goto('/scenes/elastic/');
    await ready(page);
    const start = await ground(page);
    await page.locator('[data-world-id="lava"]').click();
    await expect.poll(() => ground(page)).not.toBe(start);
    await expect(page).toHaveURL(/w=lava/);
    await page.locator('[data-world-id="custom"]').click();
    await expect(page.locator('[data-custom]')).toBeVisible();
    await page.locator('[data-custom-key="ground"]').fill('#123456');
    await expect.poll(() => ground(page)).toBe('#123456');
    await expect(page).toHaveURL(/w=custom&g=123456/);
  });

  test('Shuffle world always picks a different world', async ({ page }) => {
    await page.goto('/scenes/flow/');
    await ready(page);
    let last = (await state(page)).world;
    for (let i = 0; i < 8; i++) {
      await page.locator('[data-shuffle-world]').click();
      const now = (await state(page)).world;
      expect(now).not.toBe(last);
      last = now;
    }
  });

  test('Cycle worlds changes the ground within 9 seconds', async ({ page }) => {
    await page.goto('/scenes/ripple/');
    await ready(page);
    await page.locator('[data-cycle]').click();
    const start = await ground(page);
    await expect.poll(() => ground(page), { timeout: 9000 }).not.toBe(start);
  });

  test('Cycle worlds and world changes are reflected in the prompt', async ({ page }) => {
    await page.goto('/scenes/warp/');
    await ready(page);
    await page.locator('#tab-prompt').click();
    const plain = await page.locator('[data-prompt]').textContent();
    await page.locator('#tab-tweak').click();
    await page.locator('[data-cycle]').click();
    const cycled = await page.locator('[data-prompt]').textContent();
    expect(cycled).not.toBe(plain);
    expect(cycled).toMatch(/crossfade/i);
  });

  test('Did it work? thanks the visitor and links to fixes', async ({ page }) => {
    await page.goto('/scenes/velocity/');
    await ready(page);
    await page.locator('#tab-prompt').click();
    await page.locator('[data-feedback="it_didnt"]').click();
    const note = page.locator('[data-feedback-note]');
    await expect(note).toContainText('Thanks, noted.');
    await expect(note.locator('a')).toHaveAttribute('href', '/fix');
  });

  test('the panel collapses and comes back', async ({ page }) => {
    await page.goto('/scenes/particles/');
    await ready(page);
    const toggle = page.locator('[data-panel-toggle]');
    await toggle.click();
    await expect(page.locator('#panel')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(page.locator('#panel')).toBeVisible();
  });

  test('Just play: F enters, Esc leaves, focus returns', async ({ page }) => {
    await page.goto('/scenes/warp/');
    await ready(page);
    await page.locator('[data-just-play]').click();
    await expect(page.locator('html')).toHaveClass(/fidget/);
    await expect(page.locator('[data-fidget-exit]')).toBeFocused();
    await expect(page.locator('#panel')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).not.toHaveClass(/fidget/);
    await expect(page.locator('[data-just-play]')).toBeFocused();
    await page.keyboard.press('f');
    await expect(page.locator('html')).toHaveClass(/fidget/);
    await page.locator('[data-fidget-exit]').click();
    await expect(page.locator('html')).not.toHaveClass(/fidget/);
  });

  test('F does nothing while typing in a text field', async ({ page }) => {
    await page.goto('/scenes/elastic/');
    await ready(page);
    await page.locator('[data-param="text"] input').fill('');
    await page.locator('[data-param="text"] input').type('ff');
    await expect(page.locator('html')).not.toHaveClass(/fidget/);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  const top = (page: Page) =>
    page.locator('#panel').evaluate((el) => el.getBoundingClientRect().top);
  /** Waits for the sheet's slide to finish, so the handle is where it will stay. */
  const settled = (page: Page) =>
    page.locator('#panel').evaluate(
      (el) =>
        new Promise<void>((done) => {
          let last = NaN;
          const check = () => {
            const now = el.getBoundingClientRect().top;
            if (now === last) return done();
            last = now;
            setTimeout(check, 60);
          };
          check();
        }),
    );

  test('the sheet peeks, opens to half and full, and closes with Esc', async ({ page }) => {
    await page.goto('/scenes/ripple/');
    await ready(page);
    const vh = page.viewportSize()!.height;
    await expect(page.locator('[data-copy-prompt="peek"]')).toBeVisible();
    await expect(page.locator('#tab-prompt')).toBeVisible();
    await expect.poll(() => top(page)).toBeGreaterThan(vh - 80);

    await page.locator('#tab-tweak').click();
    await expect(page.locator('#panel')).toHaveAttribute('data-sheet', 'half');
    await expect.poll(() => top(page)).toBeLessThan(vh * 0.6);
    await settled(page);

    // Drag the handle to the top: full.
    const handle = await page.locator('[data-sheet-handle]').boundingBox();
    await page.mouse.move(handle!.x + handle!.width / 2, handle!.y + 5);
    await page.mouse.down();
    await page.mouse.move(handle!.x + handle!.width / 2, 60, { steps: 12 });
    await page.mouse.up();
    await expect(page.locator('#panel')).toHaveAttribute('data-sheet', 'full');

    await page.keyboard.press('Escape');
    await expect(page.locator('#panel')).not.toHaveAttribute('data-sheet', /./);
    await expect.poll(() => top(page)).toBeGreaterThan(vh - 80);
  });

  test('a swipe down on the handle closes the sheet', async ({ page }) => {
    await page.goto('/scenes/flow/');
    await ready(page);
    await page.locator('#tab-prompt').click();
    await expect(page.locator('#panel')).toHaveAttribute('data-sheet', 'half');
    await settled(page);
    const handle = await page.locator('[data-sheet-handle]').boundingBox();
    const x = handle!.x + handle!.width / 2;
    await page.mouse.move(x, handle!.y + 5);
    await page.mouse.down();
    await page.mouse.move(x, page.viewportSize()!.height - 10, { steps: 12 });
    await page.mouse.up();
    await expect(page.locator('#panel')).not.toHaveAttribute('data-sheet', /./);
  });

  test('when peeking, the sheet leaves the stage free', async ({ page }) => {
    await page.goto('/scenes/ripple/');
    await ready(page);
    const vw = page.viewportSize()!.width;
    const vh = page.viewportSize()!.height;
    await expect
      .poll(() =>
        page.evaluate(
          ([x, y]) => !!document.elementFromPoint(x!, y!)?.closest('[data-stage]'),
          [vw / 2, vh - 120],
        ),
      )
      .toBe(true);
  });

  test('focus stays inside the open sheet', async ({ page }) => {
    await page.goto('/scenes/warp/');
    await ready(page);
    await page.locator('#tab-how').click();
    await page.locator('#tab-how').focus();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#panel'))).toBe(true);
    }
  });

  test('the world swatches are one swipeable row', async ({ page }) => {
    await page.goto('/scenes/particles/');
    await ready(page);
    const tops = await page
      .locator('[data-world-id]')
      .evaluateAll(
        (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size,
      );
    expect(tops).toBe(1);
  });
});
