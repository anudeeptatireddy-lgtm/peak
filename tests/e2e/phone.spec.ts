// Phone readiness (owner, 2026-10-17): on a phone nothing scrolls sideways, every
// tap target is at least 44px, the controls fit the screen, and a scene's stage
// ends where the bottom sheet starts so nothing important hides behind it.
import { expect, test } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SCENES_DIR = join(process.cwd(), 'src/scenes');
const SCENE_SLUGS = readdirSync(SCENES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(SCENES_DIR, d.name, 'index.ts')))
  .map((d) => d.name);

const PAGES = ['/', '/gallery', '/tour', '/start', '/fix', '/ship', '/words', '/drops'];
const PEEK = 72;

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'mobile', 'phone only');
});

async function audit(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const vw = innerWidth;
    const shown = (e: Element) => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
    };
    const small: string[] = [];
    for (const e of document.querySelectorAll(
      'a[href],button,input,select,textarea,summary,[role=button],[role=tab],[role=switch],[role=radio]',
    )) {
      if (!shown(e) || /skip to content/i.test(e.textContent ?? '')) continue;
      // Inside a closed <details> only its summary can be tapped.
      const closed = e.closest('details:not([open])');
      if (closed && e.tagName !== 'SUMMARY') continue;
      const r = e.getBoundingClientRect();
      const inText =
        e.tagName === 'A' && !!e.closest('p,li,dd,td') && getComputedStyle(e).display === 'inline';
      if (!inText && (r.width < 43.5 || r.height < 43.5))
        small.push(
          `${e.tagName}#${e.id} ${(e.textContent || e.className).trim().slice(0, 24)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`,
        );
    }
    const pane = document.querySelector('.pane:not([hidden])');
    const stage = document.querySelector<HTMLElement>('[data-stage-wrap]');
    return {
      overflow: document.documentElement.scrollWidth - vw,
      small,
      paneWidth: pane ? pane.getBoundingClientRect().width : 0,
      vw,
      stageBottom: stage ? stage.getBoundingClientRect().bottom + scrollY : 0,
      vh: innerHeight,
    };
  });
}

for (const path of PAGES) {
  test(`phone: ${path} fits and is easy to tap`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(400);
    const r = await audit(page);
    expect(r.overflow, 'sideways overflow').toBeLessThanOrEqual(1);
    expect(r.small, 'tap targets under 44px').toEqual([]);
  });
}

for (const slug of SCENE_SLUGS) {
  test(`phone: scene ${slug} fits, is easy to tap and fills the screen above the sheet`, async ({
    page,
  }) => {
    await page.goto(`/scenes/${slug}`);
    await page.waitForTimeout(500);
    const r = await audit(page);
    expect(r.overflow, 'sideways overflow').toBeLessThanOrEqual(1);
    expect(r.small, 'tap targets under 44px').toEqual([]);
    expect(r.paneWidth, 'controls wider than the screen').toBeLessThanOrEqual(r.vw);
    expect(r.stageBottom, 'stage runs under the bottom sheet').toBeLessThanOrEqual(r.vh - PEEK + 1);
  });
}
