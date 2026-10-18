import { expect, test, type Page } from '@playwright/test';

// PLAN 9.2: automated accessibility checks on every route (no extra packages).
const ROUTES = [
  '/',
  '/gallery',
  '/tour',
  '/start',
  '/fix',
  '/ship',
  '/words',
  '/drops',
  '/drops/hello-peak',
  '/about',
  '/scenes/particles',
  '/scenes/tilt',
  '/scenes/countdown',
  '/missing-page',
];

async function audit(page: Page) {
  return page.evaluate(() => {
    const out: Record<string, string[]> = {
      names: [],
      headings: [],
      ids: [],
      images: [],
      landmarks: [],
    };
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]');
    };
    const nameOf = (el: Element): string => {
      const h = el as HTMLElement;
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby)
        return labelledby
          .split(' ')
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
      if (el.getAttribute('aria-label')) return el.getAttribute('aria-label')!.trim();
      if (h.id) {
        const l = document.querySelector(`label[for="${CSS.escape(h.id)}"]`);
        if (l?.textContent?.trim()) return l.textContent.trim();
      }
      if (el.closest('label')?.textContent?.trim()) return el.closest('label')!.textContent!.trim();
      if (el.getAttribute('title')) return el.getAttribute('title')!.trim();
      return (
        (h.textContent ?? '').trim() || (el.querySelector('img[alt]')?.getAttribute('alt') ?? '')
      );
    };
    for (const el of document.querySelectorAll(
      'a[href], button, input, select, textarea, [role="button"], [role="tab"], [role="slider"]',
    )) {
      if (!visible(el)) continue;
      if ((el as HTMLInputElement).type === 'hidden') continue;
      if (!nameOf(el))
        out.names!.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`);
    }
    // Headings: exactly one h1 (a sr-only one counts) and no skipped levels.
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible.bind(null));
    const all = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    if (all.filter((h) => h.tagName === 'H1').length !== 1)
      out.headings!.push(`h1 count ${all.filter((h) => h.tagName === 'H1').length}`);
    let prev = 0;
    for (const h of all) {
      const lvl = Number(h.tagName[1]);
      if (prev && lvl > prev + 1)
        out.headings!.push(`${h.tagName} after h${prev}: ${h.textContent?.trim().slice(0, 30)}`);
      prev = lvl;
    }
    void hs;
    const seen = new Set<string>();
    for (const el of document.querySelectorAll('[id]')) {
      if (seen.has(el.id)) out.ids!.push(el.id);
      seen.add(el.id);
    }
    for (const img of document.querySelectorAll('img'))
      if (!img.hasAttribute('alt')) out.images!.push(img.src);
    if (!document.querySelector('main, [role="main"]')) out.landmarks!.push('no main');
    if (!document.documentElement.lang) out.landmarks!.push('no lang');
    return out;
  });
}

for (const route of ROUTES) {
  test(`a11y ${route}: names, heading order, unique ids, alt text, landmarks`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(500);
    const r = await audit(page);
    expect(r, JSON.stringify(r)).toEqual({
      names: [],
      headings: [],
      ids: [],
      images: [],
      landmarks: [],
    });
  });
}

test('keyboard: Tab reaches the first controls on each page and focus is visible', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit skips links when tabbing by default; the desktop run covers this',
  );
  for (const route of ['/', '/gallery', '/words', '/scenes/particles', '/start']) {
    await page.goto(route);
    const bad: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ring =
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow !== 'none';
        return { tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 20), ring };
      });
      if (info && !info.ring) bad.push(`${route}: ${info.tag} ${info.text}`);
    }
    expect(bad).toEqual([]);
  }
});
